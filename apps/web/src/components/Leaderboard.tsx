import type { Stat } from "@hausheld/types";

type Props = {
  stats: Stat[];
};

export function Leaderboard({ stats }: Props) {

  return (
    <section>
      <h2>Rangliste</h2>

      {stats.length === 0 && <p>Noch keine Personen.</p>}

      <ul>
        {stats.sort((a, b) => b.points - a.points).map((stat) => (
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