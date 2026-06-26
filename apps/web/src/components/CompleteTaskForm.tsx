import { useEffect, useState } from "react";
import type { Task, User } from "@hausheld/types";
import { deleteCookie, getCookie, setCookie } from "../utils/cookies";

const SELECTED_USER_COOKIE = "hausheld_selected_user_id";

type Props = {
  users: User[];
  tasks: Task[];
  onComplete: (userId: string, taskId: string) => Promise<void>;
};

export function CompleteTaskForm({ users, tasks, onComplete }: Props) {
  const [selectedUserId, setSelectedUserId] = useState(() => {
    return getCookie(SELECTED_USER_COOKIE) ?? "";
  });

  const [selectedTaskId, setSelectedTaskId] = useState("");

  useEffect(() => {
    if (!selectedUserId || users.length === 0) {
      return;
    }

    const userStillExists = users.some(
      (user) => user.id === selectedUserId
    );

    if (!userStillExists) {
      setSelectedUserId("");
      deleteCookie(SELECTED_USER_COOKIE);
    }
  }, [users, selectedUserId]);

  function handleUserChange(userId: string) {
    setSelectedUserId(userId);

    if (userId) {
      setCookie(SELECTED_USER_COOKIE, userId);
    } else {
      deleteCookie(SELECTED_USER_COOKIE);
    }
  }

  async function handleSubmit() {
    if (!selectedUserId || !selectedTaskId) {
      return;
    }

    await onComplete(selectedUserId, selectedTaskId);

    // Person bleibt gespeichert, nur die Aufgabe wird zurückgesetzt.
    setSelectedTaskId("");
  }

  return (
    <section>
      <h2>Aufgabe erledigen</h2>

      <div className="form-row">
        <label className="task-name-field">
          <span>Person</span>

          <select
            value={selectedUserId}
            onChange={(e) => handleUserChange(e.target.value)}
          >
            <option value="">Person auswählen</option>

            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>

        <label className="task-name-field">
          <span>Aufgabe</span>

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
        </label>

        <button onClick={handleSubmit}>Speichern</button>
      </div>
    </section>
  );
}