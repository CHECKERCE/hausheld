import type { Stat, Task, TaskCompletion, User } from "../types";

const API_URL = "http://localhost:3001";

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
}

export async function createUser(name: string): Promise<User> {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  return res.json();
}

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`);
  return res.json();
}

export async function createTask(name: string, points: number): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, points }),
  });

  return res.json();
}

export async function updateTask(
  id: string,
  name: string,
  points: number
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      points,
    }),
  });

  if (!res.ok) {
    throw new Error("Aufgabe konnte nicht bearbeitet werden.");
  }

  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Aufgabe konnte nicht gelöscht werden.");
  }
}

export async function getTaskCompletions(): Promise<TaskCompletion[]> {
  const res = await fetch(`${API_URL}/task-completions`);
  return res.json();
}

export async function completeTask(
  userId: string,
  taskId: string
): Promise<TaskCompletion> {
  const res = await fetch(`${API_URL}/task-completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, taskId }),
  });

  return res.json();
}

export async function createTaskCompletionWithDate(
  userId: string,
  taskId: string,
  completedAt: string
): Promise<TaskCompletion> {
  const res = await fetch(`${API_URL}/task-completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, taskId, completedAt }),
  });

  return res.json();
}

export async function deleteTaskCompletion(id: string): Promise<void> {
  await fetch(`${API_URL}/task-completions/${id}`, {
    method: "DELETE",
  });
}

export async function getStats(): Promise<Stat[]> {
  const res = await fetch(`${API_URL}/stats`);
  return res.json();
}