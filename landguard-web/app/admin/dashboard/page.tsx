import { AlertTriangle, Gauge, Map, ShieldCheck, Users } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

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
];

export default function AdminDashboardPage() {
  return (
    <PortalShell
      portal="Admin Portal"
      title="Admin Dashboard"
      subtitle="National oversight dashboard with fraud heat map summary, system health, and real-time operational feed."
      navItems={navItems}
      stats={[
        { label: "Daily Verifications", value: "1,982", icon: ShieldCheck },
        { label: "Fraud Alerts", value: "37", icon: AlertTriangle },
        { label: "System Uptime", value: "99.97%", icon: Gauge },
        { label: "Active Officers", value: "264", icon: Users },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Fraud Heat Map" subtitle="Regional concentration summary">
          <div className="h-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center gap-2 text-slate-500">
            <Map className="w-5 h-5" /> Heat map preview
          </div>
        </Panel>

        <Panel title="System Health" subtitle="Core infrastructure and pipeline status">
          <ItemList items={["API gateway healthy", "OCR pipeline stable", "Notification queue latency normal"]} />
        </Panel>

        <Panel title="Activity Stream" subtitle="Latest administrative events">
          <ItemList items={["Bulk verification assignment completed", "Fraud case #FD-992 escalated", "Audit export generated for Q2 review"]} />
        </Panel>
      </div>
    </PortalShell>
  );
}
