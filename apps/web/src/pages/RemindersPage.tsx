import { useState } from "react";
import { OpenRemindersList } from "../components/OpenRemindersList";
import type { Reminder } from "@hausheld/types";

type Props = {
  reminders: Reminder[];
  onCreateReminder: (
    title: string,
    message: string,
    dueAt: string
  ) => Promise<void>;
  onMarkDone: (id: string) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
};

const defaultTaskTime = 160;

export function RemindersPage({
  reminders,
  onCreateReminder,
  onMarkDone,
  onDeleteReminder,
}: Props) {
  const [title, setTitle] = useState("Spülmaschine");
  const [message, setMessage] = useState(
    "Die Spülmaschine ist fertig und kann ausgeräumt werden."
  );
  const [minutes, setMinutes] = useState(defaultTaskTime);

  async function handleCreate() {
    if (!title.trim() || !message.trim() || minutes < 1) return;

    const dueAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();

    await onCreateReminder(title, message, dueAt);

    setTitle("Spülmaschine");
    setMessage("Die Spülmaschine ist fertig und kann ausgeräumt werden.");
    setMinutes(defaultTaskTime);
  }

  const doneReminders = reminders.filter((reminder) => reminder.done);

  return (
    <>
      <section>
        <h2>Reminder erstellen</h2>

        <div className="reminder-form">
          <label className="task-name-field">
            <span>Titel</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Spülmaschine"
            />
          </label>

          <label className="task-name-field">
            <span>Nachricht</span>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nachricht"
            />
          </label>

          <label className="points-field">
            <span>Minuten</span>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </label>

          <button onClick={handleCreate}>Reminder speichern</button>
        </div>
      </section>

      <OpenRemindersList
        reminders={reminders}
        onMarkDone={onMarkDone}
        onDeleteReminder={onDeleteReminder}
      />

      <section>
        <h2>Erledigte Reminder</h2>

        {doneReminders.length === 0 && <p>Keine erledigten Reminder.</p>}

        <ul className="reminder-list">
          {doneReminders.map((reminder) => (
            <li key={reminder.id} className="reminder-item">
              <div className="activity-content">
                <span className="activity-text">
                  <strong>{reminder.title}</strong> – {reminder.message}
                </span>

                <small className="activity-date">
                  Fällig: {new Date(reminder.dueAt).toLocaleString("de-DE")}
                </small>
              </div>

              <button
                className="danger-button"
                onClick={() => onDeleteReminder(reminder.id)}
              >
                Löschen
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}