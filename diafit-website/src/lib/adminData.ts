import { supabase } from "@/lib/supabase";

/** Date range for charts/tabs: today, 7d, 30d, all */
export type DateRange = "today" | "7d" | "30d" | "all";

/** Returns start (inclusive) and end (exclusive) for the range; all = nulls (no filter). */
export function getDateRangeBounds(range: DateRange): { start: Date | null; end: Date | null } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  if (range === "all") return { start: null, end: null };
  const start = new Date();
  if (range === "today") {
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }
  if (range === "7d") {
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }
  // 30d
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

/** Role derived from email: admin@diafit.com → Super admin, *@diafit.com → Admin, else → Patient */
export function getRoleFromEmail(email: string | null | undefined): "Super admin" | "Admin" | "Patient" {
  const e = (email ?? "").trim().toLowerCase();
  if (e === "admin@diafit.com") return "Super admin";
  if (e.endsWith("@diafit.com")) return "Admin";
  return "Patient";
}

export interface DashboardStats {
  totalUsers: number;
  activeToday: number;
  glucoseReadings: number;
  mealLogs: number;
  workoutLogs: number;
  scheduledTasks: number;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string | null;
  initials: string;
  created_at: string;
}

export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  if (!supabase) return null;
  const [
    { count: totalUsers },
    { count: glucoseReadings },
    { count: mealLogs },
    { count: workoutLogs },
    { count: scheduledTasks },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("glucose_readings").select("id", { count: "exact", head: true }),
    supabase.from("meal_logs").select("id", { count: "exact", head: true }),
    supabase.from("workout_logs").select("id", { count: "exact", head: true }),
    supabase.from("scheduled_tasks").select("id", { count: "exact", head: true }),
  ]);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  const { data: todayMeals } = await supabase
    .from("meal_logs")
    .select("user_id")
    .gte("meal_time", todayStart.toISOString())
    .lt("meal_time", todayEnd.toISOString());
  const activeToday = new Set((todayMeals ?? []).map((m) => m.user_id)).size;
  return {
    totalUsers: totalUsers ?? 0,
    activeToday,
    glucoseReadings: glucoseReadings ?? 0,
    mealLogs: mealLogs ?? 0,
    workoutLogs: workoutLogs ?? 0,
    scheduledTasks: scheduledTasks ?? 0,
  };
}

