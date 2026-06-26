import type { Stat, TaskCompletion, User, UserAbsence } from "@hausheld/types";

export type FairnessUserStat = {
  userId: string;
  name: string;
  points: number;
  tasksDone: number;
  activeDays: number;
  absenceDays: number;
  score: number;
  isAway: boolean;
  lastCompletedAt: string | null;
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysBetweenInclusive(start: Date, end: Date) {
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);

  const diffMs = endDay.getTime() - startDay.getTime();

  return Math.max(1, Math.floor(diffMs / 86_400_000) + 1);
}

function rangesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
) {
  return startA <= endB && startB <= endA;
}

function getOverlapDays(
  rangeStart: Date,
  rangeEnd: Date,
  absenceStart: Date,
  absenceEnd: Date
) {
  if (!rangesOverlap(rangeStart, rangeEnd, absenceStart, absenceEnd)) {
    return 0;
  }

  const overlapStart = new Date(
    Math.max(startOfDay(rangeStart).getTime(), startOfDay(absenceStart).getTime())
  );

  const overlapEnd = new Date(
    Math.min(startOfDay(rangeEnd).getTime(), startOfDay(absenceEnd).getTime())
  );

  return daysBetweenInclusive(overlapStart, overlapEnd);
}

function isCurrentlyAway(userId: string, absences: UserAbsence[]) {
  const now = new Date();

  return absences.some((absence) => {
    if (absence.userId !== userId) return false;

    return (
      now >= new Date(absence.startDate) &&
      now <= new Date(absence.endDate)
    );
  });
}

export function calculateFairnessStats(
  users: User[],
  stats: Stat[],
  completions: TaskCompletion[],
  absences: UserAbsence[]
): FairnessUserStat[] {
  const now = new Date();

  const firstCompletionDate =
    completions.length > 0
      ? new Date(
        Math.min(
          ...completions.map((completion) =>
            new Date(completion.completedAt).getTime()
          )
        )
      )
      : now;

  const totalDays = daysBetweenInclusive(firstCompletionDate, now);

  return users.map((user) => {
    const stat = stats.find((item) => item.userId === user.id);

    const userCompletions = completions.filter(
      (completion) => completion.user.id === user.id
    );

    const lastCompletion = [...userCompletions].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() -
        new Date(a.completedAt).getTime()
    )[0];

    const userAbsences = absences.filter(
      (absence) => absence.userId === user.id
    );

    const absenceDays = userAbsences.reduce((sum, absence) => {
      return (
        sum +
        getOverlapDays(
          firstCompletionDate,
          now,
          new Date(absence.startDate),
          new Date(absence.endDate)
        )
      );
    }, 0);

    const activeDays = Math.max(1, totalDays - absenceDays);

    const points = stat?.points ?? 0;
    const tasksDone = stat?.tasksDone ?? 0;

    return {
      userId: user.id,
      name: user.name,
      points,
      tasksDone,
      activeDays,
      absenceDays,
      score: points / activeDays,
      isAway: isCurrentlyAway(user.id, absences),
      lastCompletedAt: lastCompletion?.completedAt ?? null,
    };
  });
}