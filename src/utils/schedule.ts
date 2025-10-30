import type { Match, Player, TournamentConfig } from "../store/tournament";
import { nanoid } from "./id";
import { newScore } from "./serve";

/** Cria a tabela de classificação (round-robin).
 *  Para n ímpar, insere BYE e ignora jogos com BYE.
 */
export function generateRoundRobin(players: Player[], cfg: TournamentConfig): Match[] {
  const n = players.length;
  if (n === 0) return [];
  if (n === 1) {
    // uma jogadora não tem oponente: sem partidas
    return [];
  }

  // 2 jogadoras → modo treino (sem rodadas, partidas subsequentes livres)
  if (n === 2) {
    return [{
      id: nanoid(),
      phase: "training",
      round: 1,
      tableLabel: "Treino",
      playerA: players[0],
      playerB: players[1],
      score: newScore(cfg),
      status: "scheduled",
    }];
  }

  // 3+ jogadoras → round-robin
  const list = [...players];
  const isOdd = list.length % 2 === 1;
  if (isOdd) list.push({ id: "BYE", name: "BYE" });

  const rounds = list.length - 1;
  const half = list.length / 2;
  const matches: Match[] = [];

  const arr = [...list];
  for (let r = 1; r <= rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[arr.length - 1 - i];
      if (a.id === "BYE" || b.id === "BYE") continue;

      matches.push({
        id: nanoid(),
        phase: "classification",
        round: r,
        playerA: a,
        playerB: b,
        score: newScore(cfg),
        status: "scheduled",
      });
    }
    // rotação (método do círculo): fixa arr[0], rotaciona o restante
    const moved = arr.splice(1, 1)[0];
    arr.push(moved);
  }

  return matches;
}
