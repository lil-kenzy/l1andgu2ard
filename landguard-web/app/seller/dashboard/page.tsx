"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Clock3, FileCheck2, Plus, Wallet, XCircle } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";
import { analyticsAPI, usersAPI } from "@/lib/api/client";

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

interface Stats {
  totalProperties: number;
  totalViews: number;
  totalSaves: number;
  totalInquiries: number;
  activeOffers: number;
  sold: number;
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getSellerStats().catch(() => null),
      usersAPI.getProfile().catch(() => null),
    ]).then(([statsRes, profileRes]) => {
      if (statsRes?.data?.data) setStats(statsRes.data.data);
      const vs = profileRes?.data?.data?.sellerInfo?.verificationStatus;
      if (vs) setVerificationStatus(vs);
    }).finally(() => setLoading(false));
  }, []);

  const s = stats ?? { totalProperties: 0, totalViews: 0, totalSaves: 0, totalInquiries: 0, activeOffers: 0, sold: 0 };

  const VerificationBanner = () => {
    if (verificationStatus === "verified") {
      return (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-4 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Account Verified — You can list properties</span>
        </div>
      );
    }
    if (verificationStatus === "rejected") {
      return (
        <Link href="/seller/documents" className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4 mb-6 hover:bg-red-100 dark:hover:bg-red-900/30 transition">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <span className="text-sm font-medium text-red-800 dark:text-red-300">Verification Rejected — Click here to update your documents</span>
        </Link>
      );
    }
    return (
      <Link href="/seller/profile" className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4 mb-6 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
        <Clock3 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Verification Pending (72-hour SLA) — Complete your profile to speed up review</span>
      </Link>
    );
  };

  return (
    <PortalShell
      portal="Seller Portal"
      title="Seller Dashboard"
      subtitle="Monitor listing performance, revenue trends, and document readiness from one control center."
      navItems={navItems}
      stats={[
        { label: "Active Listings", value: loading ? "…" : String(s.totalProperties), icon: FileCheck2 },
        { label: "Total Views", value: loading ? "…" : String(s.totalViews), icon: BarChart3 },
        { label: "Inquiries", value: loading ? "…" : String(s.totalInquiries), icon: Wallet },
        { label: "Sold", value: loading ? "…" : String(s.sold), icon: AlertTriangle },
      ]}
      featureCards={[
        { title: "Revenue Chart", description: "Weekly and monthly trend snapshots for your listed properties.", icon: Wallet },
        { title: "Expiry Alerts", description: "Track title, permit, and compliance document deadlines.", icon: Clock3 },
        { title: "Quick Publishing", description: "Launch new listings with stepwise review and verification.", icon: Plus },
      ]}
    >
      <VerificationBanner />

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Quick Actions" subtitle="High impact tasks">
          <div className="grid gap-2 text-sm">
            <Link href="/seller/list-property" className="rounded-lg bg-blue-600 text-white py-2 text-center hover:bg-blue-700 transition">Create new listing</Link>
            <Link href="/seller/listings" className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 text-center hover:bg-slate-50 dark:hover:bg-slate-700 transition">Manage listings</Link>
            <Link href="/seller/documents" className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 text-center hover:bg-slate-50 dark:hover:bg-slate-700 transition">Update documents</Link>
          </div>
        </Panel>

        <Panel title="Performance Highlights" subtitle="Top listing momentum">
          <ItemList items={[
            `Total views: ${s.totalViews}`,
            `Total saves: ${s.totalSaves}`,
            `Under offer: ${s.activeOffers} listing${s.activeOffers !== 1 ? "s" : ""}`,
          ]} />
        </Panel>

        <Panel title="Compliance Status" subtitle="Verification and readiness">
          <ItemList items={[
            verificationStatus === "verified" ? "✅ Seller verified" : verificationStatus === "rejected" ? "❌ Verification rejected" : "⏳ Awaiting Lands Commission review",
            `${s.totalProperties} listing${s.totalProperties !== 1 ? "s" : ""} total`,
            `${s.sold} sold`,
          ]} />
        </Panel>
      </div>
    </PortalShell>
  );
}
