"use client";

import { useEffect, useState } from "react";
import { CalendarCheck2, FileBadge2, Landmark, Loader2, Receipt, Shield, Wallet } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";
import { transactionsAPI } from "@/lib/api/client";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

interface Transaction {
  _id: string;
  reference?: string;
  propertyId?: { title?: string; propertyTitle?: string };
  status?: string;
  amount?: number;
  price?: number;
  createdAt?: string;
}

const STATUS_LABEL: Record<string, string> = {
  initiated: "Initiated",
  pending: "Pending",
  in_escrow: "Escrow Review",
  site_visit: "Site Visit",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

export default function BuyerTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionsAPI
      .getHistory()
      .then((res) => setTransactions(res.data?.data ?? []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: transactions.length,
    escrow: transactions.filter((t) => t.status === "in_escrow").length,
    siteVisit: transactions.filter((t) => t.status === "site_visit").length,
    completed: transactions.filter((t) => t.status === "completed").length,
  };

  return (
    <PortalShell
      portal="Buyer Portal"
      title="Transaction History"
      subtitle="View-only transaction records with escrow progress, receipts, and site-visit schedules."
      navItems={navItems}
      stats={[
        { label: "Transactions", value: String(counts.total), icon: Wallet },
        { label: "Escrow Open", value: String(counts.escrow), icon: Shield },
        { label: "Site Visits", value: String(counts.siteVisit), icon: CalendarCheck2 },
        { label: "Completed", value: String(counts.completed), icon: Receipt },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="History Ledger" subtitle="Chronological transaction events">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No transactions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 pr-4">Reference</th>
                      <th className="py-2 pr-4">Property</th>
                      <th className="py-2 pr-4">Stage</th>
                      <th className="py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => {
                      const ref = t.reference ?? t._id.slice(-8).toUpperCase();
                      const title = t.propertyId?.title ?? t.propertyId?.propertyTitle ?? "—";
                      const stage = STATUS_LABEL[t.status ?? ""] ?? t.status ?? "—";
                      const amount = t.amount ?? t.price;
                      return (
                        <tr key={t._id} className="border-b border-slate-100 dark:border-slate-700/60">
                          <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300 font-mono text-xs">{ref}</td>
                          <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">{title}</td>
                          <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">{stage}</td>
                          <td className="py-2.5 text-slate-700 dark:text-slate-300">
                            {amount ? `GHS ${Number(amount).toLocaleString()}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
