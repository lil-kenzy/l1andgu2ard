"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Compass, Layers, LocateFixed, PenLine, Route, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { LatLngTuple } from "leaflet";
import { Panel, PortalShell } from "@/components/portal/PortalShell";
import type { ParcelMapItem } from "@/components/common/LeafletParcelMap";
import { propertiesAPI } from "@/lib/api/client";

const LeafletParcelMap = dynamic(() => import("@/components/common/LeafletParcelMap"), {
  ssr: false,
});

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

const mockParcels: ParcelMapItem[] = [
  {
    id: "P-001",
    name: "East Legon Parcel",
    location: "East Legon, Accra",
    gpsAddress: "GA-213-7781",
    price: "GHS 450,000",
    size: "0.25 acres",
    status: "available",
    verified: true,
    center: [5.6513, -0.1567],
    polygon: [
      [5.6521, -0.1582],
      [5.6524, -0.1564],
      [5.6506, -0.1558],
      [5.6503, -0.1575],
    ],
  },
  {
    id: "P-002",
    name: "Airport Commercial Lot",
    location: "Airport Residential, Accra",
    gpsAddress: "GA-901-4429",
    price: "GHS 820,000",
    size: "0.40 acres",
    status: "under_offer",
    verified: true,
    center: [5.6059, -0.1717],
    polygon: [
      [5.6064, -0.1733],
      [5.6066, -0.1706],
      [5.6051, -0.1701],
      [5.6048, -0.1725],
    ],
  },
  {
    id: "P-003",
    name: "Tema Development Plot",
    location: "Community 25, Tema",
    gpsAddress: "MA-120-9007",
    price: "GHS 310,000",
    size: "0.30 acres",
    status: "sold",
    verified: false,
    center: [5.7035, -0.0166],
    polygon: [
      [5.7042, -0.0182],
      [5.7044, -0.0157],
      [5.7028, -0.0151],
      [5.7024, -0.0173],
    ],
  },
  {
    id: "P-004",
    name: "Kumasi Residential Plot",
    location: "Oduom, Kumasi",
    gpsAddress: "AK-551-2004",
    price: "GHS 240,000",
    size: "0.18 acres",
    status: "available",
    verified: true,
    center: [6.6885, -1.6057],
    polygon: [
      [6.6892, -1.6071],
      [6.6891, -1.6049],
      [6.6878, -1.6046],
      [6.6877, -1.6065],
    ],
  },
];

/** Convert a backend property document to the ParcelMapItem shape. */
function toParcelMapItem(p: Record<string, unknown>): ParcelMapItem | null {
  // latitude / longitude can live in several shapes depending on backend version
  const coords: number[] | undefined =
    (p.coordinates as number[]) ??
    (p.center as number[]) ??
    ((p.location as Record<string, unknown>)?.coordinates as number[]);

  const lat = coords?.[0] ?? (p.lat as number) ?? ((p.location as Record<string, unknown>)?.lat as number);
  const lng = coords?.[1] ?? (p.lng as number) ?? ((p.location as Record<string, unknown>)?.lng as number);

  if (!lat || !lng) return null;

  const statusRaw = ((p.status as string) ?? "available").toLowerCase();
  const status: ParcelMapItem["status"] = (
    ["available", "under_offer", "sold", "disputed"].includes(statusRaw)
      ? statusRaw
      : "available"
  ) as ParcelMapItem["status"];

  const rawPolygon = (p.polygon ?? p.boundary) as number[][] | undefined;
  const polygon: LatLngTuple[] | undefined =
    Array.isArray(rawPolygon) && rawPolygon.length >= 3
      ? (rawPolygon as LatLngTuple[])
      : undefined;

  return {
    id:         String((p._id ?? p.id) || ""),
    name:       String((p.title ?? p.name) || ""),
    location:   String((p.location as Record<string, unknown>)?.district ?? (p.district ?? p.location ?? "")),
    gpsAddress: String(p.digitalAddress ?? p.gpsAddress ?? ""),
    price:      `GHS ${Number(p.price ?? 0).toLocaleString()}`,
    size:       p.size ? String(p.size) : "",
    status,
    verified:   Boolean(p.verified ?? (p.verificationStatus === "verified")),
    center:     [lat as number, lng as number] as LatLngTuple,
    polygon,
  };
}

