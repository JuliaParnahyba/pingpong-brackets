import { NavLink, Outlet } from "react-router-dom";

const linkBase =
  "px-3 py-2 rounded-lg text-sm font-medium transition-colors";
const active =
  "bg-blue-600 text-white";
const idle =
  "text-gray-700 hover:bg-blue-50 dark:text-gray-200 dark:hover:bg-gray-800";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur dark:bg-gray-950/70">
        <nav className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 p-2 sm:p-3">
          <div className="font-bold mr-2 text-sm sm:text-base">🏓 PingPong Brackets</div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : idle} tap-target`
              }
            >
              Config
            </NavLink>

            <NavLink
              to="/bracket"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : idle} tap-target`
              }
            >
              Chaves
            </NavLink>

            <NavLink
              to="/standings"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? active : idle} tap-target`
              }
            >
              Classificação
            </NavLink>
          </div>
        </nav>
      </header>

      {/* Aqui garantimos que o conteúdo empurre o footer, sem sobrar espaço */}
      <main className="flex-grow py-6 flex flex-col justify-start">
        <div className="max-w-6xl mx-auto px-4">
          <Outlet />
        </div>
      </main>

      <footer className="text-center text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 py-5 border-t border-gray-200 dark:border-gray-800 leading-tight">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            PingPong Brackets
          </span>{" "}
          — criado com 💙 por{" "}
          <span className="font-semibold">Julia Parnahyba</span>
        </p>
        <p className="text-[9px] sm:text-[10px] mt-0.5">
          Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
