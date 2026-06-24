export type User = {
  id: string;
  name: string;
};

export type Task = {
  id: string;
  name: string;
  points: number;
};

export type TaskCompletion = {
  id: string;
  completedAt: string;
  user: User;
  task: Task;
};

export type Stat = {
  userId: string;
  name: string;
  tasksDone: number;
  points: number;
};