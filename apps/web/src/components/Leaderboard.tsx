import type { TaskCompletion, Stat, User, UserAbsence } from "../types";
import { calculateFairnessStats } from "../utils/fairness";

type Props = {
  users: User[];
  stats: Stat[];
  completions: TaskCompletion[];
  absences: UserAbsence[];
};

export function Leaderboard({ users, stats, completions, absences }: Props) {
  const fairnessStats = calculateFairnessStats(
    users,
    stats,
    completions,
    absences
  ).sort((a, b) => a.score - b.score);

  return (
    <section>
      <h2>Fairness-Rangliste</h2>

      {fairnessStats.length === 0 && <p>Noch keine Personen.</p>}

      <ul>
        {fairnessStats.map((stat) => (
          <li key={stat.userId}>
            <strong>{stat.name}</strong>
            {stat.isAway && " 🏖️ abwesend"}:{" "}
            {stat.score.toFixed(2)} Punkte/Tag{" "}
            <span className="muted">
              ({stat.points} Punkte, {stat.activeDays} aktive Tage, {stat.absenceDays} abwesend)
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}