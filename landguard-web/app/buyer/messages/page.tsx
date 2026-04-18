import { Shield, MessageSquareText, Flag, CheckCheck, Paperclip } from "lucide-react";
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

export default function BuyerMessagesPage() {
  return (
    <PortalShell
      portal="Buyer Portal"
      title="Messages Center"
      subtitle="Encrypted chat threads with sellers, secure file sharing, read receipts, and abuse reporting tools."
      navItems={navItems}
      stats={[
        { label: "Open Threads", value: "13", icon: MessageSquareText },
        { label: "Unread", value: "8", icon: CheckCheck },
        { label: "Shared Files", value: "22", icon: Paperclip },
        { label: "Safety Flags", value: "1", icon: Flag },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Conversation List" subtitle="Priority and recency sorted">
          <ItemList items={["Kwame Mensah - East Legon plot", "Apex Estates - Airport Hills block", "Jane Addo - Tema serviced parcel"]} />
        </Panel>

        <div className="lg:col-span-2">
          <Panel title="Secure Thread" subtitle="End-to-end encrypted listing communication">
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-slate-100 dark:bg-slate-900/40 p-3 border border-slate-200 dark:border-slate-700">Seller: Documents uploaded. You can review the cadastral plan and title certificate.</div>
              <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 border border-blue-200 dark:border-blue-800">You: Thanks. I am scheduling a site visit and legal review.</div>
              <div className="grid sm:grid-cols-[1fr_auto] gap-2">
                <input placeholder="Type message..." className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2" />
                <button className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition">Send</button>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4 grid lg:grid-cols-3 gap-4">
        <Panel title="Security" subtitle="Built-in protections for buyer safety">
          <ItemList items={["Identity-verified chat participants", "Malicious link scanning on attachments", "Auto-redaction of sensitive metadata"]} />
        </Panel>
        <Panel title="Attachments" subtitle="Property files and evidence sharing">
          <ItemList items={["Title deeds and survey plans", "Visit photos and geotag evidence", "Watermarked downloadable records"]} />
        </Panel>
        <Panel title="Moderation" subtitle="Escalation and reporting workflow">
          <ItemList items={["Flag suspicious requests", "Request mediation through support", "Export thread evidence to disputes"]} />
        </Panel>
      </div>

      <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
        <Shield className="w-4 h-4 mt-0.5" />
        Message records are tamper-resistant and can support legal review if a transaction dispute occurs.
      </div>
    </PortalShell>
  );
}
