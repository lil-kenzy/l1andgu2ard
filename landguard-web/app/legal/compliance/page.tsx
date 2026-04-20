"use client";
import { BadgeCheck, ClipboardCheck, FileCheck2, Shield } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/legal/dashboard" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Compliance", href: "/legal/compliance" },
];

export default function LegalCompliancePage() {
  return (
    <PortalShell
      portal="Legal & Compliance"
      title="Compliance"
      subtitle="Regulatory certifications, audit readiness posture, and documented data handling disclosures."
      navItems={navItems}
      stats={[
        { label: "Certifications", value: "7", icon: BadgeCheck },
        { label: "Open Controls", value: "4", icon: ClipboardCheck },
        { label: "Audit Readiness", value: "93%", icon: FileCheck2 },
        { label: "Security Controls", value: "28", icon: Shield },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Regulatory Posture" subtitle="Current obligations and status">
          <ItemList items={["Act 843 data governance controls", "Information security policy alignment", "Retention and deletion compliance"]} />
        </Panel>
        <Panel title="Audit Readiness" subtitle="Evidence and controls">
          <ItemList items={["Control testing records", "Access review attestations", "Incident response drill logs"]} />
        </Panel>
        <Panel title="Disclosures" subtitle="Public and partner transparency">
          <ItemList items={["Data handling overview", "Third-party processor list", "Cross-border transfer notices"]} />
        </Panel>
      </div>
    </PortalShell>
  );
}
