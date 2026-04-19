"use client";

import { useEffect, useState } from "react";
import { Activity, AlertOctagon, Database, Download, Search, ShieldCheck, Users } from "lucide-react";
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

interface AuditLog {
  _id: string;
  action: string;
  userId: string;
  createdAt: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  // User activity monitoring
  const [userIdFilter, setUserIdFilter] = useState("");
  const [userIdInput, setUserIdInput] = useState("");
  const [userLogs, setUserLogs] = useState<AuditLog[]>([]);
  const [userLogsLoading, setUserLogsLoading] = useState(false);

  const fetchLogs = (action?: string) => {
    setLoading(true);
    adminAPI
      .getAuditLogs(action ? { action } : undefined)
      .then((res) => setLogs(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const fetchUserActivity = (uid: string) => {
    setUserLogsLoading(true);
    adminAPI
      .getAuditLogs({ userId: uid, limit: 50 })
      .then((res) => setUserLogs(res.data.data || []))
      .catch(() => {})
      .finally(() => setUserLogsLoading(false));
  };

  useEffect(() => {
    adminAPI
      .getAuditLogs()
      .then((res) => setLogs(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(actionFilter || undefined);
  };

  const handleUserActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdInput.trim()) return;
    setUserIdFilter(userIdInput.trim());
    fetchUserActivity(userIdInput.trim());
  };

  const handleExport = () => {
    const csv = [
      "Action,User ID,Timestamp",
      ...logs.map(
        (l) =>
          `"${l.action}","${l.userId}","${new Date(l.createdAt).toISOString()}"`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Derive top-10 active users by action count
  const userActivity = Object.entries(
    logs.reduce<Record<string, number>>((acc, l) => {
      acc[l.userId] = (acc[l.userId] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <PortalShell
      portal="Admin Portal"
      title="Audit Logs"
      subtitle="Immutable, searchable operational logs with anomaly detection and compliance-grade exports."
      navItems={navItems}
      stats={[
        { label: "Log Events", value: loading ? "…" : String(logs.length), icon: Database },
        { label: "Anomalies", value: "—", icon: AlertOctagon },
        { label: "Search Queries", value: "—", icon: Search },
        { label: "Exports", value: "—", icon: Download },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Log Explorer" subtitle="Full-text and structured search across immutable records">
            <form onSubmit={handleFilter} className="flex gap-2 mb-4">
              <input
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                placeholder="Filter by action (e.g. transaction_completed)…"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 transition"
              >
                Filter
              </button>
            </form>

            {loading ? (
              <p className="text-sm text-slate-500 py-4">Loading logs…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 pr-4">Action</th>
                      <th className="py-2 pr-4">User ID</th>
                      <th className="py-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log._id}
                        className="border-b border-slate-100 dark:border-slate-700/60"
                      >
                        <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">
                          {log.action}
                        </td>
                        <td
                          className="py-2.5 pr-4 text-slate-500 dark:text-slate-400 font-mono text-xs cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          title="Click to view this user's activity"
                          onClick={() => { setUserIdInput(log.userId); setUserIdFilter(log.userId); fetchUserActivity(log.userId); }}
                        >
                          {log.userId}
                        </td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-6 text-center text-slate-400 text-sm"
                        >
                          No log entries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Compliance" subtitle="Export and attestation">
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {[
                "Regulatory export bundles",
                "Tamper-proof integrity checks",
                "Signed audit evidence package",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={handleExport}
              disabled={loading || logs.length === 0}
              className="mt-4 w-full rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <div className="mt-3 text-sm rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> WORM-compatible archival readiness enabled.
            </div>
          </Panel>

          {/* Top Active Users */}
          <Panel title="Top Active Users" subtitle="By event count (this query)">
            {loading ? (
              <p className="text-xs text-slate-500">Loading…</p>
            ) : userActivity.length === 0 ? (
              <p className="text-xs text-slate-400">No data.</p>
            ) : (
              <ul className="space-y-1.5">
                {userActivity.map(([uid, count]) => (
                  <li
                    key={uid}
                    className="flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded px-1 py-0.5"
                    onClick={() => { setUserIdInput(uid); setUserIdFilter(uid); fetchUserActivity(uid); }}
                    title="Click to drill into this user's activity"
                  >
                    <span className="font-mono text-slate-500 dark:text-slate-400 truncate">{uid}</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold shrink-0">
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {/* User Activity Monitor */}
      <div className="mt-4">
        <Panel
          title="User Activity Monitor"
          subtitle="Drill-down into individual user action history for compliance monitoring"
        >
          <form onSubmit={handleUserActivity} className="flex gap-2 mb-4">
            <div className="flex items-center gap-2 flex-1">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder="Enter user ID (MongoDB ObjectId) to view their activity timeline…"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white font-mono"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 transition flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" /> View Activity
            </button>
            {userIdFilter && (
              <button
                type="button"
                onClick={() => { setUserIdInput(""); setUserIdFilter(""); setUserLogs([]); }}
                className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Clear
              </button>
            )}
          </form>

          {userIdFilter && (
            userLogsLoading ? (
              <p className="text-sm text-slate-500 py-3">Loading user activity…</p>
            ) : userLogs.length === 0 ? (
              <p className="text-sm text-slate-400 py-3">No activity found for user <span className="font-mono">{userIdFilter}</span>.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 pr-4">Action</th>
                      <th className="py-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userLogs.map((log) => (
                      <tr key={log._id} className="border-b border-slate-100 dark:border-slate-700/60">
                        <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">{log.action}</td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-slate-400 mt-2">Showing up to 50 most recent events for user <span className="font-mono">{userIdFilter}</span>.</p>
              </div>
            )
          )}

          {!userIdFilter && (
            <p className="text-sm text-slate-400 py-2">
              Enter a user ID above — or click any User ID row in the Log Explorer — to monitor their activity timeline.
            </p>
          )}
        </Panel>
      </div>
    </PortalShell>
  );
}
