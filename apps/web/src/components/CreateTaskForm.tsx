import { useState } from "react";

type Props = {
  onCreate: (name: string, points: number) => Promise<void>;
};

export function CreateTaskForm({ onCreate }: Props) {
  const [name, setName] = useState("");
  const [points, setPoints] = useState(1);

  async function handleSubmit() {
    if (!name.trim()) return;

    await onCreate(name, points);
    setName("");
    setPoints(1);
  }

  return (
    <section>
      <h2>Aufgabe erstellen</h2>
      <div className="form-row">

        <label className="task-name-field">
          <span>Name</span>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aufgabe"
          />

        </label>

        <label className="points-field">
          <span>Punkte</span>

          <input
            type="number"
            value={points}
            min={1}
            onChange={(e) => setPoints(Number(e.target.value))}
          />
        </label>

        <button onClick={handleSubmit}>Aufgabe speichern</button>
      </div>
    </section>
  );
}