export async function fetchRecentUsers(limit = 10): Promise<RecentUser[]> {
  if (!supabase) return [];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  const { data: websiteProfiles } = await supabase
    .from("website_user_profiles")
    .select("user_id, full_name, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  const recent: RecentUser[] = [];
  const seen = new Set<string>();
  const getInitials = (name: string | null, email: string | null) => {
    if (name?.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "?";
  };
  for (const p of profiles ?? []) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    recent.push({
      id: p.id,
      name: p.full_name || p.email || "Unknown",
      email: p.email ?? null,
      initials: getInitials(p.full_name, p.email),
      created_at: p.created_at,
    });
  }
  for (const w of websiteProfiles ?? []) {
    if (seen.has(w.user_id)) continue;
    seen.add(w.user_id);
    recent.push({
      id: w.user_id,
      name: w.full_name || "Website user",
      email: null,
      initials: w.full_name ? getInitials(w.full_name, null) : "W",
      created_at: w.created_at,
    });
  }
  recent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return recent.slice(0, limit);
}

export type AdminUserRole = "Super admin" | "Admin" | "Patient";

/** Call this from the admin panel so the current admin shows as "Active" while using the site. */
export async function updateAdminLastSeen(userId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("admins").update({ last_seen_at: new Date().toISOString() }).eq("id", userId);
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string | null;
  initials: string;
  role: AdminUserRole;
  status: string;
  lastActive: string;
  glucoseReadings: number;
  source: "app" | "website";
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  if (!supabase) return [];
  const [
    { data: profiles },
    { data: websiteProfiles },
    { data: glucoseCounts },
    { data: admins },
    { data: workoutLogs },
    { data: mealLogs },
    { data: taskCompletions },
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, updated_at").order("updated_at", { ascending: false }),
    supabase.from("website_user_profiles").select("user_id, full_name, created_at").order("created_at", { ascending: false }),
    supabase.from("glucose_readings").select("user_id"),
    supabase.from("admins").select("id, email, last_seen_at"),
    supabase.from("workout_logs").select("user_id, workout_date").order("workout_date", { ascending: false }).limit(500),
    supabase.from("meal_logs").select("user_id, meal_time").order("meal_time", { ascending: false }).limit(500),
    supabase.from("task_completions").select("user_id, completed_at").order("completed_at", { ascending: false }).limit(500),
  ]);
  const adminEmailById = new Map<string, string>((admins ?? []).map((a) => [a.id, (a.email ?? "").trim().toLowerCase()]));
  const adminLastSeenById = new Map<string, number>(
    (admins ?? [])
      .filter((a) => a.last_seen_at != null)
      .map((a) => [a.id, new Date((a as { last_seen_at?: string }).last_seen_at!).getTime()])
  );
  const countByUser: Record<string, number> = {};
  for (const g of glucoseCounts ?? []) {
    countByUser[g.user_id] = (countByUser[g.user_id] ?? 0) + 1;
  }
  /** Latest activity timestamp per user (from workouts, meals, task completions) */
  const lastActivityMsByUser = new Map<string, number>();
  for (const row of workoutLogs ?? []) {
    const ts = new Date(row.workout_date).getTime();
    const cur = lastActivityMsByUser.get(row.user_id);
    if (cur === undefined || ts > cur) lastActivityMsByUser.set(row.user_id, ts);
  }
  for (const row of mealLogs ?? []) {
    const ts = new Date(row.meal_time).getTime();
    const cur = lastActivityMsByUser.get(row.user_id);
    if (cur === undefined || ts > cur) lastActivityMsByUser.set(row.user_id, ts);
  }
  for (const row of taskCompletions ?? []) {
    const ts = new Date(row.completed_at).getTime();
    const cur = lastActivityMsByUser.get(row.user_id);
    if (cur === undefined || ts > cur) lastActivityMsByUser.set(row.user_id, ts);
  }
  /** Active = had real activity (workout, meal, or task) within this many minutes */
  const ACTIVE_WITHIN_MINUTES = 10;
  const nowMs = Date.now();
  const isActive = (dateStrOrMs: string | number) => {
    const ms = typeof dateStrOrMs === "number" ? dateStrOrMs : new Date(dateStrOrMs).getTime();
    return nowMs - ms <= ACTIVE_WITHIN_MINUTES * 60 * 1000;
  };
  const getLastActiveMs = (userId: string, profileUpdatedAt: string): number => {
    const fromActivity = lastActivityMsByUser.get(userId);
    const fromProfile = new Date(profileUpdatedAt).getTime();
    const fromAdminPanel = adminLastSeenById.get(userId);
    let best = fromActivity ?? fromProfile;
    if (fromAdminPanel !== undefined && fromAdminPanel > best) best = fromAdminPanel;
    if (fromActivity !== undefined && fromActivity > best) best = fromActivity;
    if (fromProfile > best) best = fromProfile;
    return best;
  };
  const formatLastActive = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };
  const getInitials = (name: string | null, email: string | null) => {
    if (name?.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return "?";
  };
  const rows: AdminUserRow[] = [];
  for (const p of profiles ?? []) {
    const email = p.email ?? null;
    const lastMs = getLastActiveMs(p.id, p.updated_at);
    const lastAt = new Date(lastMs).toISOString();
    rows.push({
      id: p.id,
      name: p.full_name || p.email || "Unknown",
      email,
      initials: getInitials(p.full_name, p.email),
      role: getRoleFromEmail(email),
      status: isActive(lastMs) ? "active" : "inactive",
      lastActive: formatLastActive(lastAt),
      glucoseReadings: countByUser[p.id] ?? 0,
      source: "app",
    });
  }
  for (const w of websiteProfiles ?? []) {
    if (rows.some((r) => r.id === w.user_id)) continue;
    const email = adminEmailById.get(w.user_id) ?? null;
    const fromActivity = lastActivityMsByUser.get(w.user_id);
    const fromAdminPanel = adminLastSeenById.get(w.user_id);
    const fromCreated = new Date(w.created_at).getTime();
    const lastMs = Math.max(fromActivity ?? 0, fromAdminPanel ?? 0, fromCreated);
    const lastAt = new Date(lastMs).toISOString();
    rows.push({
      id: w.user_id,
      name: w.full_name || "Website user",
      email: email ?? null,
      initials: w.full_name ? getInitials(w.full_name, email) : "W",
      role: getRoleFromEmail(email),
      status: isActive(lastMs) ? "active" : "inactive",
      lastActive: formatLastActive(lastAt),
      glucoseReadings: countByUser[w.user_id] ?? 0,
      source: "website",
    });
  }
  rows.sort((a, b) => {
    const aGlucose = a.glucoseReadings;
    const bGlucose = b.glucoseReadings;
    return bGlucose - aGlucose;
  });
  return rows;
}

