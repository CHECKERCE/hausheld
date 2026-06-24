type Props = {
  message: string | null;
  onUndo: () => Promise<void>;
  onDismiss: () => void;
};

export function UndoBanner({
  message,
  onUndo,
  onDismiss,
}: Props) {
  if (!message) {
    return null;
  }

  return (
    <section className="undo-banner" role="status" aria-live="polite">
      <span>{message}</span>

      <div className="undo-banner-actions">
        <button onClick={onUndo}>Rückgängig</button>

        <button className="secondary-button" onClick={onDismiss}>
          Schließen
        </button>
      </div>
    </section>
  );
}