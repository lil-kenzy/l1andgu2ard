"use client";

import { useEffect, useState } from "react";
import { GitMerge, Map, Scissors, Search, ShieldAlert, Waypoints } from "lucide-react";
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
  { label: "Gateway", href: "/admin/gateway" },
];

interface RegistryProperty {
  _id: string;
  title: string;
  serialNumber?: string;
  parcelNumber?: string;
  gpsAddress?: string;
  location?: { region?: string; district?: string };
  seller?: { personalInfo?: { fullName?: string; ghanaCardNumber?: string } };
}

export default function AdminRegistryPage() {
  const [properties, setProperties] = useState<RegistryProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportingKml, setExportingKml] = useState(false);

  const fetchRegistry = (q?: string) => {
    setLoading(true);
    adminAPI
      .getRegistry(q ? { search: q } : undefined)
      .then((res) => setProperties(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    fetchRegistry(searchInput || undefined);
  };

  const handleExportGeoJSON = async () => {
    setExporting(true);
    try {
      const res = await adminAPI.getRegistry({ format: "geojson", ...(search ? { search } : {}) });
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

  const handleExportKML = async () => {
    setExportingKml(true);
    try {
      const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
      const params = new URLSearchParams({ format: "kml" });
      if (search) params.set("search", search);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      const resp = await fetch(`${BASE}/api/admin/registry?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const text = await resp.text();
      const blob = new Blob([text], { type: "application/vnd.google-earth.kml+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "landguard-registry.kml";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // continue
    } finally {
      setExportingKml(false);
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
          <Panel title="Master Registry" subtitle="Parcel listing — search by owner, Ghana Card, parcel ID, or GPS coordinates">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by owner name, Ghana Card No., parcel/serial No., or GPS address…"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 transition flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" /> Search
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(""); setSearch(""); fetchRegistry(); }}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Clear
                </button>
              )}
            </form>

            {loading ? (
              <p className="text-sm text-slate-500 py-4">Loading registry…</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2 pr-4">Title</th>
                        <th className="py-2 pr-4">Owner</th>
                        <th className="py-2 pr-4">Parcel No.</th>
                        <th className="py-2 pr-4">GPS / Serial</th>
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
                            {p.seller?.personalInfo?.fullName || "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                            {p.parcelNumber || "—"}
                          </td>
                          <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                            {p.gpsAddress || p.serialNumber || "—"}
                          </td>
                          <td className="py-2.5 text-slate-500 dark:text-slate-400">
                            {p.location?.region || p.location?.district || "—"}
                          </td>
                        </tr>
                      ))}
                      {properties.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-6 text-center text-slate-400 text-sm"
                          >
                            {search ? `No parcels found for "${search}".` : "No parcels found."}
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

        <Panel title="Operations" subtitle="Advanced parcel actions and GIS exports">
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
          <div className="mt-4 space-y-2">
            <button
              onClick={handleExportGeoJSON}
              disabled={exporting || loading}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {exporting ? "Exporting…" : "Export GeoJSON"}
            </button>
            <button
              onClick={handleExportKML}
              disabled={exportingKml || loading}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Map className="w-4 h-4" />
              {exportingKml ? "Exporting…" : "Export KML"}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            KML files are compatible with Google Earth, QGIS, and the Lands Commission GIS portal.
          </p>
        </Panel>
      </div>
    </PortalShell>
  );
}