// --- Workout logs for Exercise monitoring ---
export interface WorkoutLogRow {
  id: string;
  user_id: string;
  custom_workout_name: string | null;
  duration_minutes: number;
  calories_burned: number;
  workout_date: string;
  user_name?: string;
}

export async function fetchWorkoutLogs(limit = 50, range?: DateRange): Promise<WorkoutLogRow[]> {
  if (!supabase) return [];
  const { data: logs } = await supabase
    .from("workout_logs")
    .select("id, user_id, custom_workout_name, duration_minutes, calories_burned, workout_date")
    .order("workout_date", { ascending: false })
    .limit(Math.max(limit, 500));
  if (!logs?.length) return [];
  const bounds = range ? getDateRangeBounds(range) : null;
  const filtered = bounds?.start
    ? logs.filter((l) => {
        const d = new Date(l.workout_date);
        return d >= bounds.start! && (!bounds.end || d <= bounds.end);
      })
    : logs;
  const limited = filtered.slice(0, limit);
  const userIds = [...new Set(limited.map((l) => l.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
  const nameBy = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.id]));
  return limited.map((l) => ({
    ...l,
    user_name: nameBy.get(l.user_id) ?? "Unknown",
  }));
}

// --- Meal logs for Meal Plan monitoring ---
export interface MealLogRow {
  id: string;
  user_id: string;
  category: string;
  custom_food_name: string | null;
  total_calories: number;
  meal_time: string;
  user_name?: string;
}

export async function fetchMealLogs(limit = 50, range?: DateRange): Promise<MealLogRow[]> {
  if (!supabase) return [];
  const { data: logs } = await supabase
    .from("meal_logs")
    .select("id, user_id, category, custom_food_name, total_calories, meal_time")
    .order("meal_time", { ascending: false })
    .limit(Math.max(limit, 500));
  if (!logs?.length) return [];
  const bounds = range ? getDateRangeBounds(range) : null;
  const filtered = bounds?.start
    ? logs.filter((l) => {
        const d = new Date(l.meal_time);
        return d >= bounds.start! && (!bounds.end || d <= bounds.end);
      })
    : logs;
  const limited = filtered.slice(0, limit);
  const userIds = [...new Set(limited.map((l) => l.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
  const nameBy = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.id]));
  return limited.map((l) => ({
    ...l,
    user_name: nameBy.get(l.user_id) ?? "Unknown",
  }));
}

// --- Scheduled tasks (medications) for Medication monitoring ---
export interface ScheduledTaskRow {
  id: string;
  user_id: string;
  name: string;
  task_type: string;
  time: string;
  enabled: boolean;
  medication_dosage: string | null;
  user_name?: string;
}

export async function fetchScheduledTasks(limit = 100): Promise<ScheduledTaskRow[]> {
  if (!supabase) return [];
  const { data: tasks } = await supabase
    .from("scheduled_tasks")
    .select("id, user_id, name, task_type, time, enabled, medication_dosage")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!tasks?.length) return [];
  const userIds = [...new Set(tasks.map((t) => t.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
  const nameBy = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.id]));
  return tasks.map((t) => ({
    ...t,
    user_name: nameBy.get(t.user_id) ?? "Unknown",
  }));
}

// --- Task completions + recent activity for History logs ---
export interface HistoryLogRow {
  id: string;
  user_id: string;
  completed_at: string;
  skipped: boolean;
  user_name?: string;
  task_name?: string;
}

