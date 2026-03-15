"use client";

import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { renderPieLabelInside } from "@/components/admin/PieChartCustomLabel";
import { RechartsDevtools } from "@recharts/devtools";
import { AdminHeader } from "./AdminLayout";
import { useAdminConfirm } from "@/contexts/AdminModalContext";
import { fetchWorkoutLogs, fetchWorkoutCharts, type WorkoutLogRow, type DateRange } from "@/lib/adminData";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import {
  Layers,
  Users,
  Timer,
  CheckCircle,
  Search,
  Download,
  Eye,
} from "lucide-react";

function formatWorkoutDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const DEFAULT_WEEKLY = [
  { day: "Sun", sessions: 0 },
  { day: "Mon", sessions: 0 },
  { day: "Tue", sessions: 0 },
  { day: "Wed", sessions: 0 },
  { day: "Thu", sessions: 0 },
  { day: "Fri", sessions: 0 },
  { day: "Sat", sessions: 0 },
];

export function AdminExerciseMonitoring() {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this-week");
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularExercises, setPopularExercises] = useState<{ name: string; activeUsers: number; completedSessions: number }[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<{ day: string; sessions: number }[]>(DEFAULT_WEEKLY);
  const [categoryPreferences, setCategoryPreferences] = useState<{ name: string; value: number; color: string }[]>([]);
  const confirm = useAdminConfirm();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchWorkoutLogs(80, dateRange), fetchWorkoutCharts(dateRange)])
      .then(([rows, charts]) => {
        if (cancelled) return;
        setWorkoutLogs(rows);
        setPopularExercises(charts.popular || []);
        setWeeklyTrend(charts.weekly?.length ? charts.weekly : DEFAULT_WEEKLY);
        setCategoryPreferences(charts.categoryPreferences?.length ? charts.categoryPreferences : [{ name: "No data", value: 100, color: "#e2e8f0" }]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [dateRange]);

  const topActiveUsers = useMemo(() => {
    const byUser = new Map<string, { name: string; sessions: number; minutes: number }>();
    for (const row of workoutLogs) {
      const cur = byUser.get(row.user_id);
      const name = row.user_name ?? "Unknown";
      if (!cur) byUser.set(row.user_id, { name, sessions: 1, minutes: row.duration_minutes ?? 0 });
      else {
        cur.sessions += 1;
        cur.minutes += row.duration_minutes ?? 0;
      }
    }
    return [...byUser.values()]
      .map((u) => ({ name: u.name.length > 12 ? u.name.slice(0, 10) + "…" : u.name, sessions: u.sessions, hours: Math.round((u.minutes / 60) * 10) / 10 }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);
  }, [workoutLogs]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workoutLogs;
    return workoutLogs.filter(
      (r) =>
        (r.user_name ?? "").toLowerCase().includes(q) ||
        (r.custom_workout_name ?? "").toLowerCase().includes(q)
    );
  }, [workoutLogs, search]);

  const handleExport = () => {
    confirm({
      title: "Export data",
      message: "Export exercise activity data?",
      confirmLabel: "Export",
      onConfirm: () => console.log("Export exercise data", filteredRows.length),
    });
  };

  return (
    <>
      <AdminHeader
        title="Exercise Activity Monitoring"
        subtitle="Track what exercises users are doing and engagement metrics"
      />
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-end">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
        {/* KPI row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Sessions</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : workoutLogs.length}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600">From database</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Users</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {loading ? "…" : new Set(workoutLogs.map((r) => r.user_id)).size}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-600">With workout logs</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Avg. Duration</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {loading ? "…" : workoutLogs.length ? Math.round(workoutLogs.reduce((a, r) => a + (r.duration_minutes ?? 0), 0) / workoutLogs.length) + " min" : "0 min"}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-600">Per session</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Timer className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Completion Rate</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{workoutLogs.length ? "100%" : "—"}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600">Logged sessions</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Most Popular + Category Preferences */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Most Popular Exercises</h2>
            <p className="mt-0.5 text-sm text-slate-500">What users are exercising the most</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularExercises.length ? popularExercises : [{ name: "—", activeUsers: 0, completedSessions: 0 }]} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" domain={[0, "auto"]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "#475569" }} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="activeUsers" name="Active Users" fill="#8884d8" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="completedSessions" name="Completed Sessions" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                  <RechartsDevtools />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#8884d8]" /> Active Users</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#82ca9d]" /> Completed Sessions</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Exercise Category Preferences</h2>
            <p className="mt-0.5 text-sm text-slate-500">User preference by exercise type</p>
            <div className="mt-4 flex items-center gap-6">
              <PieChart
                style={{ width: "100%", maxWidth: 280, maxHeight: 280, aspectRatio: 1 }}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <defs>
                  <pattern id="pattern-checkers" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="5" height="5" fill="#e2e8f0" />
                    <rect x="5" y="5" width="5" height="5" fill="#e2e8f0" />
                    <rect x="5" y="0" width="5" height="5" fill="#94a3b8" />
                    <rect x="0" y="5" width="5" height="5" fill="#94a3b8" />
                  </pattern>
                </defs>
                <Pie
                  data={categoryPreferences}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={1}
                  isAnimationActive
                  label={renderPieLabelInside}
                  labelLine={false}
                >
                  {categoryPreferences.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsDevtools />
              </PieChart>
              <ul className="space-y-1.5">
                {categoryPreferences.map((c) => (
                  <li key={c.name} className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-700">{c.name}</span>
                    <span className="font-medium text-slate-900">{c.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Weekly Trend + Top Active Users */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Weekly Activity Trend</h2>
            <p className="mt-0.5 text-sm text-slate-500">Exercise sessions completed per day</p>
            <div className="mt-4 h-64 min-h-[240px] w-full" style={{ maxWidth: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyTrend}
                  margin={{ top: 20, right: 16, left: 0, bottom: 8 }}
                  onContextMenu={(_, e) => e?.preventDefault?.()}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis width={40} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#8884d8" fill="#8884d8" />
                  <RechartsDevtools />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Top Active Users</h2>
            <p className="mt-0.5 text-sm text-slate-500">Users with most exercise engagement this month</p>
            <ul className="mt-4 space-y-3">
              {topActiveUsers.map((u, i) => (
                <li key={u.name} className="flex items-center gap-3 rounded-lg border border-slate-100 py-2.5 pl-3 pr-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.sessions} sessions · {u.hours} hrs</p>
                  </div>
                  <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={`View ${u.name}`}>
                    <Eye className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* User Exercise Details table */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">User Exercise Details</h2>
            <p className="mt-0.5 text-sm text-slate-500">See exactly what exercises each user is doing</p>
          </div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search users or exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[var(--diafit-blue)]"
              >
                <option value="all">All Categories</option>
                <option value="strength">Strength</option>
                <option value="cardio">Cardio</option>
                <option value="flexibility">Flexibility</option>
              </select>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[var(--diafit-blue)]"
              >
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="all">All Time</option>
              </select>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-t border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-3 font-medium text-slate-700">User</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Workout</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Duration</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Calories</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Loading…</td></tr>
                ) : filteredRows.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No workout logs found</td></tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{row.user_name ?? "Unknown"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {row.custom_workout_name || "Workout"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{row.duration_minutes ?? 0} min</td>
                      <td className="px-5 py-3 text-slate-700">{row.calories_burned ?? 0}</td>
                      <td className="px-5 py-3 text-slate-600">{formatWorkoutDate(row.workout_date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
