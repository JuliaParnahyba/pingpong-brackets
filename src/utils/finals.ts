import type { StandingRow } from "./standings";
import type { Match, Player, TournamentConfig, SlotAB } from "../store/tournament";
import { newScore } from "./serve";
import { nanoid } from "./id";

/** Escolhe quantas jogadoras entram no mata-mata */
function chooseSlots(n: number, cfg: TournamentConfig): 2 | 4 | 8 | 16 {
  // Regra: 3 → 2 (final direta). Para N≥4: usa teto knockoutSlots mas nunca maior que N.
  if (n === 3) return 2;
  const allowed: Array<2 | 4 | 8 | 16> = [16, 8, 4, 2];
  for (const p of allowed) {
    if (p <= cfg.knockoutSlots && p <= n) return p;
  }
  return 2;
}

/** Gera partidas de mata-mata a partir do ranking (já ordenado) */
export function buildKnockoutFromStandings(
  standing: StandingRow[],
  players: Player[],
  cfg: TournamentConfig
): Match[] {
  const n = standing.length;
  if (n < 2) return [];

  const slots = chooseSlots(n, cfg);
  const seeds = standing.slice(0, slots); // top seeds

  const findPlayer = (id: string) => players.find(p => p.id === id);

  const mk = (label: string, a?: Player, b?: Player): Match => ({
    id: nanoid(),
    phase: "finals",
    round: 999,                 // usamos 999 só pra separar da classificação
    tableLabel: label,
    playerA: a,
    playerB: b,
    score: newScore(cfg),
    status: "scheduled",
  });

  // ---- Casos
  if (slots === 2) {
    // Final direta: S1 x S2
    const A = findPlayer(seeds[0].playerId);
    const B = findPlayer(seeds[1].playerId);
    return [mk("Final", A, B)];
  }

  if (slots === 4) {
    // Semis: (1×4) e (2×3), + 3º lugar (sem jogadoras por enquanto)
    const A1 = findPlayer(seeds[0].playerId);
    const B1 = findPlayer(seeds[3].playerId);
    const A2 = findPlayer(seeds[1].playerId);
    const B2 = findPlayer(seeds[2].playerId);

    const semi1 = mk("Semifinal 1", A1, B1);
    const semi2 = mk("Semifinal 2", A2, B2);
    const third = mk("3º lugar");    // será preenchido depois (perdedoras das semis)
    const final = mk("Final");       // será preenchida depois (vencedoras das semis)

    // encadeamento: vencedoras → final (A/B); perdedoras → 3º (A/B)
    semi1.meta = { winnerTo: { matchId: final.id, slot: "A" as SlotAB },
                   loserTo:  { matchId: third.id, slot: "A" as SlotAB } };
    semi2.meta = { winnerTo: { matchId: final.id, slot: "B" as SlotAB },
                   loserTo:  { matchId: third.id, slot: "B" as SlotAB } };

    return [semi1, semi2, third, final];
  }

  // (Opcional) slots === 8 — Quartas: 1×8, 4×5, 3×6, 2×7 + Semis/3º/Final
  // Mantive comentado para não alongar. Se quiser ativamos já.
  // ...

  return [];
}

