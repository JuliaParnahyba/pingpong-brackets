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
  let who = prev.whoServes;
  let left = prev.servesLeftInTurn - 1;
  if (left <= 0) {
    who = prev.whoServes === "A" ? "B" : "A";
    left = 2;
  }
  return { whoServes: who, servesLeftInTurn: left };
}

export function addPoint(score: MatchScore, cfg: TournamentConfig, who: "A"|"B"): MatchScore {
  const s = structuredClone(score);
  if (!cfg.sets.enabled) {
    if (who === "A") s.pointsA++; else s.pointsB++;
    const ns = nextServerOnPoint(s, cfg, who);
    s.history.push({ a: s.pointsA, b: s.pointsB, whoServes: ns.whoServes });
    s.whoServes = ns.whoServes;
    s.servesLeftInTurn = ns.servesLeftInTurn;
    return s;
  }
  if (who === "A") s.currentSetPointsA++; else s.currentSetPointsB++;
  const ns = nextServerOnPoint(s, cfg, who);
  s.history.push({ a: s.currentSetPointsA, b: s.currentSetPointsB, whoServes: ns.whoServes });
  s.whoServes = ns.whoServes;
  s.servesLeftInTurn = ns.servesLeftInTurn;
  return s;
}
