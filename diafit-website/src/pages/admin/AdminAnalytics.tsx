"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";
import { AdminHeader } from "./AdminLayout";
import {
  fetchDashboardStats,
  fetchUserGrowthChart,
  fetchWorkoutCharts,
  fetchMealCharts,
  fetchMedicationCharts,
  type DashboardStats,
  type UserGrowthPoint,
  type WeeklyMealsPoint,
  type AdherenceTrendPoint,
  type DateRange,
} from "@/lib/adminData";
import { DateRangeFilter } from "@/components/admin/DateRangeFilter";
import { Users, Dumbbell, UtensilsCrossed, Pill, ArrowRight } from "lucide-react";

const EMPTY_GROWTH: UserGrowthPoint[] = [
  { week: "W1", users: 0 },
  { week: "W2", users: 0 },
  { week: "W3", users: 0 },
  { week: "W4", users: 0 },
];

export function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userGrowth, setUserGrowth] = useState<UserGrowthPoint[]>(EMPTY_GROWTH);
  const [exerciseTop, setExerciseTop] = useState<{ name: string; sessions: number }[]>([]);
  const [mealWeekly, setMealWeekly] = useState<WeeklyMealsPoint[]>([]);
  const [medAdherence, setMedAdherence] = useState<AdherenceTrendPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchDashboardStats(),
      fetchUserGrowthChart(dateRange),
      fetchWorkoutCharts(dateRange),
      fetchMealCharts(dateRange),
      fetchMedicationCharts(dateRange),
    ])
      .then(([s, growth, workoutCharts, mealCharts, medCharts]) => {
        if (cancelled) return;
        setStats(s ?? null);
        setUserGrowth(growth.length ? growth : EMPTY_GROWTH);
        setExerciseTop((workoutCharts.popular || []).map((p) => ({ name: p.name, sessions: p.completedSessions })).slice(0, 5));
        setMealWeekly(mealCharts.weekly || []);
        setMedAdherence(medCharts.adherenceTrend || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [dateRange]);

  const totalUsers = stats?.totalUsers ?? 0;
  const activeToday = stats?.activeToday ?? 0;
  const workoutLogs = stats?.workoutLogs ?? 0;
  const mealLogs = stats?.mealLogs ?? 0;
  const scheduledTasks = stats?.scheduledTasks ?? 0;

  return (
    <>
      <AdminHeader
        title="Analytics"
        subtitle="Overview of platform metrics across user management, exercise, meal plans, and medications"
      />
      <div className="p-6 space-y-8">
        <div className="flex flex-wrap items-center justify-end">
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
        {/* User Management Analytics */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">User Management Analytics</h2>
            </div>
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--diafit-blue)] hover:underline"
            >
              View User Management <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 p-5 sm:grid-cols-3 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : totalUsers}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Active Today</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : activeToday}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Glucose Readings</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : (stats?.glucoseReadings ?? 0)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-3 lg:col-span-1">
              <p className="text-sm font-medium text-slate-500 mb-2">User growth (last 4 weeks)</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowth} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <XAxis dataKey="week" hide />
                    <YAxis hide />
                    <RechartsDevtools />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Exercise Analytics */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Dumbbell className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Exercise Analytics</h2>
            </div>
            <Link
              to="/admin/exercises"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--diafit-blue)] hover:underline"
            >
              View Exercise Monitoring <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 p-5 sm:grid-cols-3 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Total Sessions</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : workoutLogs}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Workout Logs</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : workoutLogs}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">From database</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">Live</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-3 lg:col-span-1">
              <p className="text-sm font-medium text-slate-500 mb-2">Top exercises (sessions)</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exerciseTop.length ? exerciseTop : [{ name: "—", sessions: 0 }]} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10 }} />
                    <Bar dataKey="sessions" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    <RechartsDevtools />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Meal Plan Analytics */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Meal Plan Analytics</h2>
            </div>
            <Link
              to="/admin/meal-plans"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--diafit-blue)] hover:underline"
            >
              View Meal Tracking <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 p-5 sm:grid-cols-3 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Total Meal Logs</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : mealLogs}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Active Today</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : activeToday}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">From database</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">Live</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-3 lg:col-span-1">
              <p className="text-sm font-medium text-slate-500 mb-2">Meals by day of week (last 30d)</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mealWeekly.length ? mealWeekly : [{ day: "—", meals: 0 }]} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="meals" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 3 }} />
                    <XAxis dataKey="day" hide />
                    <YAxis hide />
                    <RechartsDevtools />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Medication Analytics */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <Pill className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Medication Analytics</h2>
            </div>
            <Link
              to="/admin/medications"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--diafit-blue)] hover:underline"
            >
              View Medication Adherence <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 p-5 sm:grid-cols-3 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Scheduled Tasks</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : scheduledTasks}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Reminders</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "…" : scheduledTasks}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">From database</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">Live</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-3 lg:col-span-1">
              <p className="text-sm font-medium text-slate-500 mb-2">Adherence trend (task completions)</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={medAdherence.length ? medAdherence : [{ month: "—", rate: 0 }]} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="rate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <XAxis dataKey="month" hide />
                    <YAxis domain={[0, 100]} hide />
                    <RechartsDevtools />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
