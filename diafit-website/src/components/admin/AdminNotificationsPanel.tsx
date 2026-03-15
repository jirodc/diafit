"use client";

import { useEffect, useRef } from "react";
import {
  UserPlus,
  AlertCircle,
  Pill,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface AdminNotificationItem {
  id: string;
  type: "new_user" | "glucose" | "adherence" | "exercise" | "meal" | "platform";
  title: string;
  description: string;
  timeAgo: string;
  unread: boolean;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

const MOCK_NOTIFICATIONS: AdminNotificationItem[] = [
  {
    id: "1",
    type: "new_user",
    title: "New User Registration",
    description: "Sarah Johnson just signed up for the platform",
    timeAgo: "5 minutes ago",
    unread: true,
    icon: UserPlus,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "2",
    type: "glucose",
    title: "High Glucose Alert",
    description: "User Michael Chen reported glucose level of 245 mg/dL",
    timeAgo: "12 minutes ago",
    unread: true,
    icon: AlertCircle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    id: "3",
    type: "adherence",
    title: "Low Adherence Warning",
    description: "15 users have missed their medication for 2+ days",
    timeAgo: "1 hour ago",
    unread: true,
    icon: Pill,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    id: "4",
    type: "exercise",
    title: "Exercise Milestone",
    description: "Emily Davis completed 100 workout sessions!",
    timeAgo: "2 hours ago",
    unread: false,
    icon: Dumbbell,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "5",
    type: "meal",
    title: "Meal Plan Feedback",
    description: "23 users rated the new meal plan 5 stars",
    timeAgo: "3 hours ago",
    unread: false,
    icon: UtensilsCrossed,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    id: "6",
    type: "platform",
    title: "Platform Milestone",
    description: "Reached 3,000 active users this month!",
    timeAgo: "5 hours ago",
    unread: false,
    icon: TrendingUp,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

interface AdminNotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export function AdminNotificationsPanel({ isOpen, onClose, anchorRef }: AdminNotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-50 mt-2 w-full min-w-[360px] max-w-[400px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
        <p className="text-xs text-slate-500">Recent activity and alerts</p>
      </div>
      <ul className="max-h-[400px] overflow-y-auto">
        {MOCK_NOTIFICATIONS.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              className={`flex gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 ${item.unread ? "bg-blue-50/30" : ""} hover:bg-slate-50/80`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.iconBg} ${item.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>
                <p className="mt-1 text-xs text-slate-500">{item.timeAgo}</p>
              </div>
              {item.unread && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export { MOCK_NOTIFICATIONS };
