"use client";

import { useState } from "react";
import { Camera, DownloadCloud, Fingerprint, LocateFixed, Signal, WifiOff } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/surveyor/dashboard" },
  { label: "Field Entry", href: "/surveyor/field-entry" },
];

export default function SurveyorFieldEntryPage() {
  const [offlineMode, setOfflineMode] = useState(true);

  return (
    <PortalShell
      portal="Surveyor Portal"
      title="Field Data Entry"
      subtitle="Offline-first field interface for precision GPS capture, geotagged evidence, and digital signatures."
      navItems={navItems}
      stats={[
        { label: "Offline Cache", value: "Ready", icon: WifiOff },
        { label: "GPS Precision", value: "±0.8m", icon: LocateFixed },
        { label: "Photos Tagged", value: "16", icon: Camera },
        { label: "Pending Sync", value: "4", icon: Signal },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Capture Workspace" subtitle="Survey points and evidence entry">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <input placeholder="Parcel ID" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
              <input placeholder="Coordinate set" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
              <textarea placeholder="Field observations" className="sm:col-span-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2 min-h-28" />
            </div>
          </Panel>
        </div>

        <Panel title="Field Controls" subtitle="Offline and signature options">
          <label className="flex items-center justify-between text-sm mb-3">Offline mode <input type="checkbox" checked={offlineMode} onChange={() => setOfflineMode((v) => !v)} /></label>
          <ItemList items={["High-precision GPS capture mode", "Geotagged media metadata", "Digital witness signature support"]} />
          <div className="mt-4 grid gap-2 text-sm">
            <button className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition flex items-center justify-center gap-2"><Fingerprint className="w-4 h-4" />Collect signature</button>
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><DownloadCloud className="w-4 h-4" />Sync to cloud</button>
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
