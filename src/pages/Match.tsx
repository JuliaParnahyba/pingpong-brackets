import { useParams, Link, useNavigate } from "react-router-dom";
import { useTournament, type Match } from "../store/tournament";
import { addPoint, checkWin, applySetWin } from "../utils/serve";

// componente para movimentar a raquete para o lado de quem saca
function ServerBadge({
  isLeft,
  title,
  hint,
}: { isLeft: boolean; title: string; hint: string }) {
  return (
    <div
      className="relative inline-flex items-center justify-center min-w-[160px] px-6 py-2
                 rounded-full border border-blue-600/30 bg-blue-600/10
                 text-blue-600 dark:text-blue-300 overflow-visible"
    >
      {/* bolinha com pulso – fora do fluxo, não empurra o conteúdo */}
      <div
        className={`absolute ${isLeft ? "-left-3.5" : "-right-3.5"} h-7 w-7 grid place-items-center
                    pointer-events-none select-none transition-all duration-200`}
        aria-hidden
      >
        <div className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping [animation-duration:1400ms]" />
        <div className="relative h-7 w-7 grid place-items-center rounded-full
                        bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md ring-2 ring-white/70">
          <span className="text-base">🏓</span>
        </div>
      </div>

      {/* conteúdo 100% centralizado */}
      <div className="flex flex-col items-center justify-center w-full text-center leading-tight">
        <span className="font-medium whitespace-nowrap text-[11px]">
          {title}
        </span>
        <span className="opacity-80 text-[10px] mt-0.5 whitespace-nowrap">
          {hint}
        </span>
      </div>
    </div>
  );
}


