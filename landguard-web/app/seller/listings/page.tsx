"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, CheckSquare, Loader2, ListChecks, ToggleLeft, AlertCircle } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";
import { propertiesAPI } from "@/lib/api/client";

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

type PropertyStatus = "available" | "under_offer" | "sold" | "paused" | "pending" | "rejected";

interface Property {
  _id: string;
  propertyTitle?: string;
  title?: string;
  status: PropertyStatus;
  analytics?: { views?: number; saves?: number; inquiries?: number };
}

const STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "Available",
  under_offer: "Under Offer",
  sold: "Sold",
  paused: "Paused",
  pending: "Pending Review",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<PropertyStatus, string> = {
  available: "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300",
  under_offer: "text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300",
  sold: "text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300",
  paused: "text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300",
  pending: "text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300",
  rejected: "text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300",
};

const ALLOWED_TRANSITIONS: Record<PropertyStatus, PropertyStatus[]> = {
  available: ["paused", "under_offer", "sold"],
  under_offer: ["available", "paused", "sold"],
  paused: ["available"],
  sold: [],
  pending: [],
  rejected: [],
};

export default function SellerListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<{ id: string; msg: string } | null>(null);

  useEffect(() => {
    propertiesAPI.getMine()
      .then((res) => setProperties(res.data?.data ?? []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (property: Property, newStatus: PropertyStatus) => {
    setStatusError(null);
    setStatusChanging(property._id);
    try {
      await propertiesAPI.updateStatus(property._id, newStatus);
      setProperties((prev) => prev.map((p) => p._id === property._id ? { ...p, status: newStatus } : p));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setStatusError({ id: property._id, msg: axiosErr?.response?.data?.message ?? "Status update failed." });
    } finally {
      setStatusChanging(null);
    }
  };

  const counts = {
    available: properties.filter((p) => p.status === "available").length,
    pending: properties.filter((p) => p.status === "pending").length,
    under_offer: properties.filter((p) => p.status === "under_offer").length,
    sold: properties.filter((p) => p.status === "sold").length,
  };

  return (
    <PortalShell
      portal="Seller Portal"
      title="Manage Listings"
      subtitle="All your listings with real-time status, performance, and management controls."
      navItems={navItems}
      stats={[
        { label: "Available", value: String(counts.available), icon: ListChecks },
        { label: "Pending Review", value: String(counts.pending), icon: CheckSquare },
        { label: "Under Offer", value: String(counts.under_offer), icon: ToggleLeft },
        { label: "Sold", value: String(counts.sold), icon: BarChart3 },
      ]}
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <p className="text-lg font-medium mb-2">No listings yet</p>
          <Link href="/seller/list-property" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">Create your first listing →</Link>
        </div>
      ) : (
        <Panel title="All Listings" subtitle="Click a status badge to change it. Marking as Sold requires a confirmed transaction.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 pr-4">Property</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Views</th>
                  <th className="py-2 pr-4">Saves</th>
                  <th className="py-2 pr-4">Inquiries</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => {
                  const title = p.propertyTitle ?? p.title ?? p._id;
                  const transitions = ALLOWED_TRANSITIONS[p.status] ?? [];
                  const err = statusError?.id === p._id ? statusError.msg : null;
                  return (
                    <>
                      <tr key={p._id} className="border-b border-slate-100 dark:border-slate-700/60">
                        <td className="py-2.5 pr-4 text-slate-800 dark:text-slate-200 font-medium">{title}</td>
                        <td className="py-2.5 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[p.status] ?? ""}`}>
                            {STATUS_LABELS[p.status] ?? p.status}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">{p.analytics?.views ?? "—"}</td>
                        <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">{p.analytics?.saves ?? "—"}</td>
                        <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">{p.analytics?.inquiries ?? "—"}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/seller/analytics/${p._id}`} className="text-blue-600 dark:text-blue-400 hover:underline text-xs">Analytics</Link>
                            {transitions.map((t) => (
                              <button
                                key={t}
                                onClick={() => handleStatusChange(p, t)}
                                disabled={statusChanging === p._id}
                                className={`rounded border px-2 py-0.5 text-xs disabled:opacity-50 transition ${t === "paused" ? "border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20" : "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                              >
                                {statusChanging === p._id ? <Loader2 className="w-3 h-3 animate-spin inline" /> : t === "paused" ? "⏸ Pause" : `Mark ${STATUS_LABELS[t]}`}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                      {err && (
                        <tr key={`${p._id}-err`}>
                          <td colSpan={6} className="pb-2">
                            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 px-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{err}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </PortalShell>
  );
}
