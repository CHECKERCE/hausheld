import type { Reminder, Stat, Task, TaskCompletion, User, UserAbsence } from "@hausheld/types";

//const API_URL = "/api";
const API_URL = "http://localhost:3001";

type UserAbsenceResponse = Omit<UserAbsence, "startDate" | "endDate"> & {
  startDate: string;
  endDate: string;
};

function parseUserAbsence(absence: UserAbsenceResponse): UserAbsence {
  return {
    ...absence,
    startDate: new Date(absence.startDate),
    endDate: new Date(absence.endDate),
  };
}

//////////////
////User/////
////////////

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

export async function updateUser(id: string, name: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
  });
}

export async function getUserAbsences(): Promise<UserAbsence[]> {
  const res = await fetch(`${API_URL}/user-absences`);
  const absences = (await res.json()) as UserAbsenceResponse[];

  return absences.map(parseUserAbsence);
}

export async function createUserAbsence(
  userId: string,
  startDate: Date,
  endDate: Date,
  reason: string
): Promise<UserAbsence> {
  const res = await fetch(`${API_URL}/user-absences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, startDate, endDate, reason }),
  });

  const absence = (await res.json()) as UserAbsenceResponse;

  return parseUserAbsence(absence);
}

export async function deleteUserAbsence(id: string): Promise<void> {
  await fetch(`${API_URL}/user-absences/${id}`, {
    method: "DELETE",
  });
}

/////////////
////Task////
///////////

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


/////////////////////////
////Task Completion ////
///////////////////////

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
  completedAt: Date
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


//////////////
////Stats////
////////////

export async function getStats(): Promise<Stat[]> {
  const res = await fetch(`${API_URL}/stats`);
  return res.json();
}


//////////////////
////Reminders////
////////////////

export async function getReminders(): Promise<Reminder[]> {
  const res = await fetch(`${API_URL}/reminders`);
  return res.json();
}

export async function createReminder(
  title: string,
  message: string,
  dueAt: string
): Promise<Reminder> {
  const res = await fetch(`${API_URL}/reminders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      message,
      dueAt,
    }),
  });

  return res.json();
}

export async function markReminderDone(id: string): Promise<Reminder> {
  const res = await fetch(`${API_URL}/reminders/${id}/done`, {
    method: "PATCH",
  });

  return res.json();
}

export async function deleteReminder(id: string): Promise<void> {
  await fetch(`${API_URL}/reminders/${id}`, {
    method: "DELETE",
  });
}

export async function triggerReminder(id: string): Promise<Reminder> {
  const res = await fetch(`${API_URL}/reminders/${id}/trigger`, {
    method: "PATCH",
  });

  return res.json();
}

export async function createReminderFromExisting(
  reminder: Reminder
): Promise<Reminder> {
  const res = await fetch(`${API_URL}/reminders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: reminder.title,
      message: reminder.message,
      dueAt: reminder.dueAt,
      done: reminder.done,
      triggered: reminder.triggered,
    }),
  });

  if (!res.ok) {
    throw new Error("Reminder konnte nicht wiederhergestellt werden.");
  }

  return res.json();
}

export async function reopenReminder(id: string): Promise<Reminder> {
  const res = await fetch(`${API_URL}/reminders/${id}/reopen`, {
    method: "PATCH",
  });

  if (!res.ok) {
    throw new Error("Reminder konnte nicht wieder geöffnet werden.");
  }

  return res.json();
}