import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import ConfigPage from "./pages/Config";
import BracketPage from "./pages/Bracket";
import MatchPage from "./pages/Match";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <ConfigPage /> },
      { path: "bracket", element: <BracketPage /> },
      { path: "match/:id", element: <MatchPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
