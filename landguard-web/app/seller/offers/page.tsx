import { CheckCircle2, Clock3, HandCoins, XCircle } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "List Property", href: "/seller/list-property" },
  { label: "Listings", href: "/seller/listings" },
  { label: "Documents", href: "/seller/documents" },
  { label: "Inquiries", href: "/seller/inquiries" },
  { label: "Offers", href: "/seller/offers" },
  { label: "Profile", href: "/seller/profile" },
];

export default function SellerOffersPage() {
  return (
    <PortalShell
      portal="Seller Portal"
      title="Offers & Negotiations"
      subtitle="Track incoming offers, submit counter-offers, and progress transactions on a single timeline."
      navItems={navItems}
      stats={[
        { label: "Offers Received", value: "21", icon: HandCoins },
        { label: "Countered", value: "8", icon: Clock3 },
        { label: "Accepted", value: "5", icon: CheckCircle2 },
        { label: "Rejected", value: "3", icon: XCircle },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Offer Tracker" subtitle="Current negotiation table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2">Buyer</th>
                    <th className="py-2">Offer</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["K. Mensah", "GHS 430,000", "Pending", "Counter"],
                    ["A. Boateng", "GHS 448,000", "Countered", "Review"],
                    ["Apex Ltd", "GHS 450,000", "Accepted", "Timeline"],
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

        <Panel title="Negotiation Workflow" subtitle="Timeline and controls">
          <ItemList items={["Offer receipt and compliance check", "Counter-offer submission", "Escrow initiation on acceptance"]} />
          <div className="mt-4 grid gap-2 text-sm">
            <button className="rounded-lg bg-emerald-600 text-white py-2 hover:bg-emerald-700 transition">Accept selected</button>
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition">Send counter-offer</button>
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
