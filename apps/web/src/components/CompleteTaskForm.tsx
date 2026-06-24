import { useState } from "react";
import type { Task, User } from "../types";

type Props = {
  users: User[];
  tasks: Task[];
  onComplete: (userId: string, taskId: string) => Promise<void>;
};

export function CompleteTaskForm({ users, tasks, onComplete }: Props) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");

  async function handleSubmit() {
    if (!selectedUserId || !selectedTaskId) return;

    await onComplete(selectedUserId, selectedTaskId);
  }

  return (
    <section>
      <h2>Aufgabe erledigen</h2>

      <div className="form-row">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">Person auswählen</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
        >
          <option value="">Aufgabe auswählen</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name} ({task.points} Punkte)
            </option>
          ))}
        </select>

        <button onClick={handleSubmit}>Speichern</button>
      </div>
    </section>
  );
}