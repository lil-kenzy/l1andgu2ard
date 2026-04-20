"use client";

import { useEffect, useState } from "react";
import { Flag, KeyRound, Mail, MessageSquare, Settings2 } from "lucide-react";
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

interface AppSetting {
  _id: string;
  key: string;
  value: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = () => {
    setLoading(true);
    adminAPI
      .getSettings()
      .then((res) => setSettings(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    setSaving(true);
    try {
      await adminAPI.saveSetting({ key: newKey.trim(), value: newValue.trim() });
      setNewKey("");
      setNewValue("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchSettings();
    } catch {
      // continue
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalShell
      portal="Admin Portal"
      title="System Configuration"
      subtitle="Feature flags, content settings, communication templates, and API credential governance."
      navItems={navItems}
      stats={[
        { label: "Config Keys", value: loading ? "…" : String(settings.length), icon: Flag },
        { label: "Template Sets", value: "—", icon: Mail },
        { label: "API Keys", value: "—", icon: KeyRound },
        { label: "Config Changes", value: "—", icon: Settings2 },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Configuration Keys" subtitle="Current system settings">
            {loading ? (
              <p className="text-sm text-slate-500 py-4">Loading settings…</p>
            ) : (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2 pr-6">Key</th>
                        <th className="py-2">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settings.map((s) => (
                        <tr
                          key={s._id}
                          className="border-b border-slate-100 dark:border-slate-700/60"
                        >
                          <td className="py-2.5 pr-6 font-mono text-xs text-slate-700 dark:text-slate-300">
                            {s.key}
                          </td>
                          <td className="py-2.5 text-slate-500 dark:text-slate-400 font-mono text-xs">
                            {String(s.value)}
                          </td>
                        </tr>
                      ))}
                      {settings.length === 0 && (
                        <tr>
                          <td
                            colSpan={2}
                            className="py-6 text-center text-slate-400 text-sm"
                          >
                            No settings configured yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <form onSubmit={handleSave} className="flex gap-2">
                  <input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Key"
                    required
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white font-mono"
                  />
                  <input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Value"
                    required
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {saved ? "Saved ✓" : saving ? "…" : "Save"}
                  </button>
                </form>
              </>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Template Center" subtitle="Email and SMS content settings">
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {[
                "OTP and verification templates",
                "Dispute and fraud notices",
                "Localization for Ghana regions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-sm rounded-lg border border-slate-300 dark:border-slate-600 p-3 flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <MessageSquare className="w-4 h-4" /> Preview template rendering before publishing.
            </div>
          </Panel>

          <Panel title="API Security" subtitle="Credential lifecycle management">
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {[
                "Scoped API key issuance",
                "Rotation and expiration controls",
                "Audit-linked key usage logs",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </PortalShell>
  );
}

