"use client";

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
import { Users, Dumbbell, UtensilsCrossed, Pill, ArrowRight } from "lucide-react";

// User analytics
const USER_GROWTH = [
  { week: "W1", users: 2650 },
  { week: "W2", users: 2720 },
  { week: "W3", users: 2780 },
  { week: "W4", users: 2847 },
];
const USER_STATS = { total: "2,847", active: "1,234", newThisWeek: "127" };

// Exercise analytics
const EXERCISE_TOP = [
  { name: "Squats", sessions: 2720 },
  { name: "Push-ups", sessions: 2510 },
  { name: "Plank", sessions: 2280 },
];
const EXERCISE_STATS = { totalSessions: "14,392", activeUsers: "2,156", completionRate: "87%" };

// Meal plan analytics
const MEAL_WEEKLY = [
  { day: "Mon", logs: 1980 },
  { day: "Tue", logs: 1650 },
  { day: "Wed", logs: 1420 },
  { day: "Thu", logs: 1580 },
  { day: "Fri", logs: 1720 },
];
const MEAL_STATS = { totalLogs: "19,159", activeTrackers: "1,847", loggingRate: "82%" };

// Medication analytics
const MED_ADHERENCE = [
  { month: "Apr", rate: 87 },
  { month: "May", rate: 89 },
  { month: "Jun", rate: 91 },
];
const MED_STATS = { dosesLogged: "169,256", adherenceRate: "91%", missedDoses: "2,171" };

export function AdminAnalytics() {
  return (
    <>
      <AdminHeader
        title="Analytics"
        subtitle="Overview of platform metrics across user management, exercise, meal plans, and medications"
      />
      <div className="p-6 space-y-8">
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
              <p className="mt-1 text-2xl font-semibold text-slate-900">{USER_STATS.total}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Active Today</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{USER_STATS.active}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">New This Week</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{USER_STATS.newThisWeek}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-3 lg:col-span-1">
              <p className="text-sm font-medium text-slate-500 mb-2">User growth (last 4 weeks)</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={USER_GROWTH} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
              <p className="mt-1 text-2xl font-semibold text-slate-900">{EXERCISE_STATS.totalSessions}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Active Users</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{EXERCISE_STATS.activeUsers}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Completion Rate</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{EXERCISE_STATS.completionRate}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-3 lg:col-span-1">
              <p className="text-sm font-medium text-slate-500 mb-2">Top exercises (sessions)</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={EXERCISE_TOP} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
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
              <p className="mt-1 text-2xl font-semibold text-slate-900">{MEAL_STATS.totalLogs}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Active Trackers</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{MEAL_STATS.activeTrackers}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Logging Rate</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{MEAL_STATS.loggingRate}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-3 lg:col-span-1">
              <p className="text-sm font-medium text-slate-500 mb-2">Meals logged (Mon–Fri)</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MEAL_WEEKLY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="logs" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 3 }} />
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
              <p className="text-sm font-medium text-slate-500">Doses Logged</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{MED_STATS.dosesLogged}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Adherence Rate</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{MED_STATS.adherenceRate}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
              <p className="text-sm font-medium text-slate-500">Missed Doses (month)</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{MED_STATS.missedDoses}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-3 lg:col-span-1">
              <p className="text-sm font-medium text-slate-500 mb-2">Adherence trend</p>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MED_ADHERENCE} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <Area type="monotone" dataKey="rate" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <XAxis dataKey="month" hide />
                    <YAxis domain={[80, 100]} hide />
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
