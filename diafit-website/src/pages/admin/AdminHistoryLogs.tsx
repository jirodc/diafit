"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";
import { AdminHeader } from "./AdminLayout";
import { useAdminConfirm } from "@/contexts/AdminModalContext";
import { fetchTaskCompletions, fetchHistoryCharts, type HistoryLogRow, type DateRange } from "@/lib/adminData";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import {
  Search,
  Download,
  Clock,
  Activity,
  FileText,
  CheckCircle,
} from "lucide-react";

export type LogType = "admin" | "new_user";

export type ActivityType =
  | "consultation"
  | "lab"
  | "glucose"
  | "medication"
  | "meal"
  | "exercise"
  | "vitals"
  | "appointment"
  | "cgm"
  | "admin"
  | "signup";

export type LogStatus = "success" | "warning";

export interface HistoryLogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  activityType: ActivityType;
  action: string;
  description: string;
  actor: string;
  details?: string;
  status: LogStatus;
}

const DEFAULT_BY_DAY = [
  { day: "Sun", completed: 0, skipped: 0 },
  { day: "Mon", completed: 0, skipped: 0 },
  { day: "Tue", completed: 0, skipped: 0 },
  { day: "Wed", completed: 0, skipped: 0 },
  { day: "Thu", completed: 0, skipped: 0 },
  { day: "Fri", completed: 0, skipped: 0 },
  { day: "Sat", completed: 0, skipped: 0 },
];

function formatLogTimestamp(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

export function AdminHistoryLogs() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "completed" | "skipped">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | LogStatus>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [completions, setCompletions] = useState<HistoryLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsByDay, setLogsByDay] = useState<{ day: string; completed: number; skipped: number }[]>(DEFAULT_BY_DAY);
  const [logsByType, setLogsByType] = useState<{ name: string; value: number; color: string }[]>([]);
  const [topActions, setTopActions] = useState<{ action: string; count: number }[]>([]);
  const { confirm } = useAdminConfirm();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchTaskCompletions(80, dateRange), fetchHistoryCharts(dateRange)])
      .then(([rows, charts]) => {
        if (cancelled) return;
        setCompletions(rows);
        setLogsByDay(charts.byDay?.length ? charts.byDay : DEFAULT_BY_DAY);
        setLogsByType(charts.byType || []);
        setTopActions(charts.topActions || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [dateRange]);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return completions.filter((log) => {
      const matchType = typeFilter === "all" || (typeFilter === "completed" && !log.skipped) || (typeFilter === "skipped" && log.skipped);
      const matchStatus = statusFilter === "all" || (statusFilter === "success" && !log.skipped) || (statusFilter === "warning" && log.skipped);
      const matchSearch =
        !q ||
        (log.user_name ?? "").toLowerCase().includes(q) ||
        (log.task_name ?? "").toLowerCase().includes(q);
      return matchType && matchStatus && matchSearch;
    });
  }, [completions, search, typeFilter, statusFilter]);

  const completedCount = completions.filter((c) => !c.skipped).length;
  const skippedCount = completions.filter((c) => c.skipped).length;

  const handleExport = () => {
    confirm({
      title: "Export logs",
      message: "Export history logs?",
      confirmLabel: "Export",
      onConfirm: () => console.log("Export logs", filteredLogs.length),
    });
  };

  return (
    <>
      <AdminHeader
        title="History Logs"
        subtitle="All admin actions and new user activity"
      />
      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-end">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
        {/* KPI cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total task logs</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : completions.length}</p>
                <p className="mt-1 text-xs text-slate-500">From database</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : completedCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Skipped</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : skippedCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Filtered</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{filteredLogs.length}</p>
                <p className="mt-1 text-xs text-slate-500">Current view</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Activity Over Time</h2>
            <p className="mt-0.5 text-sm text-slate-500">Task completions vs skipped by day of week</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logsByDay} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={32} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="completed" name="Completed" stackId="a" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="skipped" name="Skipped" stackId="a" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  <RechartsDevtools />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Logs by Type</h2>
            <p className="mt-0.5 text-sm text-slate-500">Completed vs skipped task logs</p>
            <div className="mt-4 flex items-center gap-6">
              <div className="h-52 w-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={logsByType.length ? logsByType : [{ name: "No data", value: 1, color: "#e2e8f0" }]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {(logsByType.length ? logsByType : [{ name: "No data", value: 1, color: "#e2e8f0" }]).map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <RechartsDevtools />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5">
                {logsByType.map((c) => (
                  <li key={c.name} className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-700">{c.name}</span>
                    <span className="font-medium text-slate-900">{c.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Top actions bar chart */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Top Actions</h2>
          <p className="mt-0.5 text-sm text-slate-500">Most frequent log actions</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topActions.length ? topActions : [{ action: "—", count: 0 }]} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis type="category" dataKey="action" width={140} tick={{ fontSize: 11, fill: "#475569" }} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" name="Count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <RechartsDevtools />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Task Completion History ({loading ? "…" : filteredLogs.length} entries)
        </h2>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | "completed" | "skipped")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[var(--diafit-blue)]"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="skipped">Skipped</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | LogStatus)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[var(--diafit-blue)]"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
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

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500 shadow-sm">
              Loading…
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500 shadow-sm">
              No task completions match your filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-wrap items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-nowrap"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${log.skipped ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                  {log.skipped ? <Activity className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{log.skipped ? "Task skipped" : "Task completed"}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{log.task_name ?? "Task"}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatLogTimestamp(log.completed_at)}
                    </span>
                    <span>{log.user_name ?? "Unknown"}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {log.skipped ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">Skipped</span>
                  ) : (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Completed</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
