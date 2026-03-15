import { useEffect, useState } from "react";
import { AdminHeader } from "./AdminLayout";
import { fetchDashboardStats, fetchRecentUsers, type DashboardStats, type RecentUser } from "@/lib/adminData";
import { Users, Activity, TrendingUp, UtensilsCrossed, Dumbbell, Calendar } from "lucide-react";

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, u] = await Promise.all([fetchDashboardStats(), fetchRecentUsers(5)]);
        if (!cancelled) {
          setStats(s ?? null);
          setRecentUsers(u);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const kpiCards = stats
    ? [
        { title: "Total Users", value: String(stats.totalUsers), change: "From profiles & website", icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
        { title: "Active Today", value: String(stats.activeToday), change: "Users with meal logs today", icon: Activity, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
        { title: "Glucose Readings", value: String(stats.glucoseReadings), change: "Total readings", icon: TrendingUp, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
        { title: "Meal Logs", value: String(stats.mealLogs), change: "Total logs", icon: UtensilsCrossed, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
        { title: "Workout Logs", value: String(stats.workoutLogs), change: "Total sessions", icon: Dumbbell, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
        { title: "Scheduled Tasks", value: String(stats.scheduledTasks), change: "Meals & medications", icon: Calendar, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
      ]
    : [];

  return (
    <>
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Monitor your Diafit platform performance"
      />
      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}
        {loading ? (
          <p className="text-slate-500">Loading dashboard…</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {kpiCards.map(({ title, value, change, icon: Icon, iconBg, iconColor }) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{title}</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
                      <p className="mt-1 text-xs text-slate-500">{change}</p>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">Recent User Signups</h2>
                  <p className="text-sm text-slate-500">Latest users (app profiles & website users)</p>
                </div>
                <ul className="divide-y divide-slate-100">
                  {recentUsers.length === 0 ? (
                    <li className="px-5 py-6 text-center text-sm text-slate-500">No users yet</li>
                  ) : (
                    recentUsers.map((user) => (
                      <li key={user.id} className="flex items-center gap-4 px-5 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                          {user.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900">{user.name}</p>
                          <p className="truncate text-sm text-slate-500">{user.email ?? "—"}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          active
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">Data overview</h2>
                  <p className="text-sm text-slate-500">Counts from your Supabase tables</p>
                </div>
                <div className="space-y-5 p-5">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Glucose readings</span>
                      <span className="text-slate-600">{stats?.glucoseReadings ?? 0}</span>
                    </div>
                    <ProgressBar percent={stats ? Math.min(100, (stats.glucoseReadings / 100) || 0) : 0} barColor="bg-violet-500" />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Meal logs</span>
                      <span className="text-slate-600">{stats?.mealLogs ?? 0}</span>
                    </div>
                    <ProgressBar percent={stats ? Math.min(100, (stats.mealLogs / 50) || 0) : 0} barColor="bg-amber-500" />
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">Workout logs</span>
                      <span className="text-slate-600">{stats?.workoutLogs ?? 0}</span>
                    </div>
                    <ProgressBar percent={stats ? Math.min(100, (stats.workoutLogs / 20) || 0) : 0} barColor="bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