export async function fetchTaskCompletions(limit = 50, range?: DateRange): Promise<HistoryLogRow[]> {
  if (!supabase) return [];
  const { data: raw } = await supabase
    .from("task_completions")
    .select("id, user_id, completed_at, skipped, scheduled_tasks(name)")
    .order("completed_at", { ascending: false })
    .limit(Math.max(limit, 500));
  if (!raw?.length) return [];
  const bounds = range ? getDateRangeBounds(range) : null;
  const completions = bounds?.start
    ? raw.filter((c) => {
        const d = new Date(c.completed_at);
        return d >= bounds.start! && (!bounds.end || d <= bounds.end);
      }).slice(0, limit)
    : raw.slice(0, limit);
  const userIds = [...new Set(completions.map((c) => c.user_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
  const nameBy = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.id]));
  return completions.map((c) => {
    const st = (c as unknown as { scheduled_tasks?: { name: string } | null }).scheduled_tasks;
    return {
      id: c.id,
      user_id: c.user_id,
      completed_at: c.completed_at,
      skipped: c.skipped ?? false,
      user_name: nameBy.get(c.user_id) ?? "Unknown",
      task_name: st?.name ?? "Task",
    };
  });
}

// --- Chart data: user growth (last 4 weeks) ---
export interface UserGrowthPoint {
  week: string;
  users: number;
}

export async function fetchUserGrowthChart(range?: DateRange): Promise<UserGrowthPoint[]> {
  if (!supabase) return [];
  const { data: profiles } = await supabase.from("profiles").select("created_at").order("created_at", { ascending: true });
  const { data: website } = await supabase.from("website_user_profiles").select("created_at").order("created_at", { ascending: true });
  let allDates = [...(profiles ?? []).map((p) => new Date(p.created_at)), ...(website ?? []).map((w) => new Date(w.created_at))];
  const bounds = range ? getDateRangeBounds(range) : null;
  if (bounds?.start) {
    allDates = allDates.filter((d) => d >= bounds.start! && (!bounds.end || d <= bounds.end));
  }
  const now = new Date();
  const points: UserGrowthPoint[] = [];
  const weeks = range === "today" ? 1 : range === "7d" ? 1 : range === "30d" ? 4 : 4;
  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7 * (w + 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = allDates.filter((d) => d >= weekStart && d < weekEnd).length;
    points.push({ week: `W${weeks - w}`, users: count });
  }
  if (points.length === 0) points.push({ week: "—", users: 0 });
  return points;
}

// --- Chart data: workout popular exercises + weekly trend ---
export interface PopularExercisePoint {
  name: string;
  activeUsers: number;
  completedSessions: number;
}

export interface WeeklySessionsPoint {
  day: string;
  sessions: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface CategoryPreferencePoint {
  name: string;
  value: number;
  color: string;
}

export async function fetchWorkoutCharts(range?: DateRange): Promise<{
  popular: PopularExercisePoint[];
  weekly: WeeklySessionsPoint[];
  categoryPreferences: CategoryPreferencePoint[];
}> {
  if (!supabase) return { popular: [], weekly: [], categoryPreferences: [] };
  const { data: logs } = await supabase
    .from("workout_logs")
    .select("user_id, custom_workout_name, workout_date")
    .order("workout_date", { ascending: false })
    .limit(500);
  if (!logs?.length) return { popular: [], weekly: [], categoryPreferences: [] };
  const bounds = range ? getDateRangeBounds(range) : null;
  const filtered = bounds?.start
    ? logs.filter((row) => {
        const d = new Date(row.workout_date);
        return d >= bounds.start! && (!bounds.end || d <= bounds.end);
      })
    : logs;
  const byName = new Map<string, { users: Set<string>; sessions: number }>();
  for (const row of filtered) {
    const name = row.custom_workout_name?.trim() || "Workout";
    if (!byName.has(name)) byName.set(name, { users: new Set(), sessions: 0 });
    const r = byName.get(name)!;
    r.users.add(row.user_id);
    r.sessions += 1;
  }
  const popular: PopularExercisePoint[] = [...byName.entries()]
    .map(([name, r]) => ({ name, activeUsers: r.users.size, completedSessions: r.sessions }))
    .sort((a, b) => b.completedSessions - a.completedSessions)
    .slice(0, 8);
  const byDay: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const row of filtered) {
    const d = new Date(row.workout_date);
    const key = d.getDay();
    byDay[key] = (byDay[key] ?? 0) + 1;
  }
  const weekly: WeeklySessionsPoint[] = DAY_NAMES.map((day, i) => ({ day, sessions: byDay[i] ?? 0 }));
  const totalSessions = popular.reduce((a, p) => a + p.completedSessions, 0);
  const categoryPreferences = totalSessions ? [{ name: "Workouts", value: 100, color: "#8884d8" }] : [];
  return { popular, weekly, categoryPreferences };
}

// --- Chart data: meal popular + by category + weekly + calorie ranges ---
export interface PopularMealPoint {
  name: string;
  activeUsers: number;
  totalLogs: number;
}

