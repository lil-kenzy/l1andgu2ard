import { CalendarDays, FilePlus2, Gavel, Scale, ShieldQuestion } from "lucide-react";
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

export default function AdminDisputesPage() {
  return (
    <PortalShell
      portal="Admin Portal"
      title="Dispute Resolution Module"
      subtitle="Case registry with evidence management, hearing schedules, and decision logging."
      navItems={navItems}
      stats={[
        { label: "Open Cases", value: "83", icon: Scale },
        { label: "Hearings", value: "19", icon: CalendarDays },
        { label: "Evidence Files", value: "514", icon: FilePlus2 },
        { label: "Escalated", value: "12", icon: ShieldQuestion },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Case Registry" subtitle="Status and hearing schedule">
            <ItemList items={["DSP-231: Ownership overlap, hearing next Tuesday", "DSP-227: Boundary conflict awaiting surveyor report", "DSP-205: Fraud-linked parcel transfer under review"]} />
          </Panel>
        </div>
        <Panel title="Decision Workflow" subtitle="Legal and administrative outcomes">
          <ItemList items={["Upload and sign hearing outcomes", "Record binding administrative decisions", "Notify all stakeholders with audit trail"]} />
          <div className="mt-4 text-sm rounded-lg border border-slate-300 dark:border-slate-600 p-3 flex items-start gap-2"><Gavel className="w-4 h-4 mt-0.5" /> Decision records are immutable once finalized.</div>
        </Panel>
      </div>
    </PortalShell>
  );
}
