"use client";
import { Lock, ShieldCheck } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/legal/dashboard" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Compliance", href: "/legal/compliance" },
];

export default function LegalPrivacyPage() {
  return (
    <PortalShell
      portal="Legal & Compliance"
      title="Privacy Policy"
      subtitle="Privacy commitments aligned to GDPR principles and Ghana Data Protection Act (Act 843)."
      navItems={navItems}
      stats={[
        { label: "Policy Version", value: "v2.6", icon: Lock },
        { label: "Last Review", value: "Apr 2026", icon: ShieldCheck },
        { label: "Jurisdictions", value: "2", icon: Lock },
        { label: "DPO Contact", value: "Active", icon: ShieldCheck },
      ]}
    >
      <div className="grid gap-4">
        <Panel title="Data Collection & Purpose" subtitle="Lawful basis and scope">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">LANDGUARD processes account, identity, transaction, and geospatial records only for lawful service delivery, fraud prevention, and public land registry compliance. Data minimization and purpose limitation are applied across workflows.</p>
        </Panel>
        <Panel title="Rights & Controls" subtitle="User data rights">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">Users can request access, correction, deletion, and portability of eligible data. Security safeguards include encryption in transit and at rest, role-based access controls, and log-based monitoring for unauthorized access patterns.</p>
        </Panel>
      </div>
    </PortalShell>
  );
}
