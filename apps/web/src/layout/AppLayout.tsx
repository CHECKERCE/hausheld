import { NavLink, Outlet } from "react-router-dom";
import { UndoBanner } from "../components/UndoBanner";

type Props = {
  undoMessage: string | null;
  onUndo: () => Promise<void>;
  onDismissUndo: () => void;
};

export function AppLayout({
  undoMessage,
  onUndo,
  onDismissUndo,
}: Props) {
  return (
    <main className="app-shell">
      <h1>Hausheld</h1>

      <nav>
        <NavLink to="/" end>
          📊 Dashboard
        </NavLink>

        <NavLink to="/reminders">
          ⏰ Reminder
        </NavLink>

        <NavLink to="/tasks">
          📝 Aufgaben
        </NavLink>

        <NavLink to="/history">
          📈 History
        </NavLink>
      </nav>

      <UndoBanner
        message={undoMessage}
        onUndo={onUndo}
        onDismiss={onDismissUndo}
      />

      <Outlet />
    </main>
  );
}