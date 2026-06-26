import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import {
  completeTask,
  createReminder,
  createReminderFromExisting,
  createTask,
  createTaskCompletionWithDate,
  deleteReminder,
  deleteTask,
  deleteTaskCompletion,
  getReminders,
  getStats,
  getTaskCompletions,
  getTasks,
  getUsers,
  markReminderDone,
  reopenReminder,
  updateTask,
  getUserAbsences,
  createUserAbsence,
  deleteUserAbsence,
  createUser,
  updateUser,
  deleteUser,
} from "./api/hausheldApi";

import type {
  Reminder,
  Stat,
  Task,
  TaskCompletion,
  UndoAction,
  User,
  UserAbsence,
} from "../../../packages/types/src";

import { AppLayout } from "./layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { RemindersPage } from "./pages/RemindersPage";
import { TasksPage } from "./pages/TasksPage";
import { PeoplePage } from "./pages/PeoplePage";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [absences, setAbsences] = useState<UserAbsence[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);

  async function loadData() {
    const [
      usersData,
      absencesData,
      tasksData,
      completionsData,
      statsData,
      remindersData,
    ] = await Promise.all([
      getUsers(),
      getUserAbsences(),
      getTasks(),
      getTaskCompletions(),
      getStats(),
      getReminders(),
    ]);

    setUsers(usersData);
    setAbsences(absencesData)
    setTasks(tasksData);
    setCompletions(completionsData);
    setStats(statsData);
    setReminders(remindersData);
  }

  async function handleCreateUser(name: string) {
    await createUser(name);
    await loadData();
  }

  async function handleUpdateUser(id: string, name: string) {
    await updateUser(id, name);
    await loadData();
  }

  async function handleDeleteUser(id: string) {
    await deleteUser(id);
    await loadData();
  }

  async function handleCreateAbsence(
    userId: string,
    startDate: string,
    endDate: string,
    reason: string
  ) {
    await createUserAbsence(userId, startDate, endDate, reason);
    await loadData();
  }

  async function handleDeleteAbsence(id: string) {
    await deleteUserAbsence(id);
    await loadData();
  }

  async function handleCreateTask(name: string, points: number) {
    await createTask(name, points);
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

  async function handleCompleteTask(userId: string, taskId: string) {
    await completeTask(userId, taskId);
    await loadData();
  }

  async function handleDeleteCompletion(id: string) {
    const completion = completions.find((item) => item.id === id);

    if (!completion) {
      return;
    }

    await deleteTaskCompletion(id);

    setUndoAction({
      kind: "completionDeleted",
      completion,
      message: `„${completion.task.name}“ von ${completion.user.name} wurde gelöscht.`,
    });

    await loadData();
  }

  async function handleCreateReminder(
    title: string,
    message: string,
    dueAt: string
  ) {
    await createReminder(title, message, dueAt);
    await loadData();
  }

  async function handleMarkReminderDone(id: string) {
    const reminder = reminders.find((item) => item.id === id);

    if (!reminder) {
      return;
    }

    await markReminderDone(id);

    setUndoAction({
      kind: "reminderCompleted",
      reminder,
      message: `„${reminder.title}“ wurde als erledigt markiert.`,
    });

    await loadData();
  }

  async function handleDeleteReminder(id: string) {
    const reminder = reminders.find((item) => item.id === id);

    if (!reminder) {
      return;
    }

    await deleteReminder(id);

    setUndoAction({
      kind: "reminderDeleted",
      reminder,
      message: `„${reminder.title}“ wurde gelöscht.`,
    });

    await loadData();
  }

  async function handleUndoAction() {
    const action = undoAction;

    if (!action) {
      return;
    }

    try {
      if (action.kind === "completionDeleted") {
        await createTaskCompletionWithDate(
          action.completion.user.id,
          action.completion.task.id,
          action.completion.completedAt
        );
      }

      if (action.kind === "reminderDeleted") {
        await createReminderFromExisting(action.reminder);
      }

      if (action.kind === "reminderCompleted") {
        await reopenReminder(action.reminder.id);
      }

      setUndoAction(null);
      await loadData();
    } catch (error) {
      console.error("Undo fehlgeschlagen:", error);
    }
  }

  useEffect(() => {
    async function fetchInitialData() {
      await loadData();
    }

    void fetchInitialData();
  }, []);

  useEffect(() => {
    if (!undoAction) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setUndoAction(null);
    }, 10_000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [undoAction]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <AppLayout
              undoMessage={undoAction?.message ?? null}
              onUndo={handleUndoAction}
              onDismissUndo={() => setUndoAction(null)}
            />
          }
        >
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
                reminders={reminders}
                onMarkReminderDone={handleMarkReminderDone}
                onDeleteReminder={handleDeleteReminder}
                abcences={absences}
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
                stats={stats}
                tasks={tasks}
                completions={completions}
                onDeleteCompletion={handleDeleteCompletion}
                abcences={absences}
              />
            }
          />

          <Route
            path="/reminders"
            element={
              <RemindersPage
                reminders={reminders}
                onCreateReminder={handleCreateReminder}
                onMarkDone={handleMarkReminderDone}
                onDeleteReminder={handleDeleteReminder}
              />
            }
          />
          <Route
            path="/people"
            element={
              <PeoplePage
                users={users}
                absences={absences}
                onCreateUser={handleCreateUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                onCreateAbsence={handleCreateAbsence}
                onDeleteAbsence={handleDeleteAbsence}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;