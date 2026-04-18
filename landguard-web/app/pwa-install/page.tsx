"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, CloudOff, Download, Smartphone, Wifi } from "lucide-react";
import { Panel, PortalShell, ItemList } from "@/components/portal/PortalShell";

export default function PWAInstallPage() {
  const [installed, setInstalled] = useState(false);

  return (
    <PortalShell
      portal="Utility"
      title="Install LANDGUARD App"
      subtitle="Install as a Progressive Web App for offline access, faster launch, and background synchronization."
      navItems={[
        { label: "Home", href: "/" },
        { label: "Recovery", href: "/account-recovery" },
        { label: "Contact", href: "/contact" },
      ]}
      stats={[
        { label: "Install State", value: installed ? "Installed" : "Not Installed", icon: Smartphone },
        { label: "Offline Cache", value: "Ready", icon: CloudOff },
        { label: "Sync Queue", value: "3", icon: Wifi },
        { label: "Updates", value: "Auto", icon: CheckCircle2 },
      ]}
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Install Prompt" subtitle="One-click setup for desktop/mobile">
          <button onClick={() => setInstalled(true)} className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition flex items-center gap-2"><Download className="w-4 h-4" />Install now</button>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">After installation, LANDGUARD opens in standalone mode with faster load and offline listing cache.</p>
        </Panel>

        <Panel title="Offline Sync Status" subtitle="Background reliability controls">
          <ItemList items={["Pending sync: 3 records", "Last sync: 2 minutes ago", "Connectivity fallback active"]} />
          <Link href="/buyer/map" className="mt-4 inline-flex text-sm text-blue-600 dark:text-blue-400">Open map explorer in PWA mode</Link>
        </Panel>
      </div>
    </PortalShell>
  );
}
