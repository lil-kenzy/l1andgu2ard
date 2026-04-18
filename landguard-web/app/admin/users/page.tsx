import { Megaphone, ShieldBan, UserCog, Users } from "lucide-react";
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

export default function AdminUsersPage() {
  return (
    <PortalShell
      portal="Admin Portal"
      title="User Management"
      subtitle="Manage users at scale with profile detail view, suspension controls, impersonation, and bulk communication."
      navItems={navItems}
      stats={[
        { label: "Total Users", value: "524k", icon: Users },
        { label: "Flagged", value: "429", icon: ShieldBan },
        { label: "Admin Actions", value: "1,282", icon: UserCog },
        { label: "Bulk Campaigns", value: "26", icon: Megaphone },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="User Directory" subtitle="Search and administrative actions">
            <ItemList items={["Suspend or reactivate account", "Impersonate for support diagnostics", "Trigger KYC revalidation workflow"]} />
          </Panel>
        </div>
        <Panel title="Bulk Communications" subtitle="Broadcast updates and compliance notices">
          <ItemList items={["Audience segmentation by role", "Delivery tracking metrics", "Template-based communications"]} />
        </Panel>
      </div>
    </PortalShell>
  );
}
