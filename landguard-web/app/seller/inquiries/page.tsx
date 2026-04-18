import { Download, Filter, MessageSquareMore, Reply, UserRoundPlus } from "lucide-react";
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

export default function SellerInquiriesPage() {
  return (
    <PortalShell
      portal="Seller Portal"
      title="Inquiry Management"
      subtitle="Unified inbox with filters, canned replies, agent assignment, and export support."
      navItems={navItems}
      stats={[
        { label: "Open Inquiries", value: "32", icon: MessageSquareMore },
        { label: "Assigned", value: "18", icon: UserRoundPlus },
        { label: "Pending Reply", value: "9", icon: Reply },
        { label: "Filtered Queues", value: "6", icon: Filter },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Inquiry Inbox" subtitle="Message queue and assignment status">
            <ItemList items={["Buyer request for East Legon title verification", "Site visit request for Tema lot", "Negotiation inquiry for Airport Hills parcel"]} />
          </Panel>
        </div>

        <Panel title="Operations" subtitle="Efficiency tools">
          <ItemList items={["Apply canned response templates", "Assign to internal agents", "Export filtered inquiries to CSV"]} />
          <button className="mt-4 w-full rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 text-sm"><Download className="w-4 h-4" />Export CSV</button>
        </Panel>
      </div>
    </PortalShell>
  );
}
