import { CalendarCheck2, FileBadge2, Landmark, Receipt, Shield, Wallet } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

export default function BuyerTransactionsPage() {
  return (
    <PortalShell
      portal="Buyer Portal"
      title="Transaction History"
      subtitle="View-only transaction records with escrow progress, receipts, and site-visit schedules."
      navItems={navItems}
      stats={[
        { label: "Transactions", value: "9", icon: Wallet },
        { label: "Escrow Open", value: "2", icon: Shield },
        { label: "Site Visits", value: "5", icon: CalendarCheck2 },
        { label: "Receipts", value: "17", icon: Receipt },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="History Ledger" subtitle="Chronological transaction events">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2">Reference</th>
                    <th className="py-2">Property</th>
                    <th className="py-2">Stage</th>
                    <th className="py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["TXN-0092", "East Legon Plot", "Escrow Review", "GHS 450,000"],
                    ["TXN-0081", "Tema Parcel", "Completed", "GHS 290,000"],
                    ["TXN-0079", "Kasoa Land", "Site Visit", "GHS 180,000"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-slate-100 dark:border-slate-700/60">
                      {row.map((cell) => (
                        <td key={cell} className="py-2.5 text-slate-700 dark:text-slate-300">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel title="Related Modules" subtitle="Visit schedule and documentation">
          <ItemList items={["Site visit calendar with reminders", "Escrow status timeline and milestones", "Receipt vault with downloadable records"]} />
          <div className="mt-4 grid gap-2 text-sm">
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><FileBadge2 className="w-4 h-4" />Open receipt archive</button>
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><Landmark className="w-4 h-4" />Track escrow state</button>
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
