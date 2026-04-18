import Link from "next/link";
import { BarChart3, CheckSquare, ListChecks, ToggleLeft } from "lucide-react";
import { Panel, PortalShell, ItemList } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "List Property", href: "/seller/list-property" },
  { label: "Listings", href: "/seller/listings" },
  { label: "Documents", href: "/seller/documents" },
  { label: "Inquiries", href: "/seller/inquiries" },
  { label: "Offers", href: "/seller/offers" },
  { label: "Profile", href: "/seller/profile" },
];

export default function SellerListingsPage() {
  return (
    <PortalShell
      portal="Seller Portal"
      title="Manage Listings"
      subtitle="Table view for all listings with bulk actions, status toggles, and performance snapshots."
      navItems={navItems}
      stats={[
        { label: "Active", value: "14", icon: ListChecks },
        { label: "Draft", value: "3", icon: CheckSquare },
        { label: "Paused", value: "1", icon: ToggleLeft },
        { label: "Top CTR", value: "8.2%", icon: BarChart3 },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Listings Table" subtitle="Bulk publish, pause, and archive operations">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2">Property</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Views</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["East Legon Plot", "Active", "1,204", "/seller/analytics/1"],
                    ["Airport Hills Parcel", "Active", "982", "/seller/analytics/2"],
                    ["Tema Commercial Lot", "Draft", "120", "/seller/analytics/3"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-slate-100 dark:border-slate-700/60">
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">{row[0]}</td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">{row[1]}</td>
                      <td className="py-2.5 text-slate-700 dark:text-slate-300">{row[2]}</td>
                      <td className="py-2.5"><Link href={row[3]} className="text-blue-600 dark:text-blue-400">Analytics</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel title="Bulk Actions" subtitle="Apply on selected listings">
          <ItemList items={["Activate / pause selected listings", "Assign tags and campaign labels", "Export selected listing performance"]} />
          <div className="mt-4 grid gap-2 text-sm">
            <button className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition">Bulk activate</button>
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition">Bulk pause</button>
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
