"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Heart, Scale, Bell, Grid3X3, FileText, Trash2 } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";
import { propertiesAPI } from "@/lib/api/client";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

interface SavedProperty {
  _id: string;
  title?: string;
  name?: string;
  price?: number;
  location?: { district?: string; region?: string };
  status?: string;
  verified?: boolean;
}

export default function BuyerFavoritesPage() {
  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertiesAPI.getSaved()
      .then((res) => setSaved(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (id: string) => {
    try {
      await propertiesAPI.save(id); // toggle: second call removes
      setSaved((prev) => prev.filter((p) => p._id !== id));
    } catch {/* ignore */}
  };

  const displaySaved = saved.length > 0 ? saved : MOCK_SAVED;

  return (
    <PortalShell
      portal="Buyer Portal"
      title="Saved Properties & Favorites"
      subtitle="Organize saved lands, compare options side-by-side, and export shortlist reports."
      navItems={navItems}
      stats={[
        { label: "Saved Parcels", value: String(displaySaved.length), icon: Heart },
        { label: "Active Price Alerts", value: "11", icon: Bell },
        { label: "Comparison Sets", value: "4", icon: Scale },
        { label: "Exported Reports", value: "6", icon: FileText },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Saved Lands Grid" subtitle="Favorites grouped by location and intent">
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {displaySaved.map((item) => {
                  const id = item._id;
                  const label = item.title ?? item.name ?? "Property";
                  const loc = [item.location?.district, item.location?.region].filter(Boolean).join(", ") || "—";
                  return (
                    <div key={id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">📍 {loc}</p>
                        {item.price ? <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">₵{Number(item.price).toLocaleString()}</p> : null}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/buyer/property/${id}`} className="text-blue-600 dark:text-blue-400 text-xs font-medium">Open</Link>
                        {saved.length > 0 && (
                          <button onClick={() => handleUnsave(id)} className="text-red-400 hover:text-red-600 transition" title="Remove">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Tools" subtitle="Compare, alert, and export">
          <ItemList items={["Comparison tool with up to 5 parcels", "Automatic price-drop monitoring", "Watermarked PDF export for offline review"]} />
          <div className="mt-4 grid gap-2 text-sm">
            <button className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition flex items-center justify-center gap-2"><Scale className="w-4 h-4" />Compare selected</button>
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><Download className="w-4 h-4" />Export PDF</button>
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><Grid3X3 className="w-4 h-4" />Create board</button>
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}

const MOCK_SAVED: SavedProperty[] = [
  { _id: "1", title: "East Legon – Residential plot", price: 450000, location: { district: "East Legon", region: "Greater Accra" }, verified: true },
  { _id: "2", title: "Airport Hills – Mixed-use parcel", price: 820000, location: { district: "Airport Hills", region: "Greater Accra" }, verified: true },
  { _id: "3", title: "Tema Comm. 25 – Title ready", price: 310000, location: { district: "Community 25", region: "Tema" }, verified: false },
  { _id: "4", title: "Kasoa Junction – High-growth zone", price: 180000, location: { district: "Kasoa", region: "Central Region" }, verified: true },
];
