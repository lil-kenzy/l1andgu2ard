import { AlertOctagon, Database, Download, Search, ShieldCheck } from "lucide-react";
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

export default function AdminAuditPage() {
  return (
    <PortalShell
      portal="Admin Portal"
      title="Audit Logs"
      subtitle="Immutable, searchable operational logs with anomaly detection and compliance-grade exports."
      navItems={navItems}
      stats={[
        { label: "Log Events", value: "7.8M", icon: Database },
        { label: "Anomalies", value: "29", icon: AlertOctagon },
        { label: "Search Queries", value: "1,104", icon: Search },
        { label: "Exports", value: "47", icon: Download },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Log Explorer" subtitle="Full-text and structured search across immutable records">
            <ItemList items={["Filter by actor, event type, and timestamp", "Reconstruct historical workflow decisions", "Cross-link log entries with case IDs"]} />
          </Panel>
        </div>
        <Panel title="Compliance" subtitle="Export and attestation">
          <ItemList items={["Regulatory export bundles", "Tamper-proof integrity checks", "Signed audit evidence package"]} />
          <div className="mt-4 text-sm rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-emerald-700 dark:text-emerald-300 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> WORM-compatible archival readiness enabled.</div>
        </Panel>
      </div>
    </PortalShell>
  );
}
