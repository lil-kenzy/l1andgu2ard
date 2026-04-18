"use client";

import { useState } from "react";
import { Download, Lock, Shield, User, Trash2 } from "lucide-react";
import { Panel, PortalShell, ItemList } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

export default function BuyerProfilePage() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  return (
    <PortalShell
      portal="Buyer Portal"
      title="Profile Settings"
      subtitle="Manage personal information, security controls, privacy settings, and account data rights."
      navItems={navItems}
      stats={[
        { label: "Profile Completion", value: "92%", icon: User },
        { label: "2FA Status", value: twoFactor ? "On" : "Off", icon: Shield },
        { label: "Privacy Mode", value: privacyMode ? "High" : "Standard", icon: Lock },
        { label: "Exports", value: "2", icon: Download },
      ]}
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Personal Information" subtitle="Identity and contact details">
          <div className="grid gap-3 text-sm">
            <input defaultValue="John Doe" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
            <input defaultValue="john@landguard.app" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
            <input defaultValue="+233 24 123 4567" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
            <button className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition">Save changes</button>
          </div>
        </Panel>

        <Panel title="Security & Privacy" subtitle="2FA, data controls and account protection">
          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between">Enable 2FA <input type="checkbox" checked={twoFactor} onChange={() => setTwoFactor((v) => !v)} /></label>
            <label className="flex items-center justify-between">High privacy mode <input type="checkbox" checked={privacyMode} onChange={() => setPrivacyMode((v) => !v)} /></label>
            <ItemList items={["Trusted devices management", "Session history and remote sign-out", "Suspicious login alerts"]} />
            <div className="grid sm:grid-cols-2 gap-2">
              <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><Download className="w-4 h-4" />Export my data</button>
              <button className="rounded-lg border border-red-300 text-red-700 dark:border-red-700 dark:text-red-300 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" />Delete request</button>
            </div>
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
