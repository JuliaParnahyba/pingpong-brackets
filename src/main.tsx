import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import ConfigPage from "./pages/Config";
import BracketPage from "./pages/Bracket";
import MatchPage from "./pages/Match";
import StandingsPage from "./pages/Standings";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,                                 // layout base (navbar + Outlet)
      children: [
        { index: true, element: <ConfigPage /> },       // rota / (home)
        { path: "bracket", element: <BracketPage /> },  // rota /bracket
        { path: "match/:id", element: <MatchPage /> },  // rota /match/1
        { path: "standings", element: <StandingsPage />},  // rota para /standings
      ],
    },
  ],
  { basename: '/pingpong-brackets' }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
