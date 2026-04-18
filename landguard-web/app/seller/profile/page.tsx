import { BadgeCheck, Building2, CreditCard, Eye, Star } from "lucide-react";
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

export default function SellerProfilePage() {
  return (
    <PortalShell
      portal="Seller Portal"
      title="Seller Profile"
      subtitle="Manage business identity, verification badge, public listing preview, ratings, and payout configuration."
      navItems={navItems}
      stats={[
        { label: "Verification", value: "Verified", icon: BadgeCheck },
        { label: "Public Rating", value: "4.8", icon: Star },
        { label: "Profile Views", value: "2,912", icon: Eye },
        { label: "Payout Methods", value: "2", icon: CreditCard },
      ]}
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Business Profile" subtitle="Public-facing seller identity">
          <ItemList items={["Company: LandPrime Ghana Ltd", "License and registration references", "Support contacts and operating regions"]} />
        </Panel>

        <Panel title="Verification & Payout" subtitle="Trust and payment setup">
          <ItemList items={["Verification badge visibility controls", "Bank / mobile money payout settings", "Tax and invoicing configuration"]} />
        </Panel>
      </div>

      <div className="mt-4">
        <Panel title="Public Preview" subtitle="How buyers see your seller profile">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/30 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Preview card includes rating, verified badge, active listings, and response-time score.
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
