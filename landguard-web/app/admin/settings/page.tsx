import { Flag, KeyRound, Mail, MessageSquare, Settings2 } from "lucide-react";
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

export default function AdminSettingsPage() {
  return (
    <PortalShell
      portal="Admin Portal"
      title="System Configuration"
      subtitle="Feature flags, content settings, communication templates, and API credential governance."
      navItems={navItems}
      stats={[
        { label: "Feature Flags", value: "24", icon: Flag },
        { label: "Template Sets", value: "17", icon: Mail },
        { label: "API Keys", value: "9", icon: KeyRound },
        { label: "Config Changes", value: "103", icon: Settings2 },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Feature Governance" subtitle="Release and rollout controls">
          <ItemList items={["Flag-based staged deployments", "Role-targeted feature exposure", "Emergency kill-switch toggles"]} />
        </Panel>
        <Panel title="Template Center" subtitle="Email and SMS content settings">
          <ItemList items={["OTP and verification templates", "Dispute and fraud notices", "Localization for Ghana regions"]} />
          <div className="mt-4 text-sm rounded-lg border border-slate-300 dark:border-slate-600 p-3 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Preview template rendering before publishing.</div>
        </Panel>
        <Panel title="API Security" subtitle="Credential lifecycle management">
          <ItemList items={["Scoped API key issuance", "Rotation and expiration controls", "Audit-linked key usage logs"]} />
        </Panel>
      </div>
    </PortalShell>
  );
}
