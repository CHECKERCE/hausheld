import { useState } from "react";
import { CreateTaskForm } from "../components/CreateTaskForm";
import type { Task } from "../types";

type Props = {
  tasks: Task[];
  onCreateTask: (name: string, points: number) => Promise<void>;
  onUpdateTask: (
    id: string,
    name: string,
    points: number
  ) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
};

type TaskRowProps = {
  task: Task;
  onUpdateTask: (
    id: string,
    name: string,
    points: number
  ) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
};

function TaskRow({
  task,
  onUpdateTask,
  onDeleteTask,
}: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [points, setPoints] = useState(task.points);

  async function handleSave() {
    if (!name.trim() || points < 1) {
      return;
    }

    await onUpdateTask(task.id, name, points);
    setIsEditing(false);
  }

  function handleCancel() {
    setName(task.name);
    setPoints(task.points);
    setIsEditing(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Möchtest du "${task.name}" wirklich löschen?\n\nAuch die zugehörigen Verlaufseinträge werden gelöscht.`
    );

    if (!confirmed) {
      return;
    }

    await onDeleteTask(task.id);
  }

  return (
    <li className="task-item">
      {isEditing ? (
        <div className="task-edit-form">
          <label className="task-name-field">
            <span>Aufgabe</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="points-field">
            <span>Punkte</span>
            <input
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </label>

          <div className="task-actions">
            <button onClick={handleSave}>Speichern</button>
            <button className="secondary-button" onClick={handleCancel}>
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-info">
            <strong>{task.name}</strong>
            <span className="task-points">{task.points} Punkte</span>
          </div>

          <div className="task-actions">
            <button
              className="secondary-button"
              onClick={() => setIsEditing(true)}
            >
              Bearbeiten
            </button>

            <button className="danger-button" onClick={handleDelete}>
              Löschen
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export function TasksPage({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}: Props) {
  return (
    <>
      <CreateTaskForm onCreate={onCreateTask} />

      <section>
        <h2>Aufgaben verwalten</h2>

        {tasks.length === 0 && <p>Noch keine Aufgaben erstellt.</p>}

        <ul className="task-list">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </ul>
      </section>
    </>
  );
}