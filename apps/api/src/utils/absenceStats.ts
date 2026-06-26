import type { TaskCompletion, User, UserAbsence } from "@hausheld/types";

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

export function calculateAwayStats(
  user: User,
  completions: TaskCompletion[],
  absences: UserAbsence[]
): {
  isAway: boolean;
  activeDays: number;
  absenceDays: number;
} {
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

  return {
    isAway: isCurrentlyAway(user.id, absences),
    activeDays,
    absenceDays
  };
}