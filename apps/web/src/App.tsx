import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import {
  completeTask,
  createTask,
  deleteTaskCompletion,
  getStats,
  getTaskCompletions,
  getTasks,
  getUsers,
  deleteTask,
  updateTask,
  createTaskCompletionWithDate,
} from "./api/hausheldApi";

import type { Stat, Task, TaskCompletion, User } from "./types";
import { AppLayout } from "./layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { TasksPage } from "./pages/TasksPage";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [lastDeletedCompletion, setLastDeletedCompletion] =
    useState<TaskCompletion | null>(null);

  async function loadData() {
    const [usersData, tasksData, completionsData, statsData] =
      await Promise.all([
        getUsers(),
        getTasks(),
        getTaskCompletions(),
        getStats(),
      ]);

    setUsers(usersData);
    setTasks(tasksData);
    setCompletions(completionsData);
    setStats(statsData);
  }

  async function handleCreateTask(name: string, points: number) {
    await createTask(name, points);
    await loadData();
  }

  async function handleCompleteTask(userId: string, taskId: string) {
    await completeTask(userId, taskId);
    await loadData();
  }

  async function handleDeleteCompletion(id: string) {
    const completion = completions.find((item) => item.id === id);

    if (!completion) return;

    await deleteTaskCompletion(id);
    setLastDeletedCompletion(completion);
    await loadData();
  }

  async function handleUndoDeleteCompletion() {
    if (!lastDeletedCompletion) return;

    await createTaskCompletionWithDate(
      lastDeletedCompletion.user.id,
      lastDeletedCompletion.task.id,
      lastDeletedCompletion.completedAt
    );

    setLastDeletedCompletion(null);
    await loadData();
  }

  async function handleUpdateTask(
    id: string,
    name: string,
    points: number
  ) {
    await updateTask(id, name, points);
    await loadData();
  }

  async function handleDeleteTask(id: string) {
    await deleteTask(id);
    await loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <DashboardPage
                users={users}
                tasks={tasks}
                completions={completions}
                stats={stats}
                onCompleteTask={handleCompleteTask}
                onDeleteCompletion={handleDeleteCompletion}
                lastDeletedCompletion={lastDeletedCompletion}
                onUndoDeleteCompletion={handleUndoDeleteCompletion}
                onDismissUndo={() => setLastDeletedCompletion(null)}
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <TasksPage
                tasks={tasks}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            }
          />
          <Route
            path="/history"
            element={
              <HistoryPage
                users={users}
                tasks={tasks}
                completions={completions}
                onDeleteCompletion={handleDeleteCompletion}
                lastDeletedCompletion={lastDeletedCompletion}
                onUndoDeleteCompletion={handleUndoDeleteCompletion}
                onDismissUndo={() => setLastDeletedCompletion(null)}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;