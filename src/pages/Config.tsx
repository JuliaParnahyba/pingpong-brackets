import { useState, type FormEvent } from "react";
import { newPlayer, useTournament, type TournamentConfig, hardResetTournament } from "../store/tournament";
import { generateRoundRobin } from "../utils/schedule";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { IconPlay, IconRefresh } from "../components/ui/icons";

export default function ConfigPage() {
  const { players, setPlayers, config, setConfig, setMatches } = useTournament();
  const [localPlayers, setLocalPlayers] = useState(
    players.length ? players : [newPlayer(), newPlayer()]
  );
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

  const handleRestart = () => {
    if (!confirm("Reiniciar tudo? Isso apagará jogadoras, partidas e configurações.")) return;
    hardResetTournament();
    const fresh = useTournament.getState().config;
    setLocalPlayers([newPlayer(), newPlayer()]);
    setLocalCfg(fresh);
    setMatches([]);
    navigate("/");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Configuração do Campeonato</h1>

      {/* MOBILE: 1 col | DESKTOP: 2 cols (form à esquerda, regras à direita) */}
      <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-2">
        {/* ===== COLUNA ESQUERDA — Jogadoras ===== */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Jogadores</h2>
          </div>

          <div className="space-y-2">
            {localPlayers.map((p, i) => (
              <div key={p.id} className="relative inline-block w-full md:w-[90%] xl:w-[85%]">
                <input
                  value={p.name}
                  onChange={(e) => updateName(i, e.target.value)}
                  placeholder={`Jogadora ${i + 1}`}
                  className="w-full px-3 pr-9 py-2 rounded-lg border bg-white/70 dark:bg-gray-900/50"
                />
                {/* botão “×” alinhado verticalmente e preso à borda do input */}
                <button
                  type="button"
                  onClick={() => removePlayer(i)}
                  aria-label={`Remover ${p.name || `Jogadora ${i + 1}`}`}
                  className="absolute right-3 top-1/3 -translate-y-1/2 text-lg leading-none
                            text-gray-400 hover:text-red-500 focus:outline-none transition-colors duration-100"
                >
                  ×
                </button>
              </div>
            ))}

            <Button type="button" size="xs" onClick={addPlayer}>
              + Adicionar jogador
            </Button>

          </div>
        </section>

        {/* ===== COLUNA DIREITA — Regras ===== */}
        <section className="space-y-6">
          {/* Modelo */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Modelo da Partida</h2>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={!localCfg.sets.enabled}
                  onChange={() =>
                    setLocalCfg((c) => ({ ...c, sets: { ...c.sets, enabled: false } }))
                  }
                />
                <span>Jogo único</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={localCfg.sets.enabled}
                  onChange={() =>
                    setLocalCfg((c) => ({ ...c, sets: { ...c.sets, enabled: true } }))
                  }
                />
                <span>Sets (best of)</span>
              </label>
            </div>

            {localCfg.sets.enabled ? (
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2">
                  <span>Best of:</span>
                  <select
                    value={localCfg.sets.bestOf}
                    onChange={(e) =>
                      setLocalCfg((c) => ({
                        ...c,
                        sets: { ...c.sets, bestOf: Number(e.target.value) as 3 | 5 },
                      }))
                    }
                    className="px-2 py-1 rounded-lg border bg-white/70 dark:bg-gray-900/50"
                  >
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                  </select>
                </label>

                <label className="flex items-center gap-2">
                  <span>Pontos por set:</span>
                  <input
                    type="number"
                    min={5}
                    max={21}
                    value={localCfg.sets.pointsPerSet}
                    onChange={(e) =>
                      setLocalCfg((c) => ({
                        ...c,
                        sets: {
                          ...c.sets,
                          pointsPerSet: Number(e.target.value) || 11,
                        },
                      }))
                    }
                    className="w-20 px-2 py-1 rounded-lg border bg-white/70 dark:bg-gray-900/50"
                  />
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Vitória sempre por diferença de 2 pontos.
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2">
                  <span>Pontos por partida:</span>
                  <input
                    type="number"
                    min={5}
                    max={50}
                    value={localCfg.targetPoints}
                    onChange={(e) =>
                      setLocalCfg((c) => ({
                        ...c,
                        targetPoints: Number(e.target.value) || 12,
                      }))
                    }
                    className="w-24 px-2 py-1 rounded-lg border bg-white/70 dark:bg-gray-900/50"
                  />
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Vitória sempre por diferença de 2 pontos.
                </span>
              </div>
            )}
          </div>

          {/* Saque */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Saque</h2>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={localCfg.servingMode === "two_in_row"}
                  onChange={() => setLocalCfg((c) => ({ ...c, servingMode: "two_in_row" }))}
                />
                <span>2 saques seguidos</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={localCfg.servingMode === "score_serves"}
                  onChange={() => setLocalCfg((c) => ({ ...c, servingMode: "score_serves" }))}
                />
                <span>Quem pontua saca</span>
              </label>
            </div>
          </div>

          {/* Ações – ficam nesta coluna à direita (desktop) */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" leftIcon={IconPlay}>
              Gerar tabela de jogos
            </Button>
            <Button
              type="button"
              variant="danger"
              leftIcon={IconRefresh}
              onClick={handleRestart}
              title="Limpa estado e localStorage e reinicia a aplicação"
            >
              Reiniciar campeonato
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
}
