import type { Stat } from "@hausheld/types";

type Props = {
  stats: Stat[];
};

export function Leaderboard({ stats }: Props) {

  return (
    <section>
      <h2>Fairness-Rangliste</h2>

      {stats.length === 0 && <p>Noch keine Personen.</p>}

      <ul>
        {stats.map((stat) => (
          <li key={stat.userId}>
            <strong>{stat.name}</strong>
            {stat.isAway && " 🏖️ abwesend"}:{" "}
            {stat.points.toFixed(2)} Punkte/Tag{" "}
            <span className="muted">
              ({stat.points} Punkte, {stat.activeDays} aktive Tage, {stat.absenceDays} abwesend)
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}