"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Sector, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { renderPieLabelInside } from "@/components/admin/PieChartCustomLabel";
import { RechartsDevtools } from "@recharts/devtools";
import { AdminHeader } from "./AdminLayout";
import { useAdminConfirm } from "@/contexts/AdminModalContext";
import {
  Layers,
  Users,
  Timer,
  CheckCircle,
  Search,
  Download,
  Eye,
} from "lucide-react";

const KPI_CARDS = [
  { title: "Total Sessions", value: "14,392", change: "10% this week", icon: Layers, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { title: "Active Users", value: "2,156", change: "12% this week", icon: Users, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { title: "Avg. Duration", value: "23 min", change: "10% this week", icon: Timer, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  { title: "Completion Rate", value: "87%", change: "13% this week", icon: CheckCircle, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
];

const POPULAR_EXERCISES = [
  { name: "Squats", activeUsers: 2850, completedSessions: 2720 },
  { name: "Push-ups", activeUsers: 2640, completedSessions: 2510 },
  { name: "Plank", activeUsers: 2420, completedSessions: 2280 },
  { name: "Jumping Jacks", activeUsers: 2180, completedSessions: 2050 },
  { name: "Lunges", activeUsers: 1950, completedSessions: 1820 },
  { name: "Burpees", activeUsers: 1720, completedSessions: 1580 },
  { name: "Mountain Climbers", activeUsers: 1520, completedSessions: 1410 },
  { name: "Leg Raises", activeUsers: 1380, completedSessions: 1260 },
];

const CATEGORY_PREFERENCES = [
  { name: "Strength", value: 41, color: "#8884d8" },
  { name: "Cardio", value: 30, color: "#83a6ed" },
  { name: "Flexibility", value: 15, color: "#8dd1e1" },
  { name: "Balance", value: 8, color: "#82ca9d" },
  { name: "HIIT", value: 7, color: "#a4de6c" },
  { name: "Others", value: 14, color: "url(#pattern-checkers)" },
];

const categoryColors = CATEGORY_PREFERENCES.map((c) => c.color);

const CategoryPieCell = (props: React.ComponentProps<typeof Sector> & { index?: number }) => (
  <Sector {...props} fill={categoryColors[props.index ?? 0]} />
);

const WEEKLY_TREND = [
  { day: "Mon", sessions: 520 },
  { day: "Tue", sessions: 680 },
  { day: "Wed", sessions: 920 },
  { day: "Thu", sessions: 1100 },
  { day: "Fri", sessions: 850 },
  { day: "Sat", sessions: 1400 },
  { day: "Sun", sessions: 1220 },
];

const TOP_ACTIVE_USERS = [
  { name: "Sarah J.", sessions: 45, hours: 12.5 },
  { name: "Michael C.", sessions: 42, hours: 11.5 },
  { name: "Emily D.", sessions: 35, hours: 10.2 },
  { name: "Robert W.", sessions: 35, hours: 9.6 },
  { name: "Jennifer T.", sessions: 33, hours: 8.8 },
];

const USER_EXERCISE_ROWS = [
  { id: "1", name: "Sarah Johnson", email: "sarah@example.com", initials: "SJ", exercises: ["Squats", "Push-ups", "Plank", "Jumping Jacks"], totalSessions: 45, lastActivity: "2 hours ago" },
  { id: "2", name: "Michael Chen", email: "michael@example.com", initials: "MC", exercises: ["Plank", "Mountain Climbers", "Lunges"], totalSessions: 42, lastActivity: "5 hours ago" },
  { id: "3", name: "Emily Davis", email: "emily@example.com", initials: "ED", exercises: ["Plank", "Leg Raises", "Burpees", "Yoga"], totalSessions: 38, lastActivity: "1 hour ago" },
  { id: "4", name: "Robert Wilson", email: "robert@example.com", initials: "RW", exercises: ["Squats", "Lunges", "Jumping Jacks"], totalSessions: 35, lastActivity: "3 hours ago" },
  { id: "5", name: "Jennifer Taylor", email: "jennifer@example.com", initials: "JT", exercises: ["Push-ups", "Plank", "Burpees"], totalSessions: 33, lastActivity: "6 hours ago" },
  { id: "6", name: "David Martinez", email: "david@example.com", initials: "DM", exercises: ["Squats", "Mountain Climbers", "Leg Raises"], totalSessions: 28, lastActivity: "1 day ago" },
];


export function AdminExerciseMonitoring() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this-week");
  const confirm = useAdminConfirm();

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return USER_EXERCISE_ROWS;
    return USER_EXERCISE_ROWS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.exercises.some((e) => e.toLowerCase().includes(q))
    );
  }, [search]);

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
        {/* KPI row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_CARDS.map(({ title, value, change, icon: Icon, iconBg, iconColor }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{title}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
                  <p className="mt-1 text-xs font-medium text-emerald-600">{change}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Most Popular + Category Preferences */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Most Popular Exercises</h2>
            <p className="mt-0.5 text-sm text-slate-500">What users are exercising the most</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={POPULAR_EXERCISES} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" domain={[0, 3000]} tick={{ fontSize: 11, fill: "#64748b" }} />
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
                  data={CATEGORY_PREFERENCES}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={1}
                  isAnimationActive
                  shape={CategoryPieCell}
                  label={renderPieLabelInside}
                  labelLine={false}
                />
                <RechartsDevtools />
              </PieChart>
              <ul className="space-y-1.5">
                {CATEGORY_PREFERENCES.map((c) => (
                  <li key={c.name} className="flex items-center gap-2 text-sm">
                    {c.color.startsWith("url") ? (
                      <span className="h-3 w-3 shrink-0 rounded border border-slate-300 bg-slate-300" title="Checkerboard" />
                    ) : (
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                    )}
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
                  data={WEEKLY_TREND}
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
              {TOP_ACTIVE_USERS.map((u, i) => (
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
                  <th className="px-5 py-3 font-medium text-slate-700">Exercises They&apos;re Doing</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Total Sessions</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                          {row.initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{row.name}</p>
                          <p className="text-slate-500">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.exercises.map((ex) => (
                          <span
                            key={ex}
                            className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{row.totalSessions}</td>
                    <td className="px-5 py-3 text-slate-600">{row.lastActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
