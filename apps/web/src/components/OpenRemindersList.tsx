import { useEffect, useState } from "react";
import type { Reminder } from "../types";

type Props = {
  reminders: Reminder[];
  onMarkDone: (id: string) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
};

function formatCountdown(dueAt: string, now: number) {
  const diffMs = new Date(dueAt).getTime() - now;

  if (diffMs <= 0) {
    return "fällig";
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

export function OpenRemindersList({
  reminders,
  onMarkDone,
  onDeleteReminder,
}: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const openReminders = reminders.filter((reminder) => !reminder.done);

  return (
    <section>
      <h2>Offene Reminder</h2>

      {openReminders.length === 0 && <p>Keine offenen Reminder.</p>}

      <ul className="reminder-list">
        {openReminders.map((reminder) => (
          <li key={reminder.id} className="reminder-item">
            <div className="activity-content">
              <span className="activity-text">
                <strong>{reminder.title}</strong> – {reminder.message}
              </span>

              <span
                className={
                  new Date(reminder.dueAt).getTime() <= now
                    ? "reminder-countdown overdue"
                    : "reminder-countdown"
                }
              >
                {formatCountdown(reminder.dueAt, now)}
              </span>

              <small className="activity-date">
                Fällig: {new Date(reminder.dueAt).toLocaleString("de-DE")} ·{" "}
                {reminder.triggered
                  ? "Erinnerung gesendet"
                  : "Wartet auf Erinnerung"}
              </small>
            </div>

            <div className="task-actions">
              <button onClick={() => onMarkDone(reminder.id)}>
                Erledigt
              </button>

              <button
                className="danger-button"
                onClick={() => onDeleteReminder(reminder.id)}
              >
                Löschen
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}