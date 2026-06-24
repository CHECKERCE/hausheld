import { NavLink, Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <main className="app-shell">
      <h1>Hausheld</h1>

      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/tasks">Aufgaben</NavLink>
        <NavLink to="/history">Verlauf</NavLink>
      </nav>

      <Outlet />
    </main>
  );
}