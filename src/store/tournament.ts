import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "../utils/id";

function fillSlot(target: Match, slot: "A" | "B", player: Player): Match {
  return slot === "A" ? { ...target, playerA: player } : { ...target, playerB: player };
}

function patchMatch(list: Match[], id: string, patch: (m: Match) => Match): Match[] {
  return list.map(m => (m.id === id ? patch(m) : m));
}

/** Modo de saque:
 * - "two_in_row": o saque troca a cada 2 pontos somados (regra clássica simplificada).
 * - "score_serves": quem fez o ponto saca o próximo ponto.
 */
export type ServingMode = "two_in_row" | "score_serves";

export type Player = { id: string; name: string };

export type SetsConfig = {
  enabled: boolean;         // false = jogo único por pontos
  bestOf: 3 | 5;            // melhor de 3 ou 5 sets
  pointsPerSet: number;     // ex.: 11 ou 12
};

export type TournamentConfig = {
  name: string;
  classification: "round_robin"; // por enquanto sempre todos vs todos
  winByTwo: boolean;             // sempre true p/ nossa regra
  targetPoints: number;          // se não usar sets
  sets: SetsConfig;              // se enabled=true, usa sets
  servingMode: ServingMode;
  knockoutSlots: 2 | 4 | 8 | 16; // teto de vagas para a fase eliminatória
};

export type MatchPhase = "classification" | "finals" | "training";

export type MatchScore = {
  // jogo único (quando sets.enabled = false)
  pointsA: number;
  pointsB: number;

  // sets (quando enabled = true)
  setsWonA: number;
  setsWonB: number;
  currentSetPointsA: number;
  currentSetPointsB: number;

  // histórico simples p/ undo futuro
  history: Array<{ a: number; b: number; whoServes: "A" | "B"; servesLeftInTurn: number }>;
  whoServes: "A" | "B";
  servesLeftInTurn: number; // p/ "two_in_row" (2 → 1 → troca)
};

export type SlotAB = "A" | "B";
export type AdvanceLink = { matchId: string; slot: SlotAB };

export type Match = {
  id: string;
  phase: MatchPhase;
  round: number;                 // rodada da classificação; finais usam 999/1000
  tableLabel?: string;           // "Final", "3º Lugar", etc.
  playerA?: Player;
  playerB?: Player;
  score: MatchScore;
  winnerId?: string;
  status: "scheduled" | "live" | "finished";

  // para “encadear” vencedoras/perdedoras
  meta?: {
    winnerTo?: AdvanceLink; // para onde vai a vencedora (match/slot)
    loserTo?: AdvanceLink;  // para onde vai a perdedora (match/slot)
  };
};

type TournamentState = {
  players: Player[];
  config: TournamentConfig;
  matches: Match[];             // classificação + finais (quando houver)
  setPlayers: (players: Player[]) => void;
  setConfig: (cfg: Partial<TournamentConfig>) => void;
  setMatches: (mx: Match[]) => void;
  reset: () => void;
  updateMatchScore: (id: string, updater: (s: MatchScore) => MatchScore) => void;
  finishMatch: (id: string, winnerId: string) => void;
};

const defaultConfig: TournamentConfig = {
  name: "Copa das Amigas",
  classification: "round_robin",
  winByTwo: true,
  targetPoints: 12,
  sets: { enabled: false, bestOf: 3, pointsPerSet: 11 },
  servingMode: "two_in_row",
  knockoutSlots: 4,
};


export const useTournament = create<TournamentState>()(
  persist(
    (set, _get) => ({
      players: [],
      config: defaultConfig,
      matches: [],
      setPlayers: (players) => set({ players }),
      setConfig: (cfg) =>
        set((s) => ({
          config: { ...s.config, ...cfg, sets: { ...s.config.sets, ...(cfg.sets ?? {}) } },
        })),
      setMatches: (mx) => set({ matches: mx }),
      reset: () => set({ players: [], config: defaultConfig, matches: [] }),

      updateMatchScore: (id, updater) =>
        set((s) => ({
          matches: s.matches.map((m): Match =>
            m.id === id
              ? {
                  ...m,
                  status: (m.status === "scheduled" ? "live" : m.status) as Match["status"],
                  score: updater(structuredClone(m.score)),
                }
              : m
          ),
        })),

      finishMatch: (id, winnerId) => {
        set((s) => {
          // 1) fecha a partida (garante Match no map + literal no status)
          let updated = s.matches.map((m): Match =>
            m.id === id ? { ...m, winnerId, status: "finished" as const } : m
          );

          // 2) se for semifinal, promover vencedora/perdedora
          const semi = updated.find(
            (m) => m.id === id && m.phase === "finals" && m.tableLabel?.startsWith("Semifinal")
          ) as Match | undefined;
          if (semi?.meta) {
            const aId = semi.playerA?.id;
            const bId = semi.playerB?.id;
            const loserId = winnerId === aId ? bId : aId;
            const winner = s.players.find((p) => p.id === winnerId);
            const loser  = s.players.find((p) => p.id === loserId);
            if (semi.meta.winnerTo && winner) {
              const { matchId, slot } = semi.meta.winnerTo;
              updated = patchMatch(updated, matchId, (mm) => fillSlot(mm, slot, winner));
            }
            if (semi.meta.loserTo && loser) {
              const { matchId, slot } = semi.meta.loserTo;
              updated = patchMatch(updated, matchId, (mm) => fillSlot(mm, slot, loser));
            }
          }

          // também cobre Quartas → Semis (winnerTo nas QFs)
          const qf = updated.find(
            (m) => m.id === id && m.phase === "finals" && m.tableLabel?.startsWith("Quartas")
          ) as Match | undefined;
          if (qf?.meta?.winnerTo) {
            const winner = s.players.find((p) => p.id === winnerId);
            if (winner) {
              const { matchId, slot } = qf.meta.winnerTo;
              updated = patchMatch(updated, matchId, (mm) => fillSlot(mm, slot, winner));
            }
          }
          
          return { matches: updated };
        });
      },
    }),
    {
      name: "ppb-tournament-v1",
      version: 1,
      // o storage guarda o estado PARCIAL
      storage: createJSONStorage<Partial<TournamentState>>(() => localStorage),
      partialize: (s) => ({ players: s.players, config: s.config, matches: s.matches }),
      migrate: (persisted, from) => {
      // futuros ajustes por versão
      return persisted as Partial<TournamentState>;
      },
      onRehydrateStorage: () => (state) => {
        // útil para debug
        // console.log("rehydrated", state);
      },
    }
  )
);

export const newPlayer = (name = ""): Player => ({ id: nanoid(), name });

export const clearPersistedTournament = () => {
  localStorage.removeItem("ppb-tournament-v1");
};