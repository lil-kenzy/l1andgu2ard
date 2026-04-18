import { CalendarClock, ChartSpline, Download, FileSpreadsheet, Layers3 } from "lucide-react";
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

export default function AdminReportsPage() {
  return (
    <PortalShell
      portal="Admin Portal"
      title="Reporting & Analytics"
      subtitle="Generate pre-built and custom reports, schedule exports, and maintain public transparency dashboards."
      navItems={navItems}
      stats={[
        { label: "Scheduled Reports", value: "41", icon: CalendarClock },
        { label: "Custom Templates", value: "18", icon: Layers3 },
        { label: "Exports Today", value: "62", icon: Download },
        { label: "Dashboards", value: "9", icon: ChartSpline },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Builder" subtitle="Pre-built and custom report assembly">
          <ItemList items={["Verification SLA and throughput", "Fraud trend and hotspot analysis", "Registry changes and conflict incidence"]} />
        </Panel>
        <Panel title="Scheduling" subtitle="Automated distribution">
          <ItemList items={["Email and secure share delivery", "Weekly/monthly scheduling", "Role-based report visibility"]} />
        </Panel>
        <Panel title="Transparency" subtitle="Public reporting modules">
          <ItemList items={["Public dashboard publishing", "Curation and approval workflow", "CSV and spreadsheet compatibility"]} />
          <button className="mt-4 w-full rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm flex items-center justify-center gap-2"><FileSpreadsheet className="w-4 h-4" />Build report export</button>
        </Panel>
      </div>
    </PortalShell>
  );
}
