import { create } from "zustand";
import { nanoid } from "../utils/id";

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
};

export const useTournament = create<TournamentState>((set) => ({
  players: [],
  config: defaultConfig,
  matches: [],
  setPlayers: (players) => set({ players }),
  setConfig: (cfg) =>
    set((s) => ({
      config: {
        ...s.config,
        ...cfg,
        sets: { ...s.config.sets, ...(cfg.sets ?? {}) },
      },
    })),
  setMatches: (mx) => set({ matches: mx }),
  reset: () => set({ players: [], config: defaultConfig, matches: [] }),
  updateMatchScore: (id, updater) =>
    set((s) => ({
      matches: s.matches.map((m) =>
        m.id === id
          ? {
              ...m,
              status: m.status === "scheduled" ? "live" : m.status,
              score: updater(structuredClone(m.score)),
            }
          : m
      ),
    })),
  finishMatch: (id, winnerId) =>
    set((s) => ({
      matches: s.matches.map((m) =>
        m.id === id ? { ...m, winnerId, status: "finished" } : m
      ),
    })),
}));

export const newPlayer = (name = ""): Player => ({ id: nanoid(), name });
