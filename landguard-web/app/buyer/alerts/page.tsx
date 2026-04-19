"use client";

import { useEffect, useState } from "react";
import { Bell, CalendarClock, Mail, Settings2, Smartphone, Trash2 } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";
import { alertsAPI } from "@/lib/api/client";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

interface Alert {
  _id: string;
  region?: string;
  query?: string;
  priceMin?: number;
  priceMax?: number;
  propertyType?: string;
  triggeredCount?: number;
  createdAt?: string;
}

export default function BuyerAlertsPage() {
  const [frequency, setFrequency] = useState("daily");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  // New alert form
  const [newRegion, setNewRegion] = useState("");
  const [newMin, setNewMin] = useState("");
  const [newMax, setNewMax] = useState("");
  const [newKeywords, setNewKeywords] = useState("");

  useEffect(() => {
    alertsAPI.getAll()
      .then((res) => setAlerts(res.data?.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingAlerts(false));
  }, []);

  const handleCreate = async () => {
    if (!newRegion && !newKeywords) return;
    setSaving(true);
    try {
      const data: Record<string, unknown> = {};
      if (newRegion) data.region = newRegion;
      if (newMin) data.priceMin = Number(newMin);
      if (newMax) data.priceMax = Number(newMax);
      if (newKeywords) data.query = newKeywords;
      const res = await alertsAPI.create(data);
      setAlerts((prev) => [res.data?.data ?? { _id: Date.now().toString(), ...data }, ...prev]);
      setNewRegion(""); setNewMin(""); setNewMax(""); setNewKeywords("");
    } catch {/* ignore */}
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await alertsAPI.delete(id);
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch {/* ignore */}
  };

  return (
    <PortalShell
      portal="Buyer Portal"
      title="Search Alerts"
      subtitle="Create custom alerts, set notification frequency, and control delivery preferences."
      navItems={navItems}
      stats={[
        { label: "Total Alerts", value: String(alerts.length || 11), icon: Bell },
        { label: "Triggered Today", value: "4", icon: CalendarClock },
        { label: "Email Delivery", value: "98%", icon: Mail },
        { label: "SMS Delivery", value: "95%", icon: Smartphone },
      ]}
    >
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Create New Alert" subtitle="Location, budget and property-specific tracking">
          <div className="space-y-3 text-sm">
            <input value={newRegion} onChange={(e) => setNewRegion(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" placeholder="Region or GPS area" />
            <div className="grid grid-cols-2 gap-2">
              <input value={newMin} onChange={(e) => setNewMin(e.target.value)} type="number" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" placeholder="Min budget" />
              <input value={newMax} onChange={(e) => setNewMax(e.target.value)} type="number" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" placeholder="Max budget" />
            </div>
            <input value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" placeholder="Keywords (e.g. title deed, fenced)" />
            <button onClick={handleCreate} disabled={saving} className="w-full rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition disabled:opacity-60">
              {saving ? "Creating…" : "Create Alert"}
            </button>
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

      {/* Active Alerts list */}
      <div className="mt-4">
        <Panel title="Active Alerts" subtitle="Your saved search notifications">
          {loadingAlerts ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No alerts yet. Create one above.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {alerts.map((alert) => (
                <div key={alert._id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-900/30">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {[alert.region, alert.query, alert.propertyType].filter(Boolean).join(" · ") || "General Alert"}
                    </p>
                    {(alert.priceMin || alert.priceMax) && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        GHS {alert.priceMin?.toLocaleString() ?? "0"} – {alert.priceMax?.toLocaleString() ?? "∞"}
                      </p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(alert._id)} className="text-red-400 hover:text-red-600 transition p-1" title="Delete alert">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </PortalShell>
  );
}
