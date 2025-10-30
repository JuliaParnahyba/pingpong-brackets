import type { MatchScore, ServingMode, TournamentConfig } from "../store/tournament";

export function newScore(cfg: TournamentConfig): MatchScore {
  return {
    pointsA: 0,
    pointsB: 0,
    setsWonA: 0,
    setsWonB: 0,
    currentSetPointsA: 0,
    currentSetPointsB: 0,
    history: [],
    whoServes: "A",
    servesLeftInTurn: cfg.servingMode === "two_in_row" ? 2 : 1,
  };
}

function nextServerOnPoint(prev: MatchScore, cfg: TournamentConfig, scorer: "A" | "B") {
  const mode: ServingMode = cfg.servingMode;

  if (mode === "score_serves") {
    return { whoServes: scorer, servesLeftInTurn: 1 };
  }

  // two_in_row: decrementa; ao zerar, troca saque
  let who = prev.whoServes;
  let left = prev.servesLeftInTurn - 1;
  if (left <= 0) {
    who = prev.whoServes === "A" ? "B" : "A";
    left = 2;
  }
  return { whoServes: who, servesLeftInTurn: left };
}

export function addPoint(score: MatchScore, cfg: TournamentConfig, who: "A" | "B"): MatchScore {
  const s = structuredClone(score);

  if (!cfg.sets.enabled) {
    if (who === "A") s.pointsA++; else s.pointsB++;
    const ns = nextServerOnPoint(s, cfg, who);
    s.history.push({ a: s.pointsA, b: s.pointsB, whoServes: ns.whoServes, servesLeftInTurn: ns.servesLeftInTurn });
    s.whoServes = ns.whoServes;
    s.servesLeftInTurn = ns.servesLeftInTurn;
    return s;
  }

  // modo sets
  if (who === "A") s.currentSetPointsA++; else s.currentSetPointsB++;
  const ns = nextServerOnPoint(s, cfg, who);
  s.history.push({ a: s.currentSetPointsA, b: s.currentSetPointsB, whoServes: ns.whoServes, servesLeftInTurn: ns.servesLeftInTurn });
  s.whoServes = ns.whoServes;
  s.servesLeftInTurn = ns.servesLeftInTurn;
  return s;
}

export function checkWin(score: MatchScore, cfg: TournamentConfig): { finished: boolean; winner: "A" | "B" | null; setFinished?: boolean } {
  const diff = (x: number, y: number) => Math.abs(x - y);
  const need2 = cfg.winByTwo;

  if (!cfg.sets.enabled) {
    const target = cfg.targetPoints;
    if ((score.pointsA >= target || score.pointsB >= target) && (!need2 || diff(score.pointsA, score.pointsB) >= 2)) {
      return { finished: true, winner: score.pointsA > score.pointsB ? "A" : "B" };
    }
    return { finished: false, winner: null };
  }

  // sets
  const target = cfg.sets.pointsPerSet;
  const a = score.currentSetPointsA, b = score.currentSetPointsB;
  if ((a >= target || b >= target) && (!need2 || diff(a, b) >= 2)) {
    const setWinner = a > b ? "A" : "B";
    // ainda não terminou a partida, apenas o set
    const majority = Math.floor(cfg.sets.bestOf / 2) + 1;
    const setsWonA = score.setsWonA + (setWinner === "A" ? 1 : 0);
    const setsWonB = score.setsWonB + (setWinner === "B" ? 1 : 0);
    if (setsWonA >= majority) return { finished: true, winner: "A", setFinished: true };
    if (setsWonB >= majority) return { finished: true, winner: "B", setFinished: true };
    return { finished: false, winner: setWinner, setFinished: true };
  }

  return { finished: false, winner: null };
}

export function applySetWin(score: MatchScore, setWinner: "A" | "B") {
  const s = structuredClone(score);
  if (setWinner === "A") s.setsWonA++; else s.setsWonB++;
  s.currentSetPointsA = 0;
  s.currentSetPointsB = 0;
  // mantém whoServes/servesLeftInTurn (ou poderíamos alternar por regra)
  s.history = []; // zera histórico do set corrente (opcional)
  return s;
}
