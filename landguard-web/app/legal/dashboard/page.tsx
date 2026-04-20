"use client";
import { ClipboardCheck, FileSignature, Gavel, ShieldCheck, UploadCloud } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/legal/dashboard" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Compliance", href: "/legal/compliance" },
];

export default function LegalDashboardPage() {
  return (
    <PortalShell
      portal="Legal & Compliance"
      title="Legal Team Dashboard"
      subtitle="Review assigned disputes, authenticity requests, court directives, and compliance checklists."
      navItems={navItems}
      stats={[
        { label: "Assigned Cases", value: "24", icon: Gavel },
        { label: "Authenticity Requests", value: "17", icon: FileSignature },
        { label: "Court Orders", value: "6", icon: UploadCloud },
        { label: "Checklist Items", value: "42", icon: ClipboardCheck },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Legal Queue" subtitle="Cases requiring legal input">
          <ItemList items={["Ownership dispute: DSP-231", "Registry appeal: APP-1089", "Fraud prosecution support: FD-992"]} />
        </Panel>
        <Panel title="Authenticity Requests" subtitle="Document and order validation">
          <ItemList items={["Validate notarized deed signature", "Confirm survey report chain of custody", "Cross-check court order metadata"]} />
        </Panel>
        <Panel title="Compliance Status" subtitle="Active obligations">
          <ItemList items={["Act 843 policy review in progress", "Retention schedule attestation pending", "Quarterly legal audit package draft"]} />
          <div className="mt-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Compliance checkpoints are traceable in audit logs.</div>
        </Panel>
      </div>
    </PortalShell>
  );
}
