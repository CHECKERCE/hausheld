import { ActivityLog } from "../components/ActivityLog";
import { CompleteTaskForm } from "../components/CompleteTaskForm";
import { Leaderboard } from "../components/Leaderboard";
import { OpenRemindersList } from "../components/OpenRemindersList";
import type { Reminder, Stat, Task, TaskCompletion, User } from "../types";

type Props = {
  users: User[];
  tasks: Task[];
  completions: TaskCompletion[];
  stats: Stat[];
  onCompleteTask: (userId: string, taskId: string) => Promise<void>;
  onDeleteCompletion: (id: string) => Promise<void>;
  reminders: Reminder[];
  onMarkReminderDone: (id: string) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
};

export function DashboardPage({
  users,
  tasks,
  completions,
  stats,
  reminders,
  onMarkReminderDone,
  onDeleteReminder,
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

      {reminders.length > 0 && (
        <OpenRemindersList
          reminders={reminders}
          onMarkDone={onMarkReminderDone}
          onDeleteReminder={onDeleteReminder}
        />
      )}

      <ActivityLog
        completions={completions}
        onDelete={onDeleteCompletion}
      />
    </>
  );
}