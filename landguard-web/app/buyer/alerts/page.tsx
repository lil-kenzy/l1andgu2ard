"use client";

import { useState } from "react";
import { Bell, CalendarClock, Mail, Settings2, Smartphone } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

export default function BuyerAlertsPage() {
  const [frequency, setFrequency] = useState("daily");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);

  return (
    <PortalShell
      portal="Buyer Portal"
      title="Search Alerts"
      subtitle="Create custom alerts, set notification frequency, and control delivery preferences."
      navItems={navItems}
      stats={[
        { label: "Total Alerts", value: "11", icon: Bell },
        { label: "Triggered Today", value: "4", icon: CalendarClock },
        { label: "Email Delivery", value: "98%", icon: Mail },
        { label: "SMS Delivery", value: "95%", icon: Smartphone },
      ]}
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Create New Alert" subtitle="Location, budget and property-specific tracking">
          <div className="space-y-3 text-sm">
            <input className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" placeholder="Region or GPS area" />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" placeholder="Min budget" />
              <input className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" placeholder="Max budget" />
            </div>
            <input className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" placeholder="Keywords (e.g. title deed, fenced)" />
            <button className="w-full rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition">Create Alert</button>
          </div>
        </Panel>

        <Panel title="Notification Preferences" subtitle="Choose how and when alerts arrive">
          <div className="space-y-3 text-sm">
            <label className="block">
              Frequency
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2">
                <option value="instant">Instant</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly summary</option>
              </select>
            </label>
            <label className="flex items-center justify-between">Email notifications <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif((v) => !v)} /></label>
            <label className="flex items-center justify-between">SMS notifications <input type="checkbox" checked={smsNotif} onChange={() => setSmsNotif((v) => !v)} /></label>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900/30 p-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-start gap-2">
              <Settings2 className="w-4 h-4 mt-0.5" />
              Current mode: {frequency}. You can pause all alerts during travel or negotiations.
            </div>
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
