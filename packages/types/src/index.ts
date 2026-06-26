export type User = {
  id: string;
  name: string;
  telegramUserId?: string | null;
  telegramName?: string | null;
};

export type UserAbsence = {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  reason: string | null;
  user: User;
};

export type Task = {
  id: string;
  name: string;
  points: number;
};

export type TaskCompletion = {
  id: string;
  completedAt: Date;
  user: User;
  task: Task;
};

export type Stat = {
  userId: string;
  name: string;
  tasksDone: number;
  points: number;
  fairnessScore: number;
  isAway: boolean;
  activeDays: number;
  absenceDays: number;
};

export type Reminder = {
  id: string;
  title: string;
  message: string;
  dueAt: string;
  done: boolean;
  triggered: boolean;
  createdAt: string;
};

export type UndoAction =
  | {
    kind: "completionDeleted";
    message: string;
    completion: TaskCompletion;
  }
  | {
    kind: "reminderDeleted";
    message: string;
    reminder: Reminder;
  }
  | {
    kind: "reminderCompleted";
    message: string;
    reminder: Reminder;
  };