import type { Match, Player } from "../store/tournament";

export type StandingRow = {
  playerId: string;
  name: string;
  matches: number;
  wins: number;         // vitórias de partidas
  setsFor: number;      // soma de sets vencidos (modo sets)
  setsAgainst: number;  // soma de sets perdidos (modo sets)
  pointsFor: number;    // soma de pontos (jogo único)
  pointsAgainst: number;
  setDiff: number;      // setsFor - setsAgainst
  pointDiff: number;    // pointsFor - pointsAgainst
};

function h2hWinnerId(classMatches: Match[], aId: string, bId: string): string | null {
  const m = classMatches.find(
    (x) =>
      x.status === "finished" &&
      ((x.playerA?.id === aId && x.playerB?.id === bId) ||
       (x.playerA?.id === bId && x.playerB?.id === aId))
  );
  return m?.winnerId ?? null;
}

/** Computa a classificação da fase "classification".
 *  - useSets = true → prioriza setDiff como desempate
 *  - useSets = false → prioriza pointDiff como desempate
 */
export function computeStandings(
  players: Player[],
  matches: Match[],
  useSets: boolean
): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  for (const p of players) {
    rows.set(p.id, {
      playerId: p.id,
      name: p.name,
      matches: 0,
      wins: 0,
      setsFor: 0,
      setsAgainst: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      setDiff: 0,
      pointDiff: 0,
    });
  }

  const classMatches = matches.filter((m) => m.phase === "classification" && m.status === "finished");

  for (const m of classMatches) {
    const a = m.playerA?.id; const b = m.playerB?.id;
    if (!a || !b) continue;
    const A = rows.get(a)!; const B = rows.get(b)!;

    A.matches++; B.matches++;

    if (useSets) {
      A.setsFor += m.score.setsWonA;
      A.setsAgainst += m.score.setsWonB;
      B.setsFor += m.score.setsWonB;
      B.setsAgainst += m.score.setsWonA;
    } else {
      A.pointsFor += m.score.pointsA; A.pointsAgainst += m.score.pointsB;
      B.pointsFor += m.score.pointsB; B.pointsAgainst += m.score.pointsA;
    }

    if (m.winnerId === a) A.wins++;
    else if (m.winnerId === b) B.wins++;
  }

  // difs
  for (const r of rows.values()) {
    r.setDiff = r.setsFor - r.setsAgainst;
    r.pointDiff = r.pointsFor - r.pointsAgainst;
  }

  const arr = Array.from(rows.values());

  // ordenação: wins desc → (useSets? setDiff : pointDiff) desc → outro diff desc → H2H → nome
  arr.sort((r1, r2) => {
    if (r2.wins !== r1.wins) return r2.wins - r1.wins;

    const primaryDiff = useSets ? (r2.setDiff - r1.setDiff) : (r2.pointDiff - r1.pointDiff);
    if (primaryDiff !== 0) return primaryDiff;

    const secondaryDiff = useSets ? (r2.pointDiff - r1.pointDiff) : (r2.setDiff - r1.setDiff);
    if (secondaryDiff !== 0) return secondaryDiff;

    // confronto direto (se houver 1 jogo entre eles)
    const w = h2hWinnerId(classMatches, r1.playerId, r2.playerId);
    if (w) {
      if (w === r1.playerId) return -1;
      if (w === r2.playerId) return 1;
    }

    return r1.name.localeCompare(r2.name);
  });

  return arr;
}
