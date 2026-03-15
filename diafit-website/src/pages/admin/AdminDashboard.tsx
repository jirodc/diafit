import { AdminHeader } from "./AdminLayout";
import {
  Users,
  Activity,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const KPI_CARDS = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12.5% from last month",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Active Today",
    value: "1,234",
    change: "+8.2% from last month",
    icon: Activity,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    title: "Glucose Readings",
    value: "45,231",
    change: "+23.1% from last month",
    icon: TrendingUp,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    title: "AI Insights Generated",
    value: "12,847",
    change: "+15.3% from last month",
    icon: Sparkles,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
];

const RECENT_USERS = [
  { name: "John Smith", email: "john@example.com", initials: "JS", status: "active" },
  { name: "Sarah Johnson", email: "sarah@example.com", initials: "SJ", status: "active" },
  { name: "Michael Chen", email: "michael@example.com", initials: "MC", status: "pending" },
  { name: "Emily Davis", email: "emily@example.com", initials: "ED", status: "active" },
  { name: "Robert Wilson", email: "robert@example.com", initials: "RW", status: "active" },
];

const SYSTEM_METRICS = [
  { label: "API Response Time", value: "98ms", percent: 98, barColor: "bg-emerald-500" },
  { label: "Database Load", value: "42%", percent: 42, barColor: "bg-blue-500" },
  { label: "Storage Used", value: "67%", percent: 67, barColor: "bg-amber-500" },
  { label: "AI Model Performance", value: "92%", percent: 92, barColor: "bg-violet-500" },
];

function ProgressBar({ percent, barColor }: { percent: number; barColor: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full transition-all ${barColor}`}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  );
}

export function AdminDashboard() {
  return (
    <>
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Monitor your Diafit platform performance"
      />
      <div className="p-6">
        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_CARDS.map(({ title, value, change, icon: Icon, iconBg, iconColor }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
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

        {/* Bottom row: Recent signups + System health */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Recent User Signups */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Recent User Signups</h2>
              <p className="text-sm text-slate-500">Latest users who joined the platform</p>
            </div>
            <ul className="divide-y divide-slate-100">
              {RECENT_USERS.map((user) => (
                <li key={user.email} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {user.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{user.name}</p>
                    <p className="truncate text-sm text-slate-500">{user.email}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === "active"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* System Health */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-900">System Health</h2>
              <p className="text-sm text-slate-500">Current system status and performance</p>
            </div>
            <div className="space-y-5 p-5">
              {SYSTEM_METRICS.map(({ label, value, percent, barColor }) => (
                <div key={label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{label}</span>
                    <span className="text-slate-600">{value}</span>
                  </div>
                  <ProgressBar percent={percent} barColor={barColor} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
