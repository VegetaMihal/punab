"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NamedCount } from "@/lib/july-trends/types";

const COLORS = ["#0ea5e9", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#eab308", "#14b8a6", "#6366f1", "#ec4899", "#84cc16"];

export function VolumeChart({ data }: { data: { bucket: string; count: number; cumulative: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" name="Registrations" fill="#0ea5e9" />
        <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke="#f97316" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function BarTrend({ data, dataKey = "value", color = "#0ea5e9", horizontal }: { data: NamedCount[]; dataKey?: string; color?: string; horizontal?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
          </>
        )}
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PieTrend({ data }: { data: NamedCount[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label={{ fontSize: 11 }}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StackedYesNoChart({ data }: { data: { bucket: string; yes: number; no: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="yes" name="Yes" stackId="a" fill="#22c55e" />
        <Bar dataKey="no" name="No" stackId="a" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FunnelChart({ data }: { data: { bucket: string; registered: number; checkedIn: number; confirmed: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="registered" name="Registered" fill="#0ea5e9" />
        <Bar dataKey="checkedIn" name="Checked in" fill="#22c55e" />
        <Bar dataKey="confirmed" name="Confirmed" fill="#a855f7" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MissingRateChart({ data }: { data: { bucket: string; missingRate: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} unit="%" />
        <Tooltip />
        <Line type="monotone" dataKey="missingRate" name="Missing-field rate" stroke="#ef4444" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
