"use client";

import { useState, useMemo } from "react";
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
import {
  Search,
  Download,
  Shield,
  UserPlus,
  Clock,
  Activity,
  FileText,
  FlaskConical,
  Pill,
  UtensilsCrossed,
  Dumbbell,
  Heart,
  Calendar,
  Info,
  type LucideIcon,
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

const ACTIVITY_ICONS: Record<ActivityType, { icon: LucideIcon; bg: string; color: string }> = {
  consultation: { icon: FileText, bg: "bg-slate-100", color: "text-slate-600" },
  lab: { icon: FlaskConical, bg: "bg-blue-100", color: "text-blue-600" },
  glucose: { icon: Activity, bg: "bg-violet-100", color: "text-violet-600" },
  medication: { icon: Pill, bg: "bg-violet-100", color: "text-violet-600" },
  meal: { icon: UtensilsCrossed, bg: "bg-amber-100", color: "text-amber-600" },
  exercise: { icon: Dumbbell, bg: "bg-emerald-100", color: "text-emerald-600" },
  vitals: { icon: Heart, bg: "bg-red-100", color: "text-red-600" },
  appointment: { icon: Calendar, bg: "bg-blue-100", color: "text-blue-600" },
  cgm: { icon: Activity, bg: "bg-violet-100", color: "text-violet-600" },
  admin: { icon: Shield, bg: "bg-violet-100", color: "text-violet-600" },
  signup: { icon: UserPlus, bg: "bg-emerald-100", color: "text-emerald-600" },
};

const MOCK_LOGS: HistoryLogEntry[] = [
  { id: "1", timestamp: "2025-03-15T14:32:00Z", type: "new_user", activityType: "signup", action: "New user signed up", description: "Sarah Johnson joined the platform.", actor: "Patient", details: "sarah@example.com", status: "success" },
  { id: "2", timestamp: "2025-03-15T14:28:00Z", type: "admin", activityType: "admin", action: "Admin logged in", description: "Admin session started.", actor: "Admin User", details: "admin@diafit.com", status: "success" },
  { id: "3", timestamp: "2025-03-15T14:15:00Z", type: "admin", activityType: "consultation", action: "Consultation updated", description: "Follow-up consultation completed. Discussed glucose trends and medication adjustment.", actor: "Dr. Smith", status: "success" },
  { id: "4", timestamp: "2025-03-15T13:58:00Z", type: "new_user", activityType: "lab", action: "Lab results uploaded", description: "HbA1c: 7.2%, Fasting glucose: 145 mg/dL, Cholesterol: 185 mg/dL.", actor: "Nurse", status: "success" },
  { id: "5", timestamp: "2025-03-15T13:42:00Z", type: "new_user", activityType: "glucose", action: "Glucose reading", description: "Morning glucose reading: 142 mg/dL (within target range).", actor: "Patient", status: "success" },
  { id: "6", timestamp: "2025-03-15T13:20:00Z", type: "new_user", activityType: "glucose", action: "Glucose reading", description: "Morning glucose reading: 185 mg/dL (slightly elevated).", actor: "Patient", status: "warning" },
  { id: "7", timestamp: "2025-03-15T12:55:00Z", type: "new_user", activityType: "medication", action: "Medication taken", description: "Metformin 500mg – Morning dose confirmed via app.", actor: "Patient", status: "success" },
  { id: "8", timestamp: "2025-03-15T12:30:00Z", type: "new_user", activityType: "medication", action: "Medication taken", description: "Insulin Glargine 20 units – Morning dose.", actor: "Patient", status: "success" },
  { id: "9", timestamp: "2025-03-15T11:10:00Z", type: "new_user", activityType: "meal", action: "Meal logged", description: "Breakfast: Oatmeal with berries (40g carbs, 220 calories).", actor: "Patient", status: "success" },
  { id: "10", timestamp: "2025-03-15T10:45:00Z", type: "new_user", activityType: "meal", action: "Meal logged", description: "Dinner: Grilled salmon with vegetables (30g carbs, 450 calories).", actor: "Patient", status: "success" },
  { id: "11", timestamp: "2025-03-15T10:22:00Z", type: "new_user", activityType: "exercise", action: "Exercise logged", description: "30 min walk. 2.1 km, light intensity.", actor: "Patient", status: "success" },
  { id: "12", timestamp: "2025-03-14T18:00:00Z", type: "new_user", activityType: "vitals", action: "Vitals recorded", description: "Blood pressure 122/78 mmHg, heart rate 72 bpm.", actor: "Patient", status: "success" },
  { id: "13", timestamp: "2025-03-14T17:35:00Z", type: "admin", activityType: "appointment", action: "Appointment scheduled", description: "Follow-up visit with Dr. Smith on Mar 20, 2025.", actor: "Admin User", status: "success" },
  { id: "14", timestamp: "2025-03-14T16:50:00Z", type: "admin", activityType: "consultation", action: "Consultation completed", description: "Initial consultation notes and care plan updated.", actor: "Dr. Smith", status: "success" },
  { id: "15", timestamp: "2025-03-14T16:12:00Z", type: "new_user", activityType: "cgm", action: "CGM sensor placed", description: "Continuous glucose monitor sensor activated.", actor: "Nurse", status: "success" },
];

// Chart data: activity over last 7 days
const LOGS_BY_DAY = [
  { day: "Mar 9", admin: 12, newUser: 8 },
  { day: "Mar 10", admin: 18, newUser: 14 },
  { day: "Mar 11", admin: 15, newUser: 11 },
  { day: "Mar 12", admin: 22, newUser: 19 },
  { day: "Mar 13", admin: 20, newUser: 16 },
  { day: "Mar 14", admin: 24, newUser: 22 },
  { day: "Mar 15", admin: 11, newUser: 9 },
];

// Pie: Admin vs New user (for "Logs by Type" chart)
const LOGS_BY_TYPE = [
  { name: "Admin actions", value: 8, color: "#8b5cf6" },
  { name: "New user", value: 7, color: "#22c55e" },
];

// Top actions (bar)
const TOP_ACTIONS = [
  { action: "New user signed up", count: 6 },
  { action: "Admin logged in", count: 2 },
  { action: "Data exported", count: 3 },
  { action: "User profile updated", count: 2 },
  { action: "Email verified", count: 1 },
];

function formatLogTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

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
  const [typeFilter, setTypeFilter] = useState<"all" | LogType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | LogStatus>("all");
  const [dateFilter, setDateFilter] = useState("7d");
  const confirm = useAdminConfirm();

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_LOGS.filter((log) => {
      const matchType = typeFilter === "all" || log.type === typeFilter;
      const matchStatus = statusFilter === "all" || log.status === statusFilter;
      const matchSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q));
      return matchType && matchStatus && matchSearch;
    });
  }, [search, typeFilter, statusFilter]);

  const adminCount = MOCK_LOGS.filter((l) => l.type === "admin").length;
  const newUserCount = MOCK_LOGS.filter((l) => l.type === "new_user").length;

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
        {/* KPI cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total logs</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{MOCK_LOGS.length}</p>
                <p className="mt-1 text-xs text-slate-500">Last 7 days</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Admin actions</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{adminCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">New user events</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{newUserCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <UserPlus className="h-5 w-5" />
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
            <p className="mt-0.5 text-sm text-slate-500">Admin vs new user events per day</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={LOGS_BY_DAY} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} width={32} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="admin" name="Admin" stackId="a" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="newUser" name="New user" stackId="a" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                  <RechartsDevtools />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Logs by Type</h2>
            <p className="mt-0.5 text-sm text-slate-500">Admin actions vs new user activity</p>
            <div className="mt-4 flex items-center gap-6">
              <div className="h-52 w-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={LOGS_BY_TYPE}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {LOGS_BY_TYPE.map((entry, i) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <RechartsDevtools />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1.5">
                {LOGS_BY_TYPE.map((c) => (
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
              <BarChart data={TOP_ACTIONS} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
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
          Patient Activity History ({filteredLogs.length} entries found)
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
              onChange={(e) => setTypeFilter(e.target.value as "all" | LogType)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[var(--diafit-blue)]"
            >
              <option value="all">All Types</option>
              <option value="admin">Admin actions</option>
              <option value="new_user">New users</option>
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
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[var(--diafit-blue)]"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
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
          {filteredLogs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-slate-500 shadow-sm">
              No logs match your filters.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const { icon: Icon, bg, color } = ACTIVITY_ICONS[log.activityType];
              return (
                <div
                  key={log.id}
                  className="flex flex-wrap items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-nowrap"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg} ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{log.action}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{log.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatLogTimestamp(log.timestamp)}
                      </span>
                      <span>{log.actor}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {log.status === "success" && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        Success
                      </span>
                    )}
                    {log.status === "warning" && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        Warning
                      </span>
                    )}
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => {}}
                    >
                      <Info className="h-3.5 w-3.5" /> View
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
