"use client";

import { useEffect, useState } from "react";
import { Megaphone, ShieldBan, UserCog, Users } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";
import { adminAPI } from "@/lib/api/client";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Verifications", href: "/admin/verifications" },
  { label: "Registry", href: "/admin/registry" },
  { label: "Users", href: "/admin/users" },
  { label: "Fraud", href: "/admin/fraud" },
  { label: "Disputes", href: "/admin/disputes" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Audit", href: "/admin/audit" },
  { label: "Officers", href: "/admin/officers" },
  { label: "Gateway", href: "/admin/gateway" },
];

interface User {
  _id: string;
  personalInfo: { fullName: string; email?: string; phoneNumber?: string };
  role: string;
  createdAt: string;
  isSuspended: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchUsers = (q?: string) => {
    setLoading(true);
    adminAPI
      .getUsers(q ? { search: q } : undefined)
      .then((res) => setUsers(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search || undefined);
  };

  const toggleSuspend = async (user: User) => {
    setActionId(user._id);
    try {
      if (user.isSuspended) {
        await adminAPI.unsuspendUser(user._id);
      } else {
        await adminAPI.suspendUser(user._id, { reason: "Suspended via admin portal" });
      }
      fetchUsers(search || undefined);
    } catch {
      // continue
    } finally {
      setActionId(null);
    }
  };

  const suspended = users.filter((u) => u.isSuspended).length;

  return (
    <PortalShell
      portal="Admin Portal"
      title="User Management"
      subtitle="Manage users at scale with profile detail view, suspension controls, impersonation, and bulk communication."
      navItems={navItems}
      stats={[
        { label: "Total Users", value: loading ? "…" : String(users.length), icon: Users },
        { label: "Suspended", value: loading ? "…" : String(suspended), icon: ShieldBan },
        { label: "Admin Actions", value: "—", icon: UserCog },
        { label: "Bulk Campaigns", value: "—", icon: Megaphone },
      ]}
    >
      <Panel title="User Directory" subtitle="Search and administrative actions">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone…"
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        {loading ? (
          <p className="text-sm text-slate-500 py-4">Loading users…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Contact</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-slate-100 dark:border-slate-700/60"
                  >
                    <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">
                      {user.personalInfo.fullName}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">
                      {user.personalInfo.email || user.personalInfo.phoneNumber || "—"}
                    </td>
                    <td className="py-2.5 pr-4 capitalize text-slate-700 dark:text-slate-300">
                      {user.role}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.isSuspended
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        }`}
                      >
                        {user.isSuspended ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <button
                        onClick={() => toggleSuspend(user)}
                        disabled={actionId === user._id}
                        className={`text-xs px-3 py-1 rounded-lg border transition disabled:opacity-50 ${
                          user.isSuspended
                            ? "border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            : "border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        }`}
                      >
                        {actionId === user._id
                          ? "…"
                          : user.isSuspended
                            ? "Unsuspend"
                            : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 text-sm">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </PortalShell>
  );
}