export default function MatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, config, updateMatchScore, finishMatch } = useTournament();

  const match = matches.find((m) => m.id === id);
  if (!match) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <p className="mb-3">Partida não encontrada.</p>
        <Link className="text-blue-600 underline" to="/bracket">Voltar</Link>
      </div>
    );
  }

  const { playerA, playerB, score, status } = match;

  const handlePoint = (who: "A" | "B") => {
    if (match.status === "finished") return;

    updateMatchScore(match.id, (s) => addPoint(s, config, who));

    // Após atualizar, precisamos ler a versão mais recente do score
    const updated = { ...match, score: addPoint(structuredClone(score), config, who) } as Match;
    const result = checkWin(updated.score, config);

    if (!config.sets.enabled) {
      if (result.finished && result.winner) {
        const winnerId = result.winner === "A" ? playerA!.id : playerB!.id;
        finishMatch(match.id, winnerId);
      }
      return;
    }

    // modo sets
    if (result.setFinished) {
      const setWinner = result.winner!; // winner do set
      updateMatchScore(match.id, (s) => applySetWin(s, setWinner));

      // se também terminou a partida, finalizar
      if (result.finished) {
        const winnerId = setWinner === "A" ? playerA!.id : playerB!.id;
        finishMatch(match.id, winnerId);
      }
    }
  };

  const handleUndo = () => {
    if (score.history.length === 0 || match.status === "finished") return;

    // desfaz UM passo do histórico
    const last = score.history[score.history.length - 2]; // estado anterior
    const base = structuredClone(score);
    if (!config.sets.enabled) {
      if (last) {
        base.pointsA = last.a;
        base.pointsB = last.b;
        base.whoServes = last.whoServes;
        base.servesLeftInTurn = last.servesLeftInTurn;
        base.history.pop();
      } else {
        // voltar ao início
        base.pointsA = 0; base.pointsB = 0;
        base.whoServes = "A";
        base.servesLeftInTurn = config.servingMode === "two_in_row" ? 2 : 1;
        base.history = [];
      }
    } else {
      if (last) {
        base.currentSetPointsA = last.a;
        base.currentSetPointsB = last.b;
        base.whoServes = last.whoServes;
        base.servesLeftInTurn = last.servesLeftInTurn;
        base.history.pop();
      } else {
        base.currentSetPointsA = 0; base.currentSetPointsB = 0;
        base.whoServes = "A";
        base.servesLeftInTurn = config.servingMode === "two_in_row" ? 2 : 1;
        base.history = [];
      }
    }
    useTournament.getState().updateMatchScore(match.id, () => base);
  };

  const done = status === "finished";
  const aName = playerA?.name ?? "A";
  const bName = playerB?.name ?? "B";
  const isAserver = score.whoServes === "A";
  const serverName = isAserver ? aName : bName;

  const serverBadge = (
    <ServerBadge
      isLeft={isAserver} // true: ícone à esquerda; false: à direita
      title={`Saque: ${serverName}`}
      hint={
        config.servingMode === "two_in_row"
          ? `${score.servesLeftInTurn} saque${score.servesLeftInTurn === 1 ? "" : "s"} restante${score.servesLeftInTurn === 1 ? "" : "s"}`
          : "quem pontua saca"
      }
    />
  );

  // classes utilitárias para destacar o lado que saca
  const serveRingA = isAserver ? "ring-2 ring-blue-400 shadow-[0_0_0_6px_rgba(59,130,246,0.1)]" : "";
  const serveRingB = !isAserver ? "ring-2 ring-blue-400 shadow-[0_0_0_6px_rgba(59,130,246,0.1)]" : "";
  const btnServe = (isServer: boolean) =>
    `mt-2 px-3 py-2 rounded-lg text-white disabled:opacity-40 ${isServer ? "bg-blue-600 shadow-md" : "bg-blue-600/80"}`;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Placar ao Vivo</h1>
      <div className="text-sm opacity-70">Status: {status}</div>
      <div className="rounded-xl border p-4 bg-white/70 dark:bg-gray-900/50">
        {!config.sets.enabled ? (
          /* --- JOGO ÚNICO --- */
          <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3 sm:gap-4">
            {/* A */}
            <div className={`order-2 sm:order-1 text-center sm:text-right p-2 sm:p-3 rounded-xl ${serveRingA}`}>
              <div className="text-base sm:text-lg font-semibold">{aName}</div>
              <button
                disabled={done}
                onClick={() => handlePoint("A")}
                className={btnServe(isAserver) + " w-full sm:w-auto mt-2 tap-target"}
              >
                +1
              </button>
            </div>

            {/* Centro – no mobile ocupa 2 colunas; no desktop fica no meio */}
            <div className="order-1 sm:order-2 col-span-2 sm:col-span-1 text-center">
              <div className="text-5xl sm:text-6xl font-bold tabular-nums">
                {score.pointsA} x {score.pointsB}
              </div>
              <div className="mt-3 flex justify-center">{serverBadge}</div>
              <button
                disabled={done || score.history.length === 0}
                onClick={handleUndo}
                className="mt-3 px-1 py-1 text-sm disabled:opacity-40 tap-target"
              >
                Desfazer Ponto
              </button>
            </div>

            {/* B */}
            <div className={`order-3 text-center sm:text-left p-2 sm:p-3 rounded-xl ${serveRingB}`}>
              <div className="text-base sm:text-lg font-semibold">{bName}</div>
              <button
                disabled={done}
                onClick={() => handlePoint("B")}
                className={btnServe(!isAserver) + " w-full sm:w-auto mt-2 tap-target"}
              >
                +1
              </button>
            </div>
          </div>
        ) : (
          /* --- SETS: linha dos botões/placar do set atual --- */
          <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3 sm:gap-4">
            {/* A */}
            <div className={`order-2 sm:order-1 text-center sm:text-right p-2 sm:p-3 rounded-xl ${serveRingA}`}>
              <div className="text-base sm:text-lg font-semibold">{aName}</div>
              <button
                disabled={done}
                onClick={() => handlePoint("A")}
                className={btnServe(isAserver) + " w-full sm:w-auto mt-2 tap-target"}
              >
                +1
              </button>
            </div>

            {/* Centro – ocupa 2 colunas no mobile; 1 no desktop */}
            <div className="order-1 sm:order-2 col-span-2 sm:col-span-1 text-center">
              {/* placar do set atual */}
              <div className="text-5xl sm:text-6xl font-bold tabular-nums">
                {score.currentSetPointsA} x {score.currentSetPointsB}
              </div>

              {/* NOVO: mini placar de sets (A x B) */}
              <div
                aria-label={`Sets: ${aName} ${score.setsWonA} – ${bName} ${score.setsWonB}`}
                className="mt-1 inline-flex items-center gap-5 rounded-full border border-blue-600/30 bg-blue-600/10 px-3 py-0.2 text-blue-700 dark:text-blue-200"
              >
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold tabular-nums">{score.setsWonA}</span>
                </div>
                <span className="opacity-40">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold tabular-nums">{score.setsWonB}</span>
                </div>
              </div>

              {/* badge de saque */}
              <div className="mt-3 flex justify-center">{serverBadge}</div>

              {/* botão Undo */}
              <button
                disabled={done || score.history.length === 0}
                onClick={handleUndo}
                className="mt-3 px-1 py-1 text-xs disabled:opacity-40 tap-target"
              >
                Desfazer Ponto
              </button>
            </div>


            {/* B */}
            <div className={`order-3 text-center sm:text-left p-2 sm:p-3 rounded-xl ${serveRingB}`}>
              <div className="text-base sm:text-lg font-semibold">{bName}</div>
              <button
                disabled={done}
                onClick={() => handlePoint("B")}
                className={btnServe(!isAserver) + " w-full sm:w-auto mt-2 tap-target"}
              >
                +1
              </button>
            </div>
          </div>
        )}
      </div>

      {done && (
        <div className="flex items-center justify-end gap-2">
          <button onClick={()=>navigate("/bracket")} className="px-3 py-2 rounded-lg border">Voltar às partidas</button>
        </div>
      )}
    </div>
  );
}
