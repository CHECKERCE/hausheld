import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Stat, TaskCompletion } from "@hausheld/types";

type Props = {
  stats: Stat[];
  completions: TaskCompletion[];
};

export function HistoryCharts({ stats, completions }: Props) {

  const countByTask = Object.values(
    completions.reduce<Record<string, { task: string; count: number }>>(
      (acc, completion) => {
        const taskId = completion.task.id;

        if (!acc[taskId]) {
          acc[taskId] = {
            task: completion.task.name,
            count: 0,
          };
        }

        acc[taskId].count += 1;
        return acc;
      },
      {}
    )
  ).sort((a, b) => b.count - a.count);

  const tooltipStyle = {
    backgroundColor: "#18181b",
    border: "1px solid #3f3f46",
    borderRadius: "12px",
    color: "#f4f4f5",
    boxShadow: "0 14px 30px rgba(0, 0, 0, 0.35)",
  };

  return (
    <section>
      <h2>Diagramme</h2>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Score pro Person</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats} margin={{ top: 10, right: 8, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />

              <Tooltip
                cursor={{ fill: "rgba(139, 92, 246, 0.12)" }}
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#f4f4f5" }}
                itemStyle={{ color: "#c4b5fd" }}
                formatter={(value) =>
                  typeof value === "number"
                    ? [value.toFixed(2), "score"]
                    : [value, "score"]
                }
              />

              <Bar
                dataKey="points"
                name="score"
                fill="#8b5cf6"
                radius={[7, 7, 2, 2]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Erledigungen pro Aufgabe</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={countByTask} margin={{ top: 10, right: 8, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="task"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
              />

              <Tooltip
                cursor={{ fill: "rgba(56, 189, 248, 0.1)" }}
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#f4f4f5" }}
                itemStyle={{ color: "#7dd3fc" }}
              />

              <Bar
                dataKey="count"
                name="Erledigungen"
                fill="#38bdf8"
                radius={[7, 7, 2, 2]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}