"use client";

import { useState, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { renderPieLabelInside } from "@/components/admin/PieChartCustomLabel";
import { RechartsDevtools } from "@recharts/devtools";
import { AdminHeader } from "./AdminLayout";
import { useAdminConfirm } from "@/contexts/AdminModalContext";
import { fetchMealLogs, fetchMealCharts, type MealLogRow, type DateRange } from "@/lib/adminData";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { UtensilsCrossed, Users, Flame, TrendingUp, Search, Download, Eye } from "lucide-react";

function formatMealTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const DEFAULT_WEEKLY_MEALS = [
  { day: "Sun", meals: 0 },
  { day: "Mon", meals: 0 },
  { day: "Tue", meals: 0 },
  { day: "Wed", meals: 0 },
  { day: "Thu", meals: 0 },
  { day: "Fri", meals: 0 },
  { day: "Sat", meals: 0 },
];

export function AdminMealPlanMonitoring() {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this-week");
  const [mealLogs, setMealLogs] = useState<MealLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularMeals, setPopularMeals] = useState<{ name: string; activeUsers: number; totalLogs: number }[]>([]);
  const [mealTimePreferences, setMealTimePreferences] = useState<{ name: string; value: number; color?: string }[]>([]);
  const [weeklyMealLogs, setWeeklyMealLogs] = useState<{ day: string; meals: number }[]>(DEFAULT_WEEKLY_MEALS);
  const [calorieRanges, setCalorieRanges] = useState<{ name: string; value: number; color?: string }[]>([]);
  const { confirm } = useAdminConfirm();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchMealLogs(80, dateRange), fetchMealCharts(dateRange)])
      .then(([rows, charts]) => {
        if (cancelled) return;
        setMealLogs(rows);
        setPopularMeals(charts.popular || []);
        setMealTimePreferences(charts.mealTimePreferences?.length ? charts.mealTimePreferences : []);
        setWeeklyMealLogs(charts.weekly?.length ? charts.weekly : DEFAULT_WEEKLY_MEALS);
        setCalorieRanges(charts.calorieRanges || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [dateRange]);

  const topMealLoggers = useMemo(() => {
    const byUser = new Map<string, { name: string; count: number }>();
    for (const row of mealLogs) {
      const cur = byUser.get(row.user_id);
      const name = row.user_name ?? "Unknown";
      if (!cur) byUser.set(row.user_id, { name: name.length > 10 ? name.slice(0, 8) + "…" : name, count: 1 });
      else cur.count += 1;
    }
    return [...byUser.values()].sort((a, b) => b.count - a.count).slice(0, 5).map((u) => ({ name: u.name, mealLogs: u.count }));
  }, [mealLogs]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mealLogs;
    return mealLogs.filter(
      (r) =>
        (r.user_name ?? "").toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q) ||
        (r.custom_food_name ?? "").toLowerCase().includes(q)
    );
  }, [mealLogs, search]);

  const handleExport = () => {
    confirm({
      title: "Export data",
      message: "Export meal tracking data?",
      confirmLabel: "Export",
      onConfirm: () => console.log("Export meal data", filteredRows.length),
    });
  };

  return (
    <>
      <AdminHeader
        title="Meal Tracking Monitoring"
        subtitle="Monitor what users are eating and nutrition actions"
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
                <p className="text-sm font-medium text-slate-500">Total Meal Logs</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : mealLogs.length}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600">From database</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Trackers</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {loading ? "…" : new Set(mealLogs.map((r) => r.user_id)).size}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-600">Users with meal logs</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Avg. Calories/Log</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {loading ? "…" : mealLogs.length ? Math.round(mealLogs.reduce((a, r) => a + (r.total_calories ?? 0), 0) / mealLogs.length) : "—"}
                </p>
                <p className="mt-1 text-xs font-medium text-amber-600">Per meal log</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Flame className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Logging Rate</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{mealLogs.length ? "100%" : "—"}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600">Logged entries</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Most Popular Meals + Meal Time Preferences */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Most Popular Meals</h2>
            <p className="mt-0.5 text-sm text-slate-500">What users are eating the most</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularMeals.length ? popularMeals : [{ name: "—", activeUsers: 0, totalLogs: 0 }]} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" domain={[0, 1400]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "#475569" }} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="activeUsers" name="Active Users" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="totalLogs" name="Total Logs" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <RechartsDevtools />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#22c55e]" /> Active Users</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#3b82f6]" /> Total Logs</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Meal Time Preferences</h2>
            <p className="mt-0.5 text-sm text-slate-500">When users log their meals</p>
            <div className="mt-4 flex items-center gap-6">
              <PieChart style={{ width: "100%", maxWidth: 220, maxHeight: 220, aspectRatio: 1 }} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                <Pie
                  data={mealTimePreferences.length ? mealTimePreferences : [{ name: "No data", value: 100, color: "#e2e8f0" }]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={1}
                  isAnimationActive
                  label={renderPieLabelInside}
                  labelLine={false}
                >
                  {(mealTimePreferences.length ? mealTimePreferences : [{ name: "No data", value: 100, color: "#e2e8f0" }]).map((entry) => (
                    <Cell key={entry.name} fill={entry.color ?? "#94a3b8"} />
                  ))}
                </Pie>
                <RechartsDevtools />
              </PieChart>
              <ul className="space-y-1.5">
                {mealTimePreferences.map((c) => (
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

        {/* Weekly Meal Logging + Calorie Range Distribution */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Weekly Meal Logging Activity</h2>
            <p className="mt-0.5 text-sm text-slate-500">Number of meals logged per day</p>
            <div className="mt-4 h-64 min-h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyMealLogs}
                  margin={{ top: 20, right: 16, left: 0, bottom: 8 }}
                  onContextMenu={(_, e) => e?.preventDefault?.()}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis width={40} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="meals" name="Meals" stroke="#22c55e" fill="#22c55e" />
                  <RechartsDevtools />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Calorie Range Distribution</h2>
            <p className="mt-0.5 text-sm text-slate-500">User meal calorie breakdown</p>
            <div className="mt-4 flex items-center gap-6">
              <PieChart style={{ width: "100%", maxWidth: 220, maxHeight: 220, aspectRatio: 1 }} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                <Pie
                  data={calorieRanges.length ? calorieRanges : [{ name: "No data", value: 100, color: "#e2e8f0" }]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={1}
                  isAnimationActive
                  label={renderPieLabelInside}
                  labelLine={false}
                >
                  {(calorieRanges.length ? calorieRanges : [{ name: "No data", value: 100, color: "#e2e8f0" }]).map((entry) => (
                    <Cell key={entry.name} fill={entry.color ?? "#94a3b8"} />
                  ))}
                </Pie>
                <RechartsDevtools />
              </PieChart>
              <ul className="space-y-1.5">
                {calorieRanges.map((c) => (
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

        {/* Top Meal Loggers */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Top Meal Loggers</h2>
          <p className="mt-0.5 text-sm text-slate-500">Users with most consistent meal tracking this month</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {topMealLoggers.map((u, i) => (
              <div
                key={u.name}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.mealLogs} meal logs</p>
                </div>
                <button type="button" className="ml-2 rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600" aria-label={`View ${u.name}`}>
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User Meal Details table */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">User Meal Details</h2>
            <p className="mt-0.5 text-sm text-slate-500">See exactly what meals each user is eating</p>
          </div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search users or meals..."
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
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
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
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-t border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-3 font-medium text-slate-700">User</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Category</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Food</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Calories</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Loading…</td></tr>
                ) : filteredRows.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No meal logs found</td></tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{row.user_name ?? "Unknown"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {row.category || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{row.custom_food_name || "—"}</td>
                      <td className="px-5 py-3 text-slate-700">{row.total_calories ?? 0}</td>
                      <td className="px-5 py-3 text-slate-600">{formatMealTime(row.meal_time)}</td>
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
