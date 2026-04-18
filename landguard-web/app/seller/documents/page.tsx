import { Clock3, FileArchive, History, Search, Share2 } from "lucide-react";
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

export default function SellerDocumentsPage() {
  return (
    <PortalShell
      portal="Seller Portal"
      title="Document Vault"
      subtitle="Encrypted storage for listing documents with expiry tracking, OCR search, version history, and share links."
      navItems={navItems}
      stats={[
        { label: "Files Stored", value: "148", icon: FileArchive },
        { label: "Expiring Soon", value: "3", icon: Clock3 },
        { label: "Version Entries", value: "219", icon: History },
        { label: "Shared Links", value: "21", icon: Share2 },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Vault Inventory" subtitle="Recent document sets">
            <ItemList items={["East Legon title deed - expires in 11 months", "Airport Hills permit - renewal due in 14 days", "Survey plan v4 with georeferenced points"]} />
          </Panel>
        </div>

        <Panel title="Tools" subtitle="Search and secure sharing">
          <div className="grid gap-2 text-sm">
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><Search className="w-4 h-4" />OCR search</button>
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><History className="w-4 h-4" />Version history</button>
            <button className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition flex items-center justify-center gap-2"><Share2 className="w-4 h-4" />Generate share link</button>
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
