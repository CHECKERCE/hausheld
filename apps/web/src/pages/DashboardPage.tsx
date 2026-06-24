import { ActivityLog } from "../components/ActivityLog";
import { CompleteTaskForm } from "../components/CompleteTaskForm";
import { Leaderboard } from "../components/Leaderboard";
import type { Stat, Task, TaskCompletion, User } from "../types";

type Props = {
  users: User[];
  tasks: Task[];
  completions: TaskCompletion[];
  stats: Stat[];
  onCompleteTask: (userId: string, taskId: string) => Promise<void>;
  onDeleteCompletion: (id: string) => Promise<void>;
};

export function DashboardPage({
  users,
  tasks,
  completions,
  stats,
  onCompleteTask,
  onDeleteCompletion,
}: Props) {
  return (
    <>
      <CompleteTaskForm
        users={users}
        tasks={tasks}
        onComplete={onCompleteTask}
      />

      <Leaderboard stats={stats} />

      <ActivityLog
        completions={completions}
        onDelete={onDeleteCompletion}
      />
    </>
  );
}