export interface MealTimePreferencePoint {
  name: string;
  value: number;
  color?: string;
}

export interface WeeklyMealsPoint {
  day: string;
  meals: number;
}

export interface CalorieRangePoint {
  name: string;
  value: number;
  color?: string;
}

export async function fetchMealCharts(range?: DateRange): Promise<{
  popular: PopularMealPoint[];
  mealTimePreferences: MealTimePreferencePoint[];
  weekly: WeeklyMealsPoint[];
  calorieRanges: CalorieRangePoint[];
}> {
  if (!supabase) return { popular: [], mealTimePreferences: [], weekly: [], calorieRanges: [] };
  const { data: logs } = await supabase
    .from("meal_logs")
    .select("user_id, category, custom_food_name, total_calories, meal_time")
    .order("meal_time", { ascending: false })
    .limit(500);
  if (!logs?.length) return { popular: [], mealTimePreferences: [], weekly: [], calorieRanges: [] };
  const bounds = range ? getDateRangeBounds(range) : null;
  const filtered = bounds?.start
    ? logs.filter((row) => {
        const d = new Date(row.meal_time);
        return d >= bounds.start! && (!bounds.end || d <= bounds.end);
      })
    : logs;
  const byName = new Map<string, { users: Set<string>; total: number }>();
  const byCategory = new Map<string, number>();
  const byDay: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const calorieBuckets = { "<500": 0, "500-750": 0, "750-1000": 0, ">1000": 0 };
  for (const row of filtered) {
    const name = (row.custom_food_name?.trim() || row.category || "Meal").slice(0, 30);
    if (!byName.has(name)) byName.set(name, { users: new Set(), total: 0 });
    byName.get(name)!.users.add(row.user_id);
    byName.get(name)!.total += 1;
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1);
    const d = new Date(row.meal_time);
    byDay[d.getDay()] = (byDay[d.getDay()] ?? 0) + 1;
    const c = row.total_calories ?? 0;
    if (c < 500) calorieBuckets["<500"] += 1;
    else if (c < 750) calorieBuckets["500-750"] += 1;
    else if (c < 1000) calorieBuckets["750-1000"] += 1;
    else calorieBuckets[">1000"] += 1;
  }
  const totalCat = [...byCategory.values()].reduce((a, b) => a + b, 0);
  const categoryColors: Record<string, string> = { breakfast: "#f97316", lunch: "#22c55e", dinner: "#3b82f6", snack: "#8b5cf6" };
  const mealTimePreferences: MealTimePreferencePoint[] = [...byCategory.entries()]
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: totalCat ? Math.round((count / totalCat) * 100) : 0, color: categoryColors[name] ?? "#94a3b8" }));
  const popular: PopularMealPoint[] = [...byName.entries()]
    .map(([name, r]) => ({ name, activeUsers: r.users.size, totalLogs: r.total }))
    .sort((a, b) => b.totalLogs - a.totalLogs)
    .slice(0, 8);
  const totalCal = Object.values(calorieBuckets).reduce((a, b) => a + b, 0);
  const calorieRanges: CalorieRangePoint[] = [
    { name: "Less than 500", value: totalCal ? Math.round((calorieBuckets["<500"] / totalCal) * 100) : 0, color: "#3b82f6" },
    { name: "500-750", value: totalCal ? Math.round((calorieBuckets["500-750"] / totalCal) * 100) : 0, color: "#f97316" },
    { name: "750-1000", value: totalCal ? Math.round((calorieBuckets["750-1000"] / totalCal) * 100) : 0, color: "#ec4899" },
    { name: "Over 1000", value: totalCal ? Math.round((calorieBuckets[">1000"] / totalCal) * 100) : 0, color: "#22c55e" },
  ];
  const weekly: WeeklyMealsPoint[] = DAY_NAMES.map((day, i) => ({ day, meals: byDay[i] ?? 0 }));
  return { popular, mealTimePreferences, weekly, calorieRanges };
}

// --- Chart data: medication common + adherence + weekly + preferred times ---
export interface CommonMedicationPoint {
  name: string;
  activeUsers: number;
  dosesLogged: number;
}

export interface AdherenceTrendPoint {
  month: string;
  rate: number;
}

export interface WeeklyAdherencePoint {
  day: string;
  taken: number;
  missed: number;
}

export interface PreferredTimePoint {
  name: string;
  value: number;
  color?: string;
}

