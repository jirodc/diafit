"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Sector,
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
import { UtensilsCrossed, Users, Flame, TrendingUp, Search, Download, Eye } from "lucide-react";

const KPI_CARDS = [
  { title: "Total Meal Logs", value: "19,159", change: "11.5% this week", icon: UtensilsCrossed, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { title: "Active Trackers", value: "1,847", change: "12.3% this week", icon: Users, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { title: "Avg. Calories/Day", value: "1,865", change: "Within target range", icon: Flame, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { title: "Logging Rate", value: "82%", change: "1.5% this week", icon: TrendingUp, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
];

const POPULAR_MEALS = [
  { name: "Grilled Chicken Salad", activeUsers: 1320, totalLogs: 1280 },
  { name: "Baked Salmon", activeUsers: 1180, totalLogs: 1120 },
  { name: "Quinoa Bowl", activeUsers: 1050, totalLogs: 980 },
  { name: "Protein Pancakes", activeUsers: 920, totalLogs: 860 },
  { name: "Avocado Toast", activeUsers: 850, totalLogs: 790 },
  { name: "Smoothies", activeUsers: 780, totalLogs: 720 },
  { name: "Peanut Butter", activeUsers: 680, totalLogs: 620 },
];

const MEAL_TIME_PREFERENCES = [
  { name: "Lunch", value: 32, color: "#22c55e" },
  { name: "Dinner", value: 30, color: "#3b82f6" },
  { name: "Breakfast", value: 28, color: "#f97316" },
  { name: "Snacks", value: 10, color: "#8b5cf6" },
];

const WEEKLY_MEAL_LOGS = [
  { day: "Mon", meals: 1980 },
  { day: "Tue", meals: 1650 },
  { day: "Wed", meals: 1420 },
  { day: "Thu", meals: 1580 },
  { day: "Fri", meals: 1720 },
  { day: "Sat", meals: 1520 },
  { day: "Sun", meals: 1480 },
];

const CALORIE_RANGES = [
  { name: "Less than 500", value: 45, color: "#3b82f6" },
  { name: "500-750", value: 25, color: "#f97316" },
  { name: "750-1000", value: 15, color: "#ec4899" },
  { name: "Over 1000", value: 15, color: "#22c55e" },
];

const TOP_MEAL_LOGGERS = [
  { name: "Emma S.", mealLogs: 84 },
  { name: "James P.", mealLogs: 81 },
  { name: "Olivia M.", mealLogs: 78 },
  { name: "Noah K.", mealLogs: 75 },
  { name: "Ava L.", mealLogs: 72 },
];

const USER_MEAL_ROWS = [
  { id: "1", name: "Bryan Cancel", email: "bryan@example.com", initials: "BC", meals: ["Grilled Chicken Salad", "Quinoa Bowl", "Greek Yogurt", "Salmon"], totalLogs: 84, avgCalories: 1853, lastMeal: "1 hour ago" },
  { id: "2", name: "Jan Parker", email: "jan@example.com", initials: "JP", meals: ["Baked Salmon", "Quinoa Bowl", "Protein Pancakes", "Avocado Toast"], totalLogs: 81, avgCalories: 2133, lastMeal: "2 hours ago" },
  { id: "3", name: "Chad Martinez", email: "chad@example.com", initials: "CM", meals: ["Grilled Chicken Salad", "Smoothie Fruit", "Salad", "Fruit Bowl"], totalLogs: 78, avgCalories: 1853, lastMeal: "30 min ago" },
  { id: "4", name: "Nathan Nash", email: "nathan@example.com", initials: "NN", meals: ["Steak", "Chicken", "Stew", "Frozen Plank", "Quinoa Bowl"], totalLogs: 75, avgCalories: 2253, lastMeal: "3 hours ago" },
  { id: "5", name: "Ava Emman", email: "ava@example.com", initials: "AE", meals: ["Oatmeal Food", "Vegetable Stir Fry", "Smoothie", "Salad"], totalLogs: 72, avgCalories: 1753, lastMeal: "45 min ago" },
  { id: "6", name: "Han Chen", email: "han@example.com", initials: "HC", meals: ["Baked Salmon", "Brown Rice Bowl", "Eggs", "Chicken Breast"], totalLogs: 68, avgCalories: 1853, lastMeal: "4 hours ago" },
];

const mealTimeColors = MEAL_TIME_PREFERENCES.map((c) => c.color);
const MealTimePieCell = (props: React.ComponentProps<typeof Sector> & { index?: number }) => (
  <Sector {...props} fill={mealTimeColors[props.index ?? 0]} />
);

const calorieRangeColors = CALORIE_RANGES.map((c) => c.color);
const CaloriePieCell = (props: React.ComponentProps<typeof Sector> & { index?: number }) => (
  <Sector {...props} fill={calorieRangeColors[props.index ?? 0]} />
);

export function AdminMealPlanMonitoring() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("this-week");
  const confirm = useAdminConfirm();

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return USER_MEAL_ROWS;
    return USER_MEAL_ROWS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.meals.some((m) => m.toLowerCase().includes(q))
    );
  }, [search]);

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
        {/* KPI row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_CARDS.map(({ title, value, change, icon: Icon, iconBg, iconColor }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{title}</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
                  <p className={`mt-1 text-xs font-medium ${title.includes("Calories") ? "text-amber-600" : "text-emerald-600"}`}>{change}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Most Popular Meals + Meal Time Preferences */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Most Popular Meals</h2>
            <p className="mt-0.5 text-sm text-slate-500">What users are eating the most</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={POPULAR_MEALS} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
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
                  data={MEAL_TIME_PREFERENCES}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={1}
                  isAnimationActive
                  shape={MealTimePieCell}
                  label={renderPieLabelInside}
                  labelLine={false}
                />
                <RechartsDevtools />
              </PieChart>
              <ul className="space-y-1.5">
                {MEAL_TIME_PREFERENCES.map((c) => (
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
                  data={WEEKLY_MEAL_LOGS}
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
                  data={CALORIE_RANGES}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={1}
                  isAnimationActive
                  shape={CaloriePieCell}
                  label={renderPieLabelInside}
                  labelLine={false}
                />
                <RechartsDevtools />
              </PieChart>
              <ul className="space-y-1.5">
                {CALORIE_RANGES.map((c) => (
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
            {TOP_MEAL_LOGGERS.map((u, i) => (
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
                  <th className="px-5 py-3 font-medium text-slate-700">Meals They&apos;re Eating</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Total Logs</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Avg Calories</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Last Meal</th>
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
                        {row.meals.map((meal) => (
                          <span
                            key={meal}
                            className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                          >
                            {meal}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{row.totalLogs}</td>
                    <td className="px-5 py-3 text-slate-700">{row.avgCalories}</td>
                    <td className="px-5 py-3 text-slate-600">{row.lastMeal}</td>
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
