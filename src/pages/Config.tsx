import { useState, type FormEvent } from "react";
import { newPlayer, useTournament, type TournamentConfig } from "../store/tournament";
import { generateRoundRobin } from "../utils/schedule";
import { useNavigate } from "react-router-dom";

export default function ConfigPage() {
  const { players, setPlayers, config, setConfig, setMatches, reset } = useTournament();
  const [localPlayers, setLocalPlayers] = useState(players.length ? players : [newPlayer(), newPlayer()]);
  const [localCfg, setLocalCfg] = useState<TournamentConfig>(config);
  const navigate = useNavigate();

  const updateName = (idx: number, name: string) => {
    const copy = [...localPlayers];
    copy[idx] = { ...copy[idx], name };
    setLocalPlayers(copy);
  };
  const addPlayer = () => setLocalPlayers((p) => [...p, newPlayer()]);
  const removePlayer = (idx: number) => setLocalPlayers((p) => p.filter((_, i) => i !== idx));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = localPlayers
      .map((p) => ({ ...p, name: p.name.trim() }))
      .filter((p) => p.name.length > 0);

    if (cleaned.length < 2) {
      alert("Adicione pelo menos duas jogadoras 🙂");
      return;
    }

    setPlayers(cleaned);
    setConfig(localCfg);
    const matches = generateRoundRobin(cleaned, localCfg);
    setMatches(matches);
    navigate("/bracket");
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Configuração do Campeonato</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Jogadoras */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Jogadoras</h2>
            <button type="button" onClick={addPlayer}
              className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm">+ adicionar</button>
          </div>

          <div className="space-y-2">
            {localPlayers.map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                <input
                  value={p.name}
                  onChange={(e)=>updateName(i, e.target.value)}
                  placeholder={`Jogadora ${i+1}`}
                  className="w-full px-3 py-2 rounded-lg border bg-white/70 dark:bg-gray-900/50"
                />
                <button type="button" onClick={()=>removePlayer(i)}
                  className="px-2 py-2 rounded-lg border text-sm">remover</button>
              </div>
            ))}
          </div>
        </section>

        {/* Modelo: jogo único ou sets */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Modelo da Partida</h2>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!localCfg.sets.enabled}
                onChange={()=>setLocalCfg(c=>({ ...c, sets: { ...c.sets, enabled: false } }))}
              />
              <span>Jogo único</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={localCfg.sets.enabled}
                onChange={()=>setLocalCfg(c=>({ ...c, sets: { ...c.sets, enabled: true } }))}
              />
              <span>Sets (best of)</span>
            </label>
          </div>

          {localCfg.sets.enabled ? (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <span>Best of:</span>
                <select
                  value={localCfg.sets.bestOf}
                  onChange={(e)=>setLocalCfg(c=>({ ...c, sets: { ...c.sets, bestOf: Number(e.target.value) as 3|5 } }))}
                  className="px-2 py-1 rounded-lg border bg-white/70 dark:bg-gray-900/50"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                </select>
              </label>

              <label className="flex items-center gap-2">
                <span>Pontos por set:</span>
                <input
                  type="number" min={5} max={21}
                  value={localCfg.sets.pointsPerSet}
                  onChange={(e)=>setLocalCfg(c=>({ ...c, sets: { ...c.sets, pointsPerSet: Number(e.target.value) || 11 } }))}
                  className="w-20 px-2 py-1 rounded-lg border bg-white/70 dark:bg-gray-900/50"
                />
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <span>Pontos-alvo:</span>
                <input
                  type="number" min={5} max={50}
                  value={localCfg.targetPoints}
                  onChange={(e)=>setLocalCfg(c=>({ ...c, targetPoints: Number(e.target.value) || 12 }))}
                  className="w-24 px-2 py-1 rounded-lg border bg-white/70 dark:bg-gray-900/50"
                />
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Vitória sempre por diferença de 2 pontos.
              </span>
            </div>
          )}
        </section>

        {/* Modo de saque */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Saque</h2>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={localCfg.servingMode === "two_in_row"}
                onChange={()=>setLocalCfg(c=>({ ...c, servingMode: "two_in_row" }))}
              />
              <span>2 saques seguidos</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={localCfg.servingMode === "score_serves"}
                onChange={()=>setLocalCfg(c=>({ ...c, servingMode: "score_serves" }))}
              />
              <span>Quem pontua saca</span>
            </label>
          </div>
        </section>

        <div className="flex items-center gap-2">
          <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white">
            Gerar tabela
          </button>
          <button type="button" onClick={reset} className="px-3 py-2 rounded-lg border">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
