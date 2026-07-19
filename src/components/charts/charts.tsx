"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const COLORS = ["#DC2626", "#1E40AF", "#F59E0B", "#059669", "#7C3AED", "#DB2777"];

export function TopPlayersBarChart({
  data,
  dataKey,
  label,
}: {
  data: { name: string; value: number }[];
  dataKey?: string;
  label: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" name={label} fill="#DC2626" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TeamComparisonChart({
  data,
}: {
  data: { metric: string; [team: string]: number | string }[];
}) {
  const keys = data[0] ? Object.keys(data[0]).filter((k) => k !== "metric") : [];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GoalsDistributionPie({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function GoalsEvolutionLine({
  data,
}: {
  data: { match: string; [team: string]: number | string }[];
}) {
  const keys = data[0] ? Object.keys(data[0]).filter((k) => k !== "match") : [];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="match" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        {keys.map((k, i) => (
          <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
