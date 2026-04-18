import Link from "next/link";
import { Clock3, ListChecks, TimerReset, UserCheck } from "lucide-react";
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

export default function AdminVerificationsPage() {
  return (
    <PortalShell
      portal="Admin Portal"
      title="Verification Queue"
      subtitle="Process applications with SLA tracking, bulk assignment, and workload balancing analytics."
      navItems={navItems}
      stats={[
        { label: "Queue Size", value: "612", icon: ListChecks },
        { label: "Avg SLA", value: "14h", icon: Clock3 },
        { label: "Assigned Today", value: "201", icon: UserCheck },
        { label: "Breaches", value: "7", icon: TimerReset },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Queue Table" subtitle="Pending verification applications">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2">Application</th>
                    <th className="py-2">Priority</th>
                    <th className="py-2">SLA</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["APP-1121", "High", "4h", "/admin/verify/1121"],
                    ["APP-1089", "Medium", "11h", "/admin/verify/1089"],
                    ["APP-1042", "Low", "19h", "/admin/verify/1042"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-slate-100 dark:border-slate-700/60">
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">{row[0]}</td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">{row[1]}</td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">{row[2]}</td>
                      <td className="py-2.5"><Link href={row[3]} className="text-blue-600 dark:text-blue-400">Review</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel title="Queue Controls" subtitle="Assignment and balancing">
          <ItemList items={["Bulk assign by region", "Re-prioritize with fraud score", "Distribute by officer workload"]} />
        </Panel>
      </div>
    </PortalShell>
  );
}
