import { AlertTriangle, Brain, FileSearch, Siren, Workflow } from "lucide-react";
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

export default function AdminFraudPage() {
  return (
    <PortalShell
      portal="Admin Portal"
      title="Fraud Detection Center"
      subtitle="AI-driven alerts dashboard for investigation, case management, and escalation workflows."
      navItems={navItems}
      stats={[
        { label: "AI Alerts", value: "37", icon: Brain },
        { label: "Critical Cases", value: "8", icon: Siren },
        { label: "Open Investigations", value: "52", icon: FileSearch },
        { label: "Escalations", value: "11", icon: AlertTriangle },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Case Board" subtitle="Alert triage and case assignment">
            <ItemList items={["Duplicate ownership claim cluster in Accra", "Tampered survey coordinates detected", "Suspicious rapid transfer pattern flagged"]} />
          </Panel>
        </div>
        <Panel title="Escalation Workflow" subtitle="From detection to enforcement">
          <ItemList items={["Automated severity scoring", "Officer assignment and deadlines", "Evidence package export for legal action"]} />
          <div className="mt-4 text-sm rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Workflow className="w-4 h-4 mt-0.5" /> AI confidence updates as evidence is added.
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