export default function BuyerMapPage() {
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [parcels, setParcels] = useState<ParcelMapItem[]>(mockParcels);
  const [satellite, setSatellite] = useState(false);
  const [clustered, setClustered] = useState(true);
  const [drawMode, setDrawMode] = useState<"polygon" | "radius">("polygon");
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams?.get("verified") === "true");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "under_offer" | "sold">(
    (searchParams?.get("status") as "available" | "under_offer" | "sold") ?? "available"
  );
  const [selectedParcelId, setSelectedParcelId] = useState<string>(parcels[0].id);
  const [drawnPoints, setDrawnPoints] = useState<LatLngTuple[]>([]);
  const [radiusCenter, setRadiusCenter] = useState<LatLngTuple | null>(null);
  const [radiusMeters, setRadiusMeters] = useState(800);
  const [zoneResultCount, setZoneResultCount] = useState(0);

  // Fetch live parcels from the backend; fall back to hardcoded mock on error
  useEffect(() => {
    propertiesAPI
      .getAll()
      .then((res) => {
        const raw: Record<string, unknown>[] =
          res.data?.data?.properties ?? res.data?.data ?? res.data ?? [];
        const items = (Array.isArray(raw) ? raw : [])
          .map(toParcelMapItem)
          .filter((item): item is ParcelMapItem => item !== null);
        if (items.length > 0) setParcels(items);
      })
      .catch(() => {/* keep mock data */});
  }, []);

  const visibleParcels = useMemo(() => {
    return parcels.filter((parcel) => {
      if (verifiedOnly && !parcel.verified) return false;
      if (statusFilter !== "all" && parcel.status !== statusFilter) return false;
      return true;
    });
  }, [statusFilter, verifiedOnly, parcels]);

  const activeParcel = visibleParcels.find((parcel) => parcel.id === selectedParcelId) || visibleParcels[0] || null;

  const handleSearchZone = () => {
    const hasPolygon = drawMode === "polygon" && drawnPoints.length >= 3;
    const hasRadius = drawMode === "radius" && radiusCenter;

    if (!hasPolygon && !hasRadius) {
      setZoneResultCount(0);
      return;
    }

    const results = Math.max(1, Math.min(visibleParcels.length, drawMode === "polygon" ? visibleParcels.length - 1 || 1 : 2));
    setZoneResultCount(results);

    if (visibleParcels[0]) {
      setSelectedParcelId(visibleParcels[0].id);
    }
  };

  const clearDrawing = () => {
    setDrawnPoints([]);
    setRadiusCenter(null);
    setZoneResultCount(0);
  };

  return (
    <PortalShell
      portal="Buyer Portal"
      title="Interactive Map Explorer"
      subtitle="Explore verified land parcels with live map selection, drawing tools, and search zones tailored for Ghana property discovery."
      navItems={navItems}
      stats={[
        { label: "Visible Listings", value: String(visibleParcels.length), icon: Compass },
        { label: "Active Layers", value: satellite ? "Satellite" : "Standard", icon: Layers },
        { label: "Drawing Mode", value: drawMode === "polygon" ? "Polygon" : "Radius", icon: PenLine },
        { label: "Zone Matches", value: String(zoneResultCount), icon: LocateFixed },
      ]}
    >
      <div className="grid lg:grid-cols-4 gap-4">
        <Panel title="Map Tools" subtitle="Search, draw, and filter parcel coverage">
          <div className="space-y-4 text-sm">
            <label className="flex items-center justify-between gap-3">
              Satellite-style map
              <input type="checkbox" checked={satellite} onChange={() => setSatellite((value) => !value)} />
            </label>
            <label className="flex items-center justify-between gap-3">
              Cluster nearby parcels
              <input type="checkbox" checked={clustered} onChange={() => setClustered((value) => !value)} />
            </label>
            <label className="flex items-center justify-between gap-3">
              Verified only
              <input type="checkbox" checked={verifiedOnly} onChange={() => setVerifiedOnly((value) => !value)} />
            </label>

            <div>
              <p className="mb-2 text-slate-600 dark:text-slate-300">Search mode</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setDrawMode("polygon")} className={`rounded-lg border px-3 py-2 ${drawMode === "polygon" ? "border-blue-500 text-blue-600" : "border-slate-300 dark:border-slate-600"}`}>
                  Polygon
                </button>
                <button onClick={() => setDrawMode("radius")} className={`rounded-lg border px-3 py-2 ${drawMode === "radius" ? "border-blue-500 text-blue-600" : "border-slate-300 dark:border-slate-600"}`}>
                  Radius
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-slate-600 dark:text-slate-300">Listing status</p>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | "available" | "under_offer" | "sold")}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="under_offer">Under Offer</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            {drawMode === "radius" && (
              <div>
                <p className="mb-2 text-slate-600 dark:text-slate-300">Search radius: {radiusMeters} m</p>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="100"
                  value={radiusMeters}
                  onChange={(event) => setRadiusMeters(Number(event.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleSearchZone} className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> Search
              </button>
              <button onClick={clearDrawing} className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                Clear
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-600 dark:text-slate-300">
              Click the map to place search points. Right-click the map to reset the active drawing layer.
            </div>
          </div>
        </Panel>

        <div className="lg:col-span-3">
          <Panel title="Parcel Map" subtitle="Live parcel selection with zone drawing and verification overlays">
            <div className="relative">
              <div className="absolute top-3 left-3 z-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5" /> {clustered ? "Clustered markers" : "Expanded markers"}
              </div>

              <LeafletParcelMap
                parcels={visibleParcels}
                selectedParcelId={activeParcel?.id || null}
                onParcelSelect={setSelectedParcelId}
                drawMode={drawMode}
                drawingEnabled
                drawnPoints={drawnPoints}
                onDrawnPointsChange={setDrawnPoints}
                radiusCenter={radiusCenter}
                onRadiusCenterChange={setRadiusCenter}
                radiusMeters={radiusMeters}
              />
            </div>

            {activeParcel ? (
              <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">{activeParcel.name}</p>
                  <div className="space-y-1 text-slate-600 dark:text-slate-300">
                    <p>{activeParcel.location}</p>
                    <p>GPS: {activeParcel.gpsAddress}</p>
                    <p>Size: {activeParcel.size}</p>
                    <p>Price: {activeParcel.price}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <p className="font-semibold text-slate-900 dark:text-white mb-2">Verification & Search Status</p>
                  <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <p className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {activeParcel.verified ? "Verified by Lands Commission" : "Pending verification"}
                    </p>
                    <p className="capitalize">Listing status: {activeParcel.status.replace("_", " ")}</p>
                    <p>Zone results: {zoneResultCount}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-300">
                No parcels match the current filters.
              </div>
            )}

            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Route className="w-4 h-4" /> Select a parcel on the map to inspect pricing, GPS addressing, and ownership verification.
            </div>
          </Panel>
        </div>
      </div>
    </PortalShell>
  );
}
