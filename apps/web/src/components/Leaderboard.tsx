import type { Stat } from "../types";

type Props = {
  stats: Stat[];
};

export function Leaderboard({ stats }: Props) {
  return (
    <section>
      <h2>Rangliste</h2>

      {stats.length === 0 && <p>Noch keine Einträge.</p>}

      <ul>
        {stats.map((stat) => (
          <li key={stat.userId}>
            <strong>{stat.name}</strong>: {stat.points} Punkte,{" "}
            {stat.tasksDone} Aufgaben
          </li>
        ))}
      </ul>
    </section>
  );
}