"use client";

import { useEffect, useState } from "react";
import { BarChart3, Eye, Heart, Loader2, MessageSquare, TrendingUp } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";
import { analyticsAPI, propertiesAPI } from "@/lib/api/client";

const navItems = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "List Property", href: "/seller/list-property" },
  { label: "Listings", href: "/seller/listings" },
  { label: "Documents", href: "/seller/documents" },
  { label: "Inquiries", href: "/seller/inquiries" },
  { label: "Offers", href: "/seller/offers" },
  { label: "Analytics", href: "/seller/analytics" },
  { label: "Profile", href: "/seller/profile" },
];

interface SellerStats {
  totalProperties: number;
  totalViews: number;
  totalSaves: number;
  totalInquiries: number;
  activeOffers: number;
  sold: number;
}

interface PropertyRow {
  _id: string;
  propertyTitle?: string;
  title?: string;
  status: string;
  analytics?: { views?: number; saves?: number; inquiries?: number };
}

export default function SellerAnalyticsPage() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getSellerStats().catch(() => null),
      propertiesAPI.getMine().catch(() => null),
    ]).then(([statsRes, propsRes]) => {
      if (statsRes?.data?.data) setStats(statsRes.data.data);
      if (propsRes?.data?.data) setProperties(propsRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const s = stats ?? { totalProperties: 0, totalViews: 0, totalSaves: 0, totalInquiries: 0, activeOffers: 0, sold: 0 };

  return (
    <PortalShell
      portal="Seller Portal"
      title="Analytics"
      subtitle="Portfolio-wide performance metrics and per-listing breakdowns."
      navItems={navItems}
      stats={[
        { label: "Total Views", value: loading ? "…" : String(s.totalViews), icon: Eye },
        { label: "Total Saves", value: loading ? "…" : String(s.totalSaves), icon: Heart },
        { label: "Inquiries", value: loading ? "…" : String(s.totalInquiries), icon: MessageSquare },
        { label: "Sold", value: loading ? "…" : String(s.sold), icon: TrendingUp },
      ]}
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          <Panel title="Portfolio Overview" subtitle="All-time aggregate stats">
            <ItemList items={[
              `Total listings: ${s.totalProperties}`,
              `Views: ${s.totalViews}`,
              `Saves: ${s.totalSaves}`,
              `Inquiries: ${s.totalInquiries}`,
              `Under offer: ${s.activeOffers}`,
              `Sold: ${s.sold}`,
            ]} />
          </Panel>

          <div className="lg:col-span-2">
            <Panel title="Per-Listing Breakdown" subtitle="Performance for each property">
              {properties.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No listings found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2 pr-4">Property</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4 text-right"><Eye className="w-3.5 h-3.5 inline mr-1" />Views</th>
                        <th className="py-2 pr-4 text-right"><Heart className="w-3.5 h-3.5 inline mr-1" />Saves</th>
                        <th className="py-2 text-right"><MessageSquare className="w-3.5 h-3.5 inline mr-1" />Inquiries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p) => (
                        <tr key={p._id} className="border-b border-slate-100 dark:border-slate-700/60">
                          <td className="py-2.5 pr-4 text-slate-800 dark:text-slate-200 font-medium">
                            {p.propertyTitle ?? p.title ?? p._id}
                          </td>
                          <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400 capitalize">{p.status}</td>
                          <td className="py-2.5 pr-4 text-right text-slate-700 dark:text-slate-300">{p.analytics?.views ?? "—"}</td>
                          <td className="py-2.5 pr-4 text-right text-slate-700 dark:text-slate-300">{p.analytics?.saves ?? "—"}</td>
                          <td className="py-2.5 text-right text-slate-700 dark:text-slate-300">{p.analytics?.inquiries ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
