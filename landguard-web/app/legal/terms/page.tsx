import { FileText, Gavel } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/legal/dashboard" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Compliance", href: "/legal/compliance" },
];

export default function LegalTermsPage() {
  return (
    <PortalShell
      portal="Legal & Compliance"
      title="Terms of Service"
      subtitle="Platform usage terms, account responsibilities, dispute handling, and service limitations."
      navItems={navItems}
      stats={[
        { label: "Current Version", value: "v3.1", icon: FileText },
        { label: "Enforcement", value: "Active", icon: Gavel },
        { label: "Arbitration Clause", value: "Included", icon: Gavel },
        { label: "Notice Window", value: "30 days", icon: FileText },
      ]}
    >
      <div className="grid gap-4">
        <Panel title="User Obligations" subtitle="Account and conduct requirements">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">Users must provide accurate identity details, avoid fraudulent listing behavior, and comply with all transaction and evidence submission requirements. Misuse may trigger suspension and legal escalation.</p>
        </Panel>
        <Panel title="Transactions & Liability" subtitle="Platform role and limitations">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">LANDGUARD facilitates verification and workflow tooling but does not replace legal representation. Parties remain responsible for independent due diligence, lawful documentation, and contractual obligations.</p>
        </Panel>
      </div>
    </PortalShell>
  );
}