export interface TopAdherentUserPoint {
  name: string;
  adherence: number;
  dosesLogged: number;
}

export async function fetchMedicationCharts(range?: DateRange): Promise<{
  common: CommonMedicationPoint[];
  adherenceTrend: AdherenceTrendPoint[];
  weeklyAdherence: WeeklyAdherencePoint[];
  preferredTimes: PreferredTimePoint[];
  topAdherent: TopAdherentUserPoint[];
}> {
  if (!supabase) return { common: [], adherenceTrend: [], weeklyAdherence: [], preferredTimes: [], topAdherent: [] };
  const { data: tasks } = await supabase.from("scheduled_tasks").select("id, name, user_id, time").eq("task_type", "medication");
  const { data: completionsRaw } = await supabase
    .from("task_completions")
    .select("user_id, completed_at, skipped, scheduled_tasks(name, task_type)");
  const bounds = range ? getDateRangeBounds(range) : null;
  const completions = bounds?.start
    ? (completionsRaw ?? []).filter((c) => {
        const d = new Date(c.completed_at);
        return d >= bounds.start! && (!bounds.end || d <= bounds.end);
      })
    : completionsRaw ?? [];
  const byMedName = new Map<string, { users: Set<string>; doses: number }>();
  for (const t of tasks ?? []) {
    if (!byMedName.has(t.name)) byMedName.set(t.name, { users: new Set(), doses: 0 });
    byMedName.get(t.name)!.users.add(t.user_id);
  }
  for (const c of completions) {
    const st = (c as unknown as { scheduled_tasks?: { name: string; task_type: string } | null }).scheduled_tasks;
    if (st?.task_type === "medication" && st?.name) {
      if (!byMedName.has(st.name)) byMedName.set(st.name, { users: new Set(), doses: 0 });
      byMedName.get(st.name)!.doses += 1;
    }
  }
  const common: CommonMedicationPoint[] = [...byMedName.entries()]
    .map(([name, r]) => ({ name, activeUsers: r.users.size, dosesLogged: r.doses }))
    .sort((a, b) => b.dosesLogged - a.dosesLogged)
    .slice(0, 9);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const byMonth: Record<string, { taken: number; missed: number }> = {};
  for (let m = 5; m >= 0; m--) {
    const d = new Date();
    d.setMonth(d.getMonth() - m);
    byMonth[`${monthNames[d.getMonth()]}`] = { taken: 0, missed: 0 };
  }
  for (const c of completions) {
    const d = new Date(c.completed_at);
    const key = monthNames[d.getMonth()];
    if (byMonth[key]) {
      if (c.skipped) byMonth[key].missed += 1;
      else byMonth[key].taken += 1;
    }
  }
  const adherenceTrend: AdherenceTrendPoint[] = Object.entries(byMonth).map(([month, r]) => {
    const total = r.taken + r.missed;
    return { month, rate: total ? Math.round((r.taken / total) * 100) : 0 };
  });
  const byDayNum: Record<number, { taken: number; missed: number }> = {};
  for (let i = 0; i < 7; i++) byDayNum[i] = { taken: 0, missed: 0 };
  for (const c of completions) {
    const d = new Date(c.completed_at);
    const day = d.getDay();
    if (c.skipped) byDayNum[day].missed += 1;
    else byDayNum[day].taken += 1;
  }
  const weeklyAdherence: WeeklyAdherencePoint[] = DAY_NAMES.map((day, i) => ({
    day,
    taken: byDayNum[i].taken,
    missed: byDayNum[i].missed,
  }));
  const timeBuckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
  for (const t of tasks ?? []) {
    const match = (t.time || "").match(/(\d+)/);
    const hour = match ? parseInt(match[1], 10) : 12;
    const isPM = /pm|PM/.test(t.time || "");
    const h24 = isPM && hour < 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;
    if (h24 >= 6 && h24 < 12) timeBuckets.Morning += 1;
    else if (h24 >= 12 && h24 < 17) timeBuckets.Afternoon += 1;
    else if (h24 >= 17 && h24 < 21) timeBuckets.Evening += 1;
    else timeBuckets.Night += 1;
  }
  const totalT = Object.values(timeBuckets).reduce((a, b) => a + b, 0);
  const preferredTimes: PreferredTimePoint[] = [
    { name: "Morning", value: totalT ? Math.round((timeBuckets.Morning / totalT) * 100) : 0, color: "#f97316" },
    { name: "Afternoon", value: totalT ? Math.round((timeBuckets.Afternoon / totalT) * 100) : 0, color: "#3b82f6" },
    { name: "Evening", value: totalT ? Math.round((timeBuckets.Evening / totalT) * 100) : 0, color: "#8b5cf6" },
    { name: "Night", value: totalT ? Math.round((timeBuckets.Night / totalT) * 100) : 0, color: "#22c55e" },
  ];
  const byUser: Record<string, { taken: number; missed: number }> = {};
  for (const c of completions) {
    const st = (c as unknown as { scheduled_tasks?: { task_type: string } | null }).scheduled_tasks;
    if (st?.task_type !== "medication") continue;
    const uid = c.user_id;
    if (!byUser[uid]) byUser[uid] = { taken: 0, missed: 0 };
    if (c.skipped) byUser[uid].missed += 1;
    else byUser[uid].taken += 1;
  }
  const userIds = Object.keys(byUser);
  const { data: profiles } = userIds.length ? await supabase.from("profiles").select("id, full_name").in("id", userIds) : { data: [] };
  const nameBy = new Map((profiles ?? []).map((p) => [p.id, p.full_name || p.id]));
  const topAdherent: TopAdherentUserPoint[] = Object.entries(byUser)
    .map(([uid, r]) => {
      const total = r.taken + r.missed;
      return { uid, name: nameBy.get(uid) ?? "Unknown", adherence: total ? Math.round((r.taken / total) * 100) : 0, dosesLogged: r.taken };
    })
    .sort((a, b) => b.adherence - a.adherence)
    .slice(0, 5)
    .map(({ name, adherence, dosesLogged }) => ({ name: name.length > 12 ? name.slice(0, 10) + "…" : name, adherence, dosesLogged }));
  return { common, adherenceTrend, weeklyAdherence, preferredTimes, topAdherent };
}

