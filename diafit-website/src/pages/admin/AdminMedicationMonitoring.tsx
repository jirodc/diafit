"use client";

import { useState, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { renderPieLabelInside } from "@/components/admin/PieChartCustomLabel";
import { RechartsDevtools } from "@recharts/devtools";
import { AdminHeader } from "./AdminLayout";
import { useAdminConfirm } from "@/contexts/AdminModalContext";
import { fetchScheduledTasks, fetchMedicationCharts, getDateRangeLabel, type ScheduledTaskRow, type DateRange } from "@/lib/adminData";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { downloadAdminTablePdf } from "@/lib/adminPdfExport";
import { Pill, Users, TrendingUp, AlertCircle, Search, Download, Eye } from "lucide-react";

const MEDICATION_TYPES_FALLBACK = [{ name: "Medication", value: 100, color: "#3b82f6" }];

export function AdminMedicationMonitoring() {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [search, setSearch] = useState("");
  const [enabledFilter, setEnabledFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [commonMedications, setCommonMedications] = useState<{ name: string; activeUsers: number; dosesLogged: number }[]>([]);
  const [adherenceTrend, setAdherenceTrend] = useState<{ month: string; rate: number }[]>([]);
  const [weeklyAdherence, setWeeklyAdherence] = useState<{ day: string; taken: number; missed: number }[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<{ name: string; value: number; color?: string }[]>([]);
  const [topAdherentUsers, setTopAdherentUsers] = useState<{ name: string; adherence: number; dosesLogged: number }[]>([]);
  const { confirm } = useAdminConfirm();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchScheduledTasks(100), fetchMedicationCharts(dateRange)])
      .then(([rows, charts]) => {
        if (cancelled) return;
        setScheduledTasks(rows);
        setCommonMedications(charts.common || []);
        setAdherenceTrend(charts.adherenceTrend || []);
        setWeeklyAdherence(charts.weeklyAdherence || []);
        setPreferredTimes(charts.preferredTimes || []);
        setTopAdherentUsers(charts.topAdherent || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [dateRange]);

  const medicationTasks = useMemo(() => scheduledTasks.filter((t) => t.task_type === "medication"), [scheduledTasks]);
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return medicationTasks.filter((r) => {
      if (enabledFilter === "enabled" && !r.enabled) return false;
      if (enabledFilter === "disabled" && r.enabled) return false;
      if (!q) return true;
      return (
        (r.user_name ?? "").toLowerCase().includes(q) ||
        (r.name ?? "").toLowerCase().includes(q) ||
        (r.medication_dosage ?? "").toLowerCase().includes(q)
      );
    });
  }, [medicationTasks, search, enabledFilter]);

  const handleExport = () => {
    confirm({
      title: "Export data",
      message: `Download a PDF of scheduled medication tasks as shown (charts period: ${getDateRangeLabel(dateRange)}; ${filteredRows.length} rows)?`,
      confirmLabel: "Export PDF",
      onConfirm: () => {
        downloadAdminTablePdf({
          title: "Medication schedules export",
          periodLabel: `${getDateRangeLabel(dateRange)} (dashboard charts); table = current task list`,
          columns: ["User", "Medication", "Type", "Time", "Enabled"],
          rows: filteredRows.map((r) => [
            r.user_name ?? "—",
            `${r.name ?? "—"}${r.medication_dosage ? ` (${r.medication_dosage})` : ""}`,
            r.task_type ?? "—",
            r.time ?? "—",
            r.enabled ? "Yes" : "No",
          ]),
          filenameBase: `diafit-medications-${getDateRangeLabel(dateRange).replace(/\s+/g, "-")}`,
        });
      },
    });
  };

  return (
    <>
      <AdminHeader
        title="Medication Adherence Monitoring"
        subtitle="Track medication compliance and user adherence actions"
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
                <p className="text-sm font-medium text-slate-500">Scheduled Medications</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : medicationTasks.length}</p>
                <p className="mt-1 text-xs font-medium text-emerald-600">From database</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Pill className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Users</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {loading ? "…" : new Set(medicationTasks.map((r) => r.user_id)).size}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-600">With medication tasks</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Enabled</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {loading ? "…" : medicationTasks.filter((t) => t.enabled).length}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-600">Active reminders</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Disabled</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {loading ? "…" : medicationTasks.filter((t) => !t.enabled).length}
                </p>
                <p className="mt-1 text-xs font-medium text-red-600">Paused</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Most Common Medications + Medication Types */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Most Common Medications</h2>
            <p className="mt-0.5 text-sm text-slate-500">Which medications users are taking</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commonMedications.length ? commonMedications : [{ name: "—", activeUsers: 0, dosesLogged: 0 }]} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" domain={[0, 9000]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "#475569" }} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="activeUsers" name="Active Users" fill="#83a6ed" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="dosesLogged" name="Doses Logged" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  <RechartsDevtools />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#83a6ed]" /> Active Users</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-[#6366f1]" /> Doses Logged</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Medication Types</h2>
            <p className="mt-0.5 text-sm text-slate-500">Distribution by medication type</p>
            <div className="mt-4 flex items-center gap-6">
              <PieChart style={{ width: "100%", maxWidth: 220, maxHeight: 220, aspectRatio: 1 }} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                <Pie data={MEDICATION_TYPES_FALLBACK} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} paddingAngle={1} isAnimationActive label={renderPieLabelInside} labelLine={false}>
                  {MEDICATION_TYPES_FALLBACK.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsDevtools />
              </PieChart>
              <ul className="space-y-1.5">
                {MEDICATION_TYPES_FALLBACK.map((c) => (
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

        {/* Medication Adherence Trend - full width */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Medication Adherence Trend</h2>
          <p className="mt-0.5 text-sm text-slate-500">Monthly adherence rate improvement over time</p>
          <div className="mt-4 h-64 min-h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adherenceTrend.length ? adherenceTrend : [{ month: "—", rate: 0 }]} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} width={36} />
                <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" name="Adherence %" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e" }} />
                <RechartsDevtools />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Adherence Pattern + Preferred Medication Times */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Weekly Adherence Pattern</h2>
            <p className="mt-0.5 text-sm text-slate-500">Distribution of missed by day</p>
            <div className="mt-4 w-full" style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyAdherence.length ? weeklyAdherence : [{ day: "—", taken: 0, missed: 0 }]}
                  margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis width={40} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="taken" name="Taken" stackId="a" fill="#22c55e" background />
                  <Bar dataKey="missed" name="Missed" stackId="a" fill="#ef4444" background />
                  <RechartsDevtools />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Preferred Medication Times</h2>
            <p className="mt-0.5 text-sm text-slate-500">When users take their medication</p>
            <div className="mt-4 flex items-center gap-6">
              <PieChart style={{ width: "100%", maxWidth: 220, maxHeight: 220, aspectRatio: 1 }} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                <Pie data={preferredTimes.length ? preferredTimes : [{ name: "No data", value: 100, color: "#e2e8f0" }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} paddingAngle={1} isAnimationActive label={renderPieLabelInside} labelLine={false}>
                  {(preferredTimes.length ? preferredTimes : [{ name: "No data", value: 100, color: "#e2e8f0" }]).map((entry) => (
                    <Cell key={entry.name} fill={entry.color ?? "#94a3b8"} />
                  ))}
                </Pie>
                <RechartsDevtools />
              </PieChart>
              <ul className="space-y-1.5">
                {preferredTimes.map((c) => (
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

        {/* Top Adherent Users */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Top Adherent Users</h2>
          <p className="mt-0.5 text-sm text-slate-500">Users with best medication compliance this month</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {topAdherentUsers.map((u, i) => (
              <div key={u.name} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">{i + 1}</span>
                <div>
                  <p className="font-medium text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.adherence}% adherence · {u.dosesLogged} doses logged</p>
                </div>
                <button type="button" className="ml-2 rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600" aria-label={`View ${u.name}`}>
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User Medication Trends table */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">User Medication Trends</h2>
            <p className="mt-0.5 text-sm text-slate-500">View exactly what medications each user is taking</p>
          </div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search users or medications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
              />
            </div>
            <select
              value={enabledFilter}
              onChange={(e) => setEnabledFilter(e.target.value as "all" | "enabled" | "disabled")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[var(--diafit-blue)]"
            >
              <option value="all">All schedules</option>
              <option value="enabled">Enabled only</option>
              <option value="disabled">Disabled only</option>
            </select>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-t border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-3 font-medium text-slate-700">User</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Medication</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Type</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Time</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Enabled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Loading…</td></tr>
                ) : filteredRows.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No medication tasks found</td></tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{row.user_name ?? "Unknown"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-800">
                          {row.name}{row.medication_dosage ? ` ${row.medication_dosage}` : ""}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{row.task_type}</td>
                      <td className="px-5 py-3 text-slate-700">{row.time ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${row.enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          {row.enabled ? "Yes" : "No"}
                        </span>
                      </td>
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
