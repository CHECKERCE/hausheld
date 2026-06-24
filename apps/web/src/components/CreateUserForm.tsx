import { useState } from "react";

type Props = {
  onCreate: (name: string) => Promise<void>;
};

export function CreateUserForm({ onCreate }: Props) {
  const [name, setName] = useState("");

  async function handleSubmit() {
    if (!name.trim()) return;

    await onCreate(name);
    setName("");
  }

  return (
    <section>
      <h2>Person erstellen</h2>
      <div className="form-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />

        <button onClick={handleSubmit}>Person speichern</button>
      </div>
    </section>
  );
}