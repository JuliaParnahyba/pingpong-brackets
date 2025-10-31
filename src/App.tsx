import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "px-3 py-2 rounded-lg text-sm font-medium transition-colors";
const active =
  "bg-blue-600 text-white";
const idle =
  "text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-800";

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur dark:bg-gray-950/70">
        <nav className="max-w-6xl mx-auto flex items-center gap-2 p-3">
          <div className="font-bold mr-4">🏓 PingPong Brackets</div>

          <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}>
            Config
          </NavLink>

          <NavLink to="/bracket" className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}>
            Chaves
          </NavLink>

          <NavLink to="/match/1" className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}>
            Placar (demo)
          </NavLink>

          <NavLink to="/standings" className={({ isActive }) => `${linkBase} ${isActive ? active : idle}`}>
            Classificação
          </NavLink>
        </nav>
      </header>

      <main className="py-6">
        <Outlet />
      </main>
    </div>
  );
}
