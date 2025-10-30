import { useTournament, type Match } from "../store/tournament";
import { Link } from "react-router-dom";

export default function BracketPage() {
  const { matches } = useTournament();

  if (!matches || matches.length === 0) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Tabela de Partidas</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Nenhuma partida gerada. Volte à <b>Configuração</b> e clique em <b>Gerar tabela</b>.
        </p>
      </div>
    );
  }

  const classific = matches.filter((m) => m.phase === "classification");
  const finals = matches.filter((m) => m.phase === "finals");
  const training = matches.filter((m) => m.phase === "training");

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Tabela de Partidas</h1>

      {classific.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Classificação (todos x todos)</h2>
          {renderRoundGroups(classific)}
        </section>
      )}

      {finals.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Finais</h2>
          {finals.map((m) => (
            <Link key={m.id} to={`/match/${m.id}`}>
              <div className="rounded-xl border p-3 bg-white/70 dark:bg-gray-900/50 text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition">
                {m.playerA?.name ?? "?"} vs {m.playerB?.name ?? "?"}
              </div>
            </Link>
          ))}
        </section>
      )}

      {training.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Modo Treino</h2>
          {training.map((m) => (
            <Link key={m.id} to={`/match/${m.id}`}>
              <div className="rounded-xl border p-3 bg-white/70 dark:bg-gray-900/50 text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition">
                {m.playerA?.name ?? "?"} vs {m.playerB?.name ?? "?"}
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function renderRoundGroups(matches: Match[]) {
  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {rounds.map((r) => {
        const list = matches.filter((m) => m.round === r);
        return (
          <div key={r} className="space-y-2">
            <h3 className="font-semibold">Rodada {r}</h3>
            {list.map((m) => (
              <Link key={m.id} to={`/match/${m.id}`}>
                <div className="rounded-xl border p-3 bg-white/70 dark:bg-gray-900/50 text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition">
                  {m.playerA?.name ?? "?"} vs {m.playerB?.name ?? "?"}
                </div>
              </Link>
            ))}
          </div>
        );
      })}
    </div>
  );
}
