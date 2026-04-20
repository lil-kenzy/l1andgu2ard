"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckSquare, Gauge, ListChecks, Map, ShieldCheck, Users } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";
import { adminAPI } from "@/lib/api/client";
import { connectSocketFromStorage, disconnectSocket, onNewSubmission, onAdminStatsUpdate } from "@/lib/socket";

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

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  pendingVerifications: number;
  activeListings: number;
  disputes: number;
  fraudAlerts: number;
}

interface AuditLog {
  _id: string;
  action: string;
  createdAt: string;
}

interface DuplicateAlert {
  _id: string;
  count: number;
  ids: string[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getDashboard()
      .then((res) => {
        setStats(res.data.data.stats);
        setActivity(res.data.data.recentActivity || []);
        setDuplicates(res.data.data.duplicateAlerts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Real-time Socket.IO updates
  useEffect(() => {
    const socket = connectSocketFromStorage();
    if (!socket) return;

    const unsubSubmission = onNewSubmission(() => {
      // Refresh dashboard stats when a new property is submitted
      adminAPI
        .getDashboard()
        .then((res) => {
          setStats(res.data.data.stats);
          setActivity(res.data.data.recentActivity || []);
          setDuplicates(res.data.data.duplicateAlerts || []);
        })
        .catch(() => {});
    });

    const unsubStats = onAdminStatsUpdate((payload) => {
      if (payload && typeof payload === 'object') {
        setStats((prev) => prev ? { ...prev, ...(payload as Partial<DashboardStats>) } : prev);
      }
    });

    return () => {
      unsubSubmission();
      unsubStats();
      disconnectSocket();
    };
  }, []);

  const statCards = [
    { label: "Total Users", value: loading ? "…" : stats ? String(stats.totalUsers) : "—", icon: Users },
    { label: "Pending Verifications", value: loading ? "…" : stats ? String(stats.pendingVerifications) : "—", icon: ListChecks },
    { label: "Active Listings", value: loading ? "…" : stats ? String(stats.activeListings) : "—", icon: CheckSquare },
    { label: "Fraud Alerts", value: loading ? "…" : stats ? String(stats.fraudAlerts) : "—", icon: AlertTriangle },
    { label: "Open Disputes", value: loading ? "…" : stats ? String(stats.disputes) : "—", icon: ShieldCheck },
    { label: "System Uptime", value: "99.97%", icon: Gauge },
  ];

  const activityItems =
    activity.length > 0
      ? activity
          .slice(0, 6)
          .map((log) => `${log.action} — ${new Date(log.createdAt).toLocaleString()}`)
      : loading
        ? ["Loading activity…"]
        : ["No recent activity"];

  return (
    <PortalShell
      portal="Admin Portal"
      title="Admin Dashboard"
      subtitle="National oversight dashboard with fraud heat map summary, system health, and real-time operational feed."
      navItems={navItems}
      stats={statCards}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Fraud Heat Map" subtitle="Regional concentration summary">
          <div className="h-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center gap-2 text-slate-500">
            <Map className="w-5 h-5" /> Heat map preview
          </div>
        </Panel>

        <Panel title="System Health" subtitle="Core infrastructure and pipeline status">
          <ItemList
            items={[
              "API gateway healthy",
              "OCR pipeline stable",
              "Notification queue latency normal",
            ]}
          />
        </Panel>

        <Panel title="Activity Stream" subtitle="Latest administrative events">
          <ItemList items={activityItems} />
        </Panel>

        {/* Duplicate / Suspicious Alerts */}
        <div className="lg:col-span-3">
          <Panel
            title="Duplicate Listing Alerts"
            subtitle={`${duplicates.length} parcel number(s) with multiple listings detected`}
          >
            {loading ? (
              <p className="text-sm text-slate-500 py-2">Checking for duplicates…</p>
            ) : duplicates.length === 0 ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 py-2">✓ No duplicate parcel numbers detected.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 pr-4">Parcel Number</th>
                      <th className="py-2 pr-4">Duplicate Count</th>
                      <th className="py-2">Property IDs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicates.map((d) => (
                      <tr key={d._id} className="border-b border-slate-100 dark:border-slate-700/60">
                        <td className="py-2.5 pr-4 font-mono text-xs text-red-700 dark:text-red-400">{d._id}</td>
                        <td className="py-2.5 pr-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            {d.count} listings
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {d.ids.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </PortalShell>
  );
}

