import type { TaskCompletion } from "../types";

type Props = {
  completions: TaskCompletion[];
  onDelete: (id: string) => Promise<void>;
};

export function ActivityLog({ completions, onDelete }: Props) {
  return (
    <section>
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