import { useParams } from "react-router-dom";

export default function MatchPage() {
  const { id } = useParams();
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Placar ao Vivo</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Partida ID: <code className="font-mono">{id}</code>
      </p>
    </div>
  );
}
