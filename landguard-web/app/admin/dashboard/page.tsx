"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Gauge, Map, ShieldCheck, Users } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";
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

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  disputes: number;
  fraudAlerts: number;
}

interface AuditLog {
  _id: string;
  action: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getDashboard()
      .then((res) => {
        setStats(res.data.data.stats);
        setActivity(res.data.data.recentActivity || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Users", value: loading ? "…" : stats ? String(stats.totalUsers) : "—", icon: Users },
    { label: "Fraud Alerts", value: loading ? "…" : stats ? String(stats.fraudAlerts) : "—", icon: AlertTriangle },
    { label: "System Uptime", value: "99.97%", icon: Gauge },
    { label: "Open Disputes", value: loading ? "…" : stats ? String(stats.disputes) : "—", icon: ShieldCheck },
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
      </div>
    </PortalShell>
  );
}

