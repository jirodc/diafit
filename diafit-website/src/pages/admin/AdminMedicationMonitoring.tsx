"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Sector,
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
import { Pill, Users, TrendingUp, AlertCircle, Search, Download, Eye } from "lucide-react";

const KPI_CARDS = [
  { title: "Total Doses Logged", value: "169,256", change: "10% this week", icon: Pill, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  { title: "Active Users", value: "4,052", change: "5% this week", icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { title: "Adherence Rate", value: "91%", change: "12% this month", icon: TrendingUp, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { title: "Missed Doses", value: "2,171", change: "this month", icon: AlertCircle, iconBg: "bg-red-100", iconColor: "text-red-600" },
];

const COMMON_MEDICATIONS = [
  { name: "Metformin", activeUsers: 8200, dosesLogged: 7850 },
  { name: "Lisinopril", activeUsers: 6800, dosesLogged: 6520 },
  { name: "Simvastatin", activeUsers: 6200, dosesLogged: 5980 },
  { name: "Amlodipine", activeUsers: 5500, dosesLogged: 5280 },
  { name: "Levothyroxine", activeUsers: 5100, dosesLogged: 4920 },
  { name: "Atorvastatin", activeUsers: 4800, dosesLogged: 4600 },
  { name: "Omeprazole", activeUsers: 4400, dosesLogged: 4180 },
  { name: "Ibuprofen", activeUsers: 4000, dosesLogged: 3820 },
  { name: "Sertraline", activeUsers: 3600, dosesLogged: 3450 },
];

const MEDICATION_TYPES = [
  { name: "Oral", value: 40, color: "#3b82f6" },
  { name: "Insulin injections", value: 30, color: "#22c55e" },
  { name: "Blood pressure", value: 25, color: "#f97316" },
  { name: "Other", value: 5, color: "#8b5cf6" },
];

const ADHERENCE_TREND = [
  { month: "Jan", rate: 78 },
  { month: "Feb", rate: 82 },
  { month: "Mar", rate: 85 },
  { month: "Apr", rate: 87 },
  { month: "May", rate: 89 },
  { month: "Jun", rate: 91 },
];

const WEEKLY_ADHERENCE = [
  { day: "Mon", taken: 4200, missed: 180 },
  { day: "Tue", taken: 4350, missed: 150 },
  { day: "Wed", taken: 4280, missed: 170 },
  { day: "Thu", taken: 4400, missed: 140 },
  { day: "Fri", taken: 4320, missed: 160 },
  { day: "Sat", taken: 4100, missed: 220 },
  { day: "Sun", taken: 3980, missed: 250 },
];

const PREFERRED_TIMES = [
  { name: "Morning", value: 35, color: "#f97316" },
  { name: "Afternoon", value: 25, color: "#3b82f6" },
  { name: "Evening", value: 28, color: "#8b5cf6" },
  { name: "Night", value: 12, color: "#22c55e" },
];

const TOP_ADHERENT_USERS = [
  { name: "William H.", adherence: 99, dosesLogged: 91 },
  { name: "Sophia R.", adherence: 98, dosesLogged: 90 },
  { name: "James M.", adherence: 97, dosesLogged: 89 },
  { name: "Emma L.", adherence: 96, dosesLogged: 88 },
  { name: "Oliver K.", adherence: 95, dosesLogged: 87 },
];

const USER_MEDICATION_ROWS = [
  { id: "1", name: "William Haves", initials: "WH", medications: ["Metformin 500mg", "Lisinopril 20mg", "Atorvastatin 10mg"], adherence: 98, dosesThisWeek: 91, lastDose: "1 hour ago" },
  { id: "2", name: "Sophia Reed", initials: "SR", medications: ["Levothyroxine 50mcg", "Omeprazole 20mg", "Amlodipine 5mg"], adherence: 97, dosesThisWeek: 90, lastDose: "3 hours ago" },
  { id: "3", name: "James Miller", initials: "JM", medications: ["Metformin 500mg", "Simvastatin 20mg", "Lisinopril 10mg"], adherence: 96, dosesThisWeek: 88, lastDose: "2 hours ago" },
  { id: "4", name: "Emma Lee", initials: "EL", medications: ["Insulin Glargine", "Metformin 850mg"], adherence: 95, dosesThisWeek: 92, lastDose: "30 min ago" },
  { id: "5", name: "Oliver Kim", initials: "OK", medications: ["Amlodipine 10mg", "Atorvastatin 20mg", "Sertraline 50mg"], adherence: 94, dosesThisWeek: 86, lastDose: "4 hours ago" },
  { id: "6", name: "Ava Chen", initials: "AC", medications: ["Metformin 500mg", "Lisinopril 20mg", "Ibuprofen 400mg"], adherence: 93, dosesThisWeek: 84, lastDose: "1 hour ago" },
];

const medTypeColors = MEDICATION_TYPES.map((c) => c.color);
const MedTypePieCell = (props: React.ComponentProps<typeof Sector> & { index?: number }) => (
  <Sector {...props} fill={medTypeColors[props.index ?? 0]} />
);

const preferredTimeColors = PREFERRED_TIMES.map((c) => c.color);
const PreferredTimePieCell = (props: React.ComponentProps<typeof Sector> & { index?: number }) => (
  <Sector {...props} fill={preferredTimeColors[props.index ?? 0]} />
);

export function AdminMedicationMonitoring() {
  const [search, setSearch] = useState("");
  const confirm = useAdminConfirm();

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return USER_MEDICATION_ROWS;
    return USER_MEDICATION_ROWS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.medications.some((m) => m.toLowerCase().includes(q))
    );
  }, [search]);

  const handleExport = () => {
    confirm({
      title: "Export data",
      message: "Export medication adherence data?",
      confirmLabel: "Export",
      onConfirm: () => console.log("Export medication data", filteredRows.length),
    });
  };

  return (
    <>
      <AdminHeader
        title="Medication Adherence Monitoring"
        subtitle="Track medication compliance and user adherence actions"
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
                  <p className={`mt-1 text-xs font-medium ${title.includes("Missed") ? "text-red-600" : "text-emerald-600"}`}>{change}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Most Common Medications + Medication Types */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Most Common Medications</h2>
            <p className="mt-0.5 text-sm text-slate-500">Which medications users are taking</p>
            <div className="mt-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COMMON_MEDICATIONS} layout="vertical" margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
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
                <Pie data={MEDICATION_TYPES} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} paddingAngle={1} isAnimationActive shape={MedTypePieCell} label={renderPieLabelInside} labelLine={false} />
                <RechartsDevtools />
              </PieChart>
              <ul className="space-y-1.5">
                {MEDICATION_TYPES.map((c) => (
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
              <LineChart data={ADHERENCE_TREND} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
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
                  data={WEEKLY_ADHERENCE}
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
                <Pie data={PREFERRED_TIMES} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} paddingAngle={1} isAnimationActive shape={PreferredTimePieCell} label={renderPieLabelInside} labelLine={false} />
                <RechartsDevtools />
              </PieChart>
              <ul className="space-y-1.5">
                {PREFERRED_TIMES.map((c) => (
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
            {TOP_ADHERENT_USERS.map((u, i) => (
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
                  <th className="px-5 py-3 font-medium text-slate-700">Medications They&apos;re Taking</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Adherence</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Doses This Week</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Last Dose</th>
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
                        <p className="font-medium text-slate-900">{row.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.medications.map((med) => (
                          <span key={med} className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-800">
                            {med}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 min-w-[64px] overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${row.adherence}%` }} />
                        </div>
                        <span className="text-slate-700">{row.adherence}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{row.dosesThisWeek}</td>
                    <td className="px-5 py-3 text-slate-600">{row.lastDose}</td>
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
