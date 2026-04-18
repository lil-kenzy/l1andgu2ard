"use client";

import { useEffect, useState } from "react";
import { GitMerge, Scissors, Search, ShieldAlert, Waypoints } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";
import { adminAPI } from "@/lib/api/client";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Verifications", href: "/admin/verifications" },
  { label: "Registry", href: "/admin/registry" },
  { label: "Users", href: "/admin/users" },
  { label: "Fraud", href: "/admin/fraud" },
  { label: "Disputes", href: "/admin/disputes" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Audit", href: "/admin/audit" },
  { label: "Officers", href: "/admin/officers" },
];

interface RegistryProperty {
  _id: string;
  title: string;
  serialNumber?: string;
  parcelNumber?: string;
  location?: { region?: string; district?: string };
}

export default function AdminRegistryPage() {
  const [properties, setProperties] = useState<RegistryProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    adminAPI
      .getRegistry()
      .then((res) => setProperties(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExportGeoJSON = async () => {
    setExporting(true);
    try {
      const res = await adminAPI.getRegistry({ format: "geojson" });
      const blob = new Blob([JSON.stringify(res.data.data, null, 2)], {
        type: "application/geo+json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "landguard-registry.geojson";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // continue
    } finally {
      setExporting(false);
    }
  };

  return (
    <PortalShell
      portal="Admin Portal"
      title="Land Registry Manager"
      subtitle="Nationwide parcel map manager with search/edit tools, merge/split actions, and conflict detection."
      navItems={navItems}
      stats={[
        { label: "Parcels Indexed", value: loading ? "…" : String(properties.length), icon: Waypoints },
        { label: "Conflicts", value: "—", icon: ShieldAlert },
        { label: "Merge Ops", value: "—", icon: GitMerge },
        { label: "Split Ops", value: "—", icon: Scissors },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Master Registry" subtitle="Parcel listing">
            {loading ? (
              <p className="text-sm text-slate-500 py-4">Loading registry…</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2 pr-4">Title</th>
                        <th className="py-2 pr-4">Serial No.</th>
                        <th className="py-2 pr-4">Parcel No.</th>
                        <th className="py-2">Region</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.slice(0, 50).map((p) => (
                        <tr
                          key={p._id}
                          className="border-b border-slate-100 dark:border-slate-700/60"
                        >
                          <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">
                            {p.title}
                          </td>
                          <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">
                            {p.serialNumber || "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">
                            {p.parcelNumber || "—"}
                          </td>
                          <td className="py-2.5 text-slate-500 dark:text-slate-400">
                            {p.location?.region || p.location?.district || "—"}
                          </td>
                        </tr>
                      ))}
                      {properties.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-6 text-center text-slate-400 text-sm"
                          >
                            No parcels found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {properties.length > 50 && (
                  <p className="text-xs text-slate-400 mt-2">
                    Showing first 50 of {properties.length} parcels.
                  </p>
                )}
              </>
            )}
          </Panel>
        </div>

        <Panel title="Operations" subtitle="Advanced parcel actions">
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {[
              "Merge neighboring parcels",
              "Split parcel by survey geometry",
              "Detect overlaps and ownership conflicts",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={handleExportGeoJSON}
            disabled={exporting || loading}
            className="mt-4 w-full rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {exporting ? "Exporting…" : "Export GeoJSON"}
          </button>
        </Panel>
      </div>
    </PortalShell>
  );
}

