"use client";

import { useEffect, useRef } from "react";
import {
  UserPlus,
  AlertCircle,
  Pill,
  UtensilsCrossed,
  Mail,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import type { AdminFeedItem } from "@/lib/adminData";

function formatTimeAgo(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function iconForKind(kind: AdminFeedItem["kind"]): { Icon: LucideIcon; iconBg: string; iconColor: string } {
  switch (kind) {
    case "contact":
      return { Icon: Mail, iconBg: "bg-sky-100", iconColor: "text-sky-600" };
    case "newsletter":
      return { Icon: Newspaper, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" };
    case "new_profile":
      return { Icon: UserPlus, iconBg: "bg-blue-100", iconColor: "text-blue-600" };
    case "website_user":
      return { Icon: UserPlus, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" };
    case "glucose_high":
      return { Icon: AlertCircle, iconBg: "bg-red-100", iconColor: "text-red-600" };
    case "task_skipped":
      return { Icon: Pill, iconBg: "bg-violet-100", iconColor: "text-violet-600" };
    default:
      return { Icon: UtensilsCrossed, iconBg: "bg-slate-100", iconColor: "text-slate-600" };
  }
}

interface AdminNotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  items: AdminFeedItem[];
  loading: boolean;
}

export function AdminNotificationsPanel({ isOpen, onClose, anchorRef, items, loading }: AdminNotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const fortyEightH = 48 * 60 * 60 * 1000;

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
        <p className="text-xs text-slate-500">Live feed from your Supabase project (contacts, signups, alerts)</p>
      </div>
      {loading ? (
        <div className="px-4 py-8 text-center text-sm text-slate-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-500">No recent activity.</div>
      ) : (
        <ul className="max-h-[400px] overflow-y-auto">
          {items.map((item) => {
            const { Icon, iconBg, iconColor } = iconForKind(item.kind);
            const isNew = Date.now() - new Date(item.created_at).getTime() < fortyEightH;
            return (
              <li
                key={item.id}
                className={`flex gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 ${isNew ? "bg-blue-50/30" : ""} hover:bg-slate-50/80`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600 break-words">{item.description}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatTimeAgo(item.created_at)}</p>
                </div>
                {isNew && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
