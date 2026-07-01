import type { Stat } from "@hausheld/types";

type Props = {
  stats: Stat[];
};

export function Leaderboard({ stats }: Props) {
  const sortedStats = [...stats].sort((a, b) => b.points - a.points);

  return (
    <section>
      <h2>Rangliste</h2>

      {stats.length === 0 && <p>Noch keine Personen.</p>}

      <ul>
        {sortedStats.map((stat) => (
          <li key={stat.userId}>
            <strong>{stat.name}</strong>
            {stat.isAway && " 🏖️ abwesend"}:{" "}
            {`${stat.points.toFixed(2)} Punkte, ${stat.activeDays} aktive Tage, ${stat.absenceDays} abwesend`}
          </li>
        ))}
      </ul>
    </section>
  );
}