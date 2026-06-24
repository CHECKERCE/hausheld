import type { TaskCompletion } from "../types";

type Props = {
  completion: TaskCompletion | null;
  onUndo: () => Promise<void>;
  onDismiss: () => void;
};

export function UndoBanner({ completion, onUndo, onDismiss }: Props) {
  if (!completion) return null;

  return (
    <section className="undo-banner">
      <span>
        „{completion.task.name}“ von {completion.user.name} wurde gelöscht.
      </span>

      <div>
        <button onClick={onUndo}>Rückgängig</button>
        <button className="secondary-button" onClick={onDismiss}>
          Schließen
        </button>
      </div>
    </section>
  );
}