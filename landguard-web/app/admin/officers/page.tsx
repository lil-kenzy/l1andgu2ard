import { BookOpenCheck, BriefcaseBusiness, Network, UserRoundCog, UsersRound } from "lucide-react";
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

export default function AdminOfficersPage() {
  return (
    <PortalShell
      portal="Admin Portal"
      title="Officer Management"
      subtitle="Manage officer profiles, role assignment, workload distribution, and training readiness."
      navItems={navItems}
      stats={[
        { label: "Officers", value: "264", icon: UsersRound },
        { label: "Assigned Cases", value: "1,932", icon: BriefcaseBusiness },
        { label: "Training Modules", value: "14", icon: BookOpenCheck },
        { label: "Role Profiles", value: "9", icon: UserRoundCog },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Workload Distribution" subtitle="Balance assignments across teams">
            <ItemList items={["Region-based queue balancing", "Expertise-linked assignment rules", "Escalation routing and backup coverage"]} />
          </Panel>
        </div>
        <Panel title="Development" subtitle="Training and enablement">
          <ItemList items={["Skill matrix and certifications", "Mandatory module completion", "Mentorship and performance check-ins"]} />
          <div className="mt-4 text-sm rounded-lg border border-slate-300 dark:border-slate-600 p-3 flex items-center gap-2"><Network className="w-4 h-4" /> Create team clusters for regional support coverage.</div>
        </Panel>
      </div>
    </PortalShell>
  );
}
