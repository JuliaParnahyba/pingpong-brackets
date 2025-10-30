import type { Match, Player } from "../store/tournament";

export type Row = {
  player: Player;
  matches: number;
  wins: number;      // se sem sets: vitórias de jogo
  setsWon: number;   // se com sets: soma de sets
  setsLost: number;
  pointsFor: number; // somatório de pontos marcados
  pointsAgainst: number;
};

export function computeStandings(players: Player[], matches: Match[], useSets: boolean): Row[] {
  const map = new Map<string, Row>();
  for (const p of players) {
    map.set(p.id, { player: p, matches: 0, wins: 0, setsWon: 0, setsLost: 0, pointsFor: 0, pointsAgainst: 0 });
  }

  for (const m of matches.filter(m => m.phase === "classification" && m.status === "finished")) {
    if (!m.playerA || !m.playerB) continue;
    const A = map.get(m.playerA.id)!;
    const B = map.get(m.playerB.id)!;
    A.matches++; B.matches++;

    if (useSets) {
      A.setsWon += m.score.setsWonA;
      A.setsLost += m.score.setsWonB;
      B.setsWon += m.score.setsWonB;
      B.setsLost += m.score.setsWonA;
      if (m.winnerId === m.playerA.id) A.wins++; else if (m.winnerId === m.playerB.id) B.wins++;
      // pontos do último set podem não estar salvos; aqui focamos em sets
    } else {
      // jogo único por pontos
      A.pointsFor += m.score.pointsA; A.pointsAgainst += m.score.pointsB;
      B.pointsFor += m.score.pointsB; B.pointsAgainst += m.score.pointsA;
      if (m.winnerId === m.playerA.id) A.wins++; else if (m.winnerId === m.playerB.id) B.wins++;
    }
  }

  const rows = Array.from(map.values());
  // ordenação: setsWon/wins desc, saldo sets/pts, saldo geral, alfabética
  rows.sort((r1, r2) => {
    const primary = (useSets ? (r2.setsWon - r1.setsWon) : (r2.wins - r1.wins));
    if (primary !== 0) return primary;
    const sec = (useSets ? (r2.setsWon - r2.setsLost) - (r1.setsWon - r1.setsLost)
                         : (r2.pointsFor - r2.pointsAgainst) - (r1.pointsFor - r1.pointsAgainst));
    if (sec !== 0) return sec;
    return r1.player.name.localeCompare(r2.player.name);
  });
  return rows;
}

export function buildFinalsFromStandings(rows: Row[]): Match[] {
  if (rows.length >= 4) {
    const [p1, p2, p3, p4] = rows;
    return [
      {
        id: crypto.randomUUID(),
        phase: "finals",
        round: 999,
        tableLabel: "Final",
        playerA: p1.player,
        playerB: p2.player,
        score: { pointsA:0, pointsB:0, setsWonA:0, setsWonB:0, currentSetPointsA:0, currentSetPointsB:0, history:[], whoServes:"A", servesLeftInTurn:2 },
        status: "scheduled",
      },
      {
        id: crypto.randomUUID(),
        phase: "finals",
        round: 1000,
        tableLabel: "3º Lugar",
        playerA: p3.player,
        playerB: p4.player,
        score: { pointsA:0, pointsB:0, setsWonA:0, setsWonB:0, currentSetPointsA:0, currentSetPointsB:0, history:[], whoServes:"A", servesLeftInTurn:2 },
        status: "scheduled",
      },
    ] as Match[];
  }
  if (rows.length === 3) {
    const [p1, p2] = rows;
    return [{
      id: crypto.randomUUID(),
      phase: "finals",
      round: 999,
      tableLabel: "Final",
      playerA: p1.player,
      playerB: p2.player,
      score: { pointsA:0, pointsB:0, setsWonA:0, setsWonB:0, currentSetPointsA:0, currentSetPointsB:0, history:[], whoServes:"A", servesLeftInTurn:2 },
      status: "scheduled",
    }] as Match[];
  }
  // 2 jogadoras → já tratamos como treino na geração
  return [];
}
