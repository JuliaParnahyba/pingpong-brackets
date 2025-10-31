import { Link } from "react-router-dom";
import { useTournament } from "../store/tournament";
import { computeStandings } from "../utils/standings";
import { buildKnockoutFromStandings } from "../utils/finals";
import { useNavigate } from "react-router-dom";

export default function StandingsPage() {
  const { players, matches, config, setMatches } = useTournament();
  const rows = computeStandings(players, matches, config.sets.enabled);
  const navigate = useNavigate();

  const classMatches = matches.filter(m => m.phase === "classification");
  const finished = classMatches.filter(m => m.status === "finished").length;
  const allDone = classMatches.length > 0 && finished === classMatches.length;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Classificação</h1>
        <Link to="/bracket" className="text-blue-600 underline">← Partidas</Link>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Jogadora</th>
              <th className="px-3 py-2 text-center">W</th>
              <th className="px-3 py-2 text-center">Sets ±</th>
              <th className="px-3 py-2 text-center">Pts ±</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.playerId} className="border-t">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2 text-center">{r.wins}</td>
                <td className="px-3 py-2 text-center">
                  {r.setsFor > 0 || r.setsAgainst > 0 ? `${r.setsFor}-${r.setsAgainst} (${r.setDiff>=0?'+':''}${r.setDiff})` : "—"}
                </td>
                <td className="px-3 py-2 text-center">
                  {r.pointsFor > 0 || r.pointsAgainst > 0 ? `${r.pointsFor}-${r.pointsAgainst} (${r.pointDiff>=0?'+':''}${r.pointDiff})` : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Sem resultados ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
            disabled={!allDone}
            className="px-3 py-2 rounded-lg bg-green-600 text-white disabled:opacity-40"
            onClick={() => {
            const finals = buildKnockoutFromStandings(rows, players, config);
            if (finals.length === 0) return;
            // anexa as finais ao array atual:
            setMatches([...matches, ...finals]);
            navigate("/bracket");
            }}
        >
            Gerar eliminatória
        </button>
        {!allDone && (
          <span className="text-xs opacity-70">
            {finished}/{classMatches.length} partidas finalizadas
          </span>
        )}
      </div>
    </div>
  );
}
