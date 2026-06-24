import { useMemo, useState } from "react";
import { HistoryCharts } from "../components/HistoryCharts";
import type { Task, TaskCompletion, User, Stat, UserAbsence } from "../types";

type Props = {
  users: User[];
  stats: Stat[];
  tasks: Task[];
  completions: TaskCompletion[];
  onDeleteCompletion: (id: string) => Promise<void>;
  abcences: UserAbsence[];
};

export function HistoryPage({
  users,
  stats,
  tasks,
  completions,
  onDeleteCompletion,
  abcences,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const filteredCompletions = useMemo(() => {
    return completions.filter((completion) => {
      const matchesSearch =
        completion.user.name.toLowerCase().includes(search.toLowerCase()) ||
        completion.task.name.toLowerCase().includes(search.toLowerCase());

      const matchesUser =
        !selectedUserId || completion.user.id === selectedUserId;

      const matchesTask =
        !selectedTaskId || completion.task.id === selectedTaskId;

      return matchesSearch && matchesUser && matchesTask;
    });
  }, [completions, search, selectedUserId, selectedTaskId]);

  const totalPoints = filteredCompletions.reduce(
    (sum, completion) => sum + completion.task.points,
    0
  );

  return (
    <>
      <section>
        <h2>Filter</h2>

        <div className="filter-row">
          <input
            className="history-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Suche nach Person oder Aufgabe"
          />

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Alle Personen</option>
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
            <option value="">Alle Aufgaben</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2>History & Statistiken</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Einträge</span>
            <strong>{filteredCompletions.length}</strong>
          </div>

          <div className="stat-card">
            <span>Punkte</span>
            <strong>{totalPoints}</strong>
          </div>
        </div>
      </section>

      <HistoryCharts
        users={users}
        stats={stats}
        completions={filteredCompletions}
        absences={abcences}
      />

      <section>
        <h2>Verlauf</h2>

        {filteredCompletions.length === 0 && <p>Keine passenden Einträge.</p>}

        <ul className="activity-list">
          {filteredCompletions.map((completion) => (
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
                onClick={() => onDeleteCompletion(completion.id)}
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