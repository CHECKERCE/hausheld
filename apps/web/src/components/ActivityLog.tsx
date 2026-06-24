import type { TaskCompletion } from "../types";
import { UndoBanner } from "./UndoBanner";

type Props = {
  completions: TaskCompletion[];
  onDelete: (id: string) => Promise<void>;
  lastDeletedCompletion: TaskCompletion | null;
  onUndoDeleteCompletion: () => Promise<void>;
  onDismissUndo: () => void;
};

export function ActivityLog({ completions, onDelete, lastDeletedCompletion, onUndoDeleteCompletion, onDismissUndo }: Props) {
  return (
    <section>

      <UndoBanner
        completion={lastDeletedCompletion}
        onUndo={onUndoDeleteCompletion}
        onDismiss={onDismissUndo}
      />

      <h2>Verlauf</h2>

      {completions.length === 0 && <p>Noch kein Verlauf.</p>}

      <ul className="activity-list">
        {completions.map((completion) => (
          <li key={completion.id} className="activity-item">
            <div className="activity-content">
              <span className="activity-text">
                <strong>{completion.user.name}</strong> hat{" "}
                <strong>{completion.task.name}</strong> erledigt (
                {completion.task.points} Punkte)
              </span>

              <small className="activity-date">
                {new Date(completion.completedAt).toLocaleString("de-DE")}
              </small>
            </div>

            <button
              className="danger-button"
              onClick={() => onDelete(completion.id)}
            >
              Löschen
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}