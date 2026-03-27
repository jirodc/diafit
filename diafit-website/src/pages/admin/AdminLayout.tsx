import { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { AdminModalProvider } from "@/contexts/AdminModalContext";
import { AdminNotificationsPanel } from "@/components/admin/AdminNotificationsPanel";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { SUPERADMIN_EMAIL } from "@/contexts/AdminAuthContext";
import { updateAdminLastSeen, fetchAdminFeedNotifications, type AdminFeedItem } from "@/lib/adminData";
import { supabase } from "@/lib/supabase";
import { AdminLoginView } from "@/pages/admin/AdminLoginView";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  Dumbbell,
  UtensilsCrossed,
  Pill,
  History,
  Bell,
  Calendar,
  LogOut,
  UserCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", end: false, label: "User Management", icon: Users },
  { to: "/admin/create-account", end: true, label: "Register admin", icon: UserPlus, superadminOnly: true },
  { to: "/admin/analytics", end: false, label: "Analytics", icon: BarChart3 },
  { to: "/admin/exercises", end: false, label: "Exercise", icon: Dumbbell },
  { to: "/admin/meal-plans", end: false, label: "Meal Plans", icon: UtensilsCrossed },
  { to: "/admin/medications", end: false, label: "Medications", icon: Pill },
  { to: "/admin/history-logs", end: false, label: "History Logs", icon: History },
] as const;

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000; // 2 min

export function AdminLayout() {
  const { isAuthenticated, isLoading, userId, userEmail, logout } = useAdminAuth();
  const isSuperadmin = (userEmail ?? "").toLowerCase() === SUPERADMIN_EMAIL;

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    updateAdminLastSeen(userId);
    const interval = setInterval(() => updateAdminLastSeen(userId), HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, userId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <AdminLoginView />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm overflow-y-auto">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <Logo variant="light" className="scale-90" />
          <span className="text-sm font-medium text-slate-600">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV_ITEMS.filter((item) => !("superadminOnly" in item && item.superadminOnly) || isSuperadmin).map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--diafit-blue-muted)] text-[var(--diafit-blue)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
              {isSuperadmin ? "SA" : "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{isSuperadmin ? "Superadmin" : "Admin"}</p>
              <p className="truncate text-xs text-slate-500">{userEmail ?? ""}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <AdminModalProvider>
          <Outlet />
        </AdminModalProvider>
      </main>
    </div>
  );
}

export function AdminHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [feedItems, setFeedItems] = useState<AdminFeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    const items = await fetchAdminFeedNotifications(40);
    setFeedItems(items);
    setFeedLoading(false);
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (notificationsOpen) void loadFeed();
  }, [notificationsOpen, loadFeed]);

  useEffect(() => {
    const t = setInterval(() => void loadFeed(), 120_000);
    return () => clearInterval(t);
  }, [loadFeed]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const ch = client
      .channel("admin-notification-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_submissions" },
        () => void loadFeed()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "newsletter_subscribers" },
        () => void loadFeed()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        () => void loadFeed()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "website_user_profiles" },
        () => void loadFeed()
      )
      .subscribe();
    return () => {
      void client.removeChannel(ch);
    };
  }, [loadFeed]);

  const recentUnread =
    feedItems.filter((i) => Date.now() - new Date(i.created_at).getTime() < 48 * 60 * 60 * 1000).length;

  return (
    <header className="flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label="Admin user"
        >
          <UserCircle className="h-5 w-5 text-slate-500" />
          Admin User
        </button>
        <button
          ref={bellRef}
          type="button"
          onClick={() => setNotificationsOpen((o) => !o)}
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
          aria-expanded={notificationsOpen}
        >
          <Bell className="h-5 w-5" />
          {recentUnread > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
              aria-hidden
            >
              {recentUnread > 9 ? "9+" : recentUnread}
            </span>
          )}
        </button>
        <AdminNotificationsPanel
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          anchorRef={bellRef}
          items={feedItems}
          loading={feedLoading}
        />
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Calendar"
        >
          <Calendar className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
