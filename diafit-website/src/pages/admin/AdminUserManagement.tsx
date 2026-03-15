"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminHeader } from "./AdminLayout";
import { useAdminConfirm } from "@/contexts/AdminModalContext";
import { Search, Download, Eye, Pencil, X } from "lucide-react";

export type UserRole = "Patient" | "Doctor" | "Admin";
export type UserStatus = "active" | "pending" | "inactive";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  glucoseReadings: number;
}

const MOCK_USERS: AdminUser[] = [
  { id: "1", name: "Bryan Cancel", email: "john@example.com", initials: "BC", role: "Patient", status: "active", lastActive: "2 hours ago", glucoseReadings: 234 },
  { id: "2", name: "Sue Jan", email: "sue@example.com", initials: "SJ", role: "Patient", status: "active", lastActive: "1 day ago", glucoseReadings: 189 },
  { id: "3", name: "Michael Chen", email: "michael@example.com", initials: "MC", role: "Patient", status: "pending", lastActive: "3 days ago", glucoseReadings: 56 },
  { id: "4", name: "Emily Davis", email: "emily@example.com", initials: "ED", role: "Patient", status: "active", lastActive: "5 hours ago", glucoseReadings: 412 },
  { id: "5", name: "Robert Wilson", email: "robert@example.com", initials: "RW", role: "Patient", status: "active", lastActive: "1 hour ago", glucoseReadings: 98 },
];

function UserDetailsModal({
  user,
  onClose,
}: {
  user: AdminUser | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (user) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [user, onClose]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="user-details-title">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="user-details-title" className="text-lg font-semibold text-slate-900">User Details</h2>
            <p className="mt-0.5 text-sm text-slate-500">View user information and activity</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <dl className="mt-6 space-y-4">
          <div>
            <dt className="text-sm font-medium text-slate-500">Name</dt>
            <dd className="mt-0.5 text-slate-900">{user.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Email</dt>
            <dd className="mt-0.5 text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Role</dt>
            <dd className="mt-0.5 text-slate-900">{user.role}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Status</dt>
            <dd className="mt-0.5 capitalize text-slate-900">{user.status}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Glucose Readings</dt>
            <dd className="mt-0.5 text-slate-900">{user.glucoseReadings} readings</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function EditUserModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onSave: (updated: AdminUser) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Patient");
  const [status, setStatus] = useState<UserStatus>("active");
  const confirm = useAdminConfirm();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setStatus(user.status);
    }
  }, [user]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (user) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [user, onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      confirm({
        title: "Confirm changes",
        message: "Are you sure you want to save these changes?",
        confirmLabel: "Save Changes",
        onConfirm: () => {
          onSave({
            ...user,
            name,
            email,
            role,
            status,
          });
          onClose();
        },
      });
    },
    [user, name, email, role, status, confirm, onSave, onClose]
  );

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="edit-user-title" className="text-lg font-semibold text-slate-900">Edit User</h2>
            <p className="mt-0.5 text-sm text-slate-500">Update user information</p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700">Name</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-slate-700">Email</label>
            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
            />
          </div>
          <div>
            <label htmlFor="edit-role" className="block text-sm font-medium text-slate-700">Role</label>
            <select
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
            >
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-slate-700">Status</label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-[var(--diafit-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--diafit-blue-light)]">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const confirm = useAdminConfirm();

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSaveUser = useCallback((updated: AdminUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }, []);


  return (
    <>
      <AdminHeader title="User Management" subtitle="Manage and monitor all platform users." />
      <div className="p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[var(--diafit-blue)] focus:ring-1 focus:ring-[var(--diafit-blue)]"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[var(--diafit-blue)]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              type="button"
              onClick={() => {
                confirm({
                  title: "Export users",
                  message: "Export the current user list?",
                  confirmLabel: "Export",
                  onConfirm: () => {
                    // Placeholder: trigger download or API
                    console.log("Export confirmed", filteredUsers.length);
                  },
                });
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-3 font-medium text-slate-700">User</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Role</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Status</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Last Active</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Glucose Readings</th>
                  <th className="px-5 py-3 font-medium text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                          {user.initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{user.role}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.status === "active"
                            ? "bg-slate-100 text-slate-700"
                            : user.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{user.lastActive}</td>
                    <td className="px-5 py-3 text-slate-700">{user.glucoseReadings}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailsUser(user)}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`View ${user.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditUser(user)}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Edit ${user.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <UserDetailsModal user={detailsUser} onClose={() => setDetailsUser(null)} />
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={handleSaveUser} />
    </>
  );
}