// --- Chart data: history (task completions by day + by type + top actions) ---
export interface ActivityByDayPoint {
  day: string;
  completed: number;
  skipped: number;
}

export interface LogsByTypePoint {
  name: string;
  value: number;
  color: string;
}

export interface TopActionPoint {
  action: string;
  count: number;
}

export async function fetchHistoryCharts(range?: DateRange): Promise<{
  byDay: ActivityByDayPoint[];
  byType: LogsByTypePoint[];
  topActions: TopActionPoint[];
}> {
  if (!supabase) return { byDay: [], byType: [], topActions: [] };
  const { data: raw } = await supabase
    .from("task_completions")
    .select("completed_at, skipped, scheduled_tasks(name)")
    .order("completed_at", { ascending: false })
    .limit(300);
  if (!raw?.length) return { byDay: [], byType: [], topActions: [] };
  const bounds = range ? getDateRangeBounds(range) : null;
  const completions = bounds?.start
    ? raw.filter((c) => {
        const d = new Date(c.completed_at);
        return d >= bounds.start! && (!bounds.end || d <= bounds.end);
      })
    : raw;
  const byDayNum: Record<number, { completed: number; skipped: number }> = {};
  for (let i = 0; i < 7; i++) byDayNum[i] = { completed: 0, skipped: 0 };
  for (const c of completions) {
    const d = new Date(c.completed_at);
    const day = d.getDay();
    if (c.skipped) byDayNum[day].skipped += 1;
    else byDayNum[day].completed += 1;
  }
  const byDay: ActivityByDayPoint[] = DAY_NAMES.map((day, i) => ({
    day,
    completed: byDayNum[i].completed,
    skipped: byDayNum[i].skipped,
  }));
  const completedCount = completions.filter((c) => !c.skipped).length;
  const skippedCount = completions.filter((c) => c.skipped).length;
  const byType: LogsByTypePoint[] = [
    { name: "Completed", value: completedCount, color: "#22c55e" },
    { name: "Skipped", value: skippedCount, color: "#f59e0b" },
  ];
  const byTaskName = new Map<string, number>();
  for (const c of completions) {
    const st = (c as unknown as { scheduled_tasks?: { name: string } | null }).scheduled_tasks;
    const name = st?.name ?? "Task";
    byTaskName.set(name, (byTaskName.get(name) ?? 0) + 1);
  }
  const topActions: TopActionPoint[] = [...byTaskName.entries()]
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  return { byDay, byType, topActions };
}
