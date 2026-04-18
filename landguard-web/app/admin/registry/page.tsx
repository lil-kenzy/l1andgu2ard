import { GitMerge, Scissors, Search, ShieldAlert, Waypoints } from "lucide-react";
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

export default function AdminRegistryPage() {
  return (
    <PortalShell
      portal="Admin Portal"
      title="Land Registry Manager"
      subtitle="Nationwide parcel map manager with search/edit tools, merge/split actions, and conflict detection."
      navItems={navItems}
      stats={[
        { label: "Parcels Indexed", value: "2.1M", icon: Waypoints },
        { label: "Conflicts", value: "143", icon: ShieldAlert },
        { label: "Merge Ops", value: "18", icon: GitMerge },
        { label: "Split Ops", value: "9", icon: Scissors },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Master Registry Map" subtitle="Parcel search and boundary editing">
            <div className="h-[460px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center gap-2 text-slate-500">
              <Search className="w-5 h-5" /> Registry map canvas
            </div>
          </Panel>
        </div>
        <Panel title="Operations" subtitle="Advanced parcel actions">
          <ItemList items={["Merge neighboring parcels", "Split parcel by survey geometry", "Detect overlaps and ownership conflicts"]} />
        </Panel>
      </div>
    </PortalShell>
  );
}
