"use client";

import { useEffect, useState } from "react";
import { Building2, CheckCircle2, Gavel, Loader2, Save, ShieldCheck, Wrench, XCircle } from "lucide-react";
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

interface IntegrationField {
  key: string;
  label: string;
  placeholder: string;
  sensitive?: boolean;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  fields: IntegrationField[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: "ghana_interbank",
    name: "Ghana Interbank Payment System (GhIPSS)",
    description: "Escrow and payment confirmation webhooks for land transaction settlement.",
    icon: Building2,
    category: "Banks",
    fields: [
      { key: "ghipss_api_url", label: "API Base URL", placeholder: "https://api.ghipss.net/v1" },
      { key: "ghipss_api_key", label: "API Key", placeholder: "ghipss_live_…", sensitive: true },
      { key: "ghipss_webhook_secret", label: "Webhook Secret", placeholder: "whsec_…", sensitive: true },
    ],
  },
  {
    id: "gcb_bank",
    name: "GCB Bank API",
    description: "Secure payment gateway for buyer escrow deposits.",
    icon: Building2,
    category: "Banks",
    fields: [
      { key: "gcb_api_url", label: "API Base URL", placeholder: "https://api.gcbbank.com.gh/v2" },
      { key: "gcb_client_id", label: "Client ID", placeholder: "gcb_client_…" },
      { key: "gcb_client_secret", label: "Client Secret", placeholder: "gcb_secret_…", sensitive: true },
    ],
  },
  {
    id: "gsg_surveyors",
    name: "Ghana Survey & Mapping Division (SNRMD)",
    description: "Coordinate survey data imports, boundary approvals, and parcel updates.",
    icon: Wrench,
    category: "Surveyors",
    fields: [
      { key: "snrmd_api_url", label: "Survey API URL", placeholder: "https://survey.lands.gov.gh/api" },
      { key: "snrmd_api_key", label: "API Key", placeholder: "snrmd_key_…", sensitive: true },
    ],
  },
  {
    id: "courts",
    name: "Ghana Judicial Service API",
    description: "Dispute escalation webhooks, court order lookups, and injunction notifications.",
    icon: Gavel,
    category: "Courts",
    fields: [
      { key: "judiciary_api_url", label: "Judicial API URL", placeholder: "https://judicial.gov.gh/api/v1" },
      { key: "judiciary_api_key", label: "API Key", placeholder: "jud_key_…", sensitive: true },
      { key: "judiciary_webhook_url", label: "Inbound Webhook URL", placeholder: "https://api.landguard.app/webhooks/court" },
    ],
  },
  {
    id: "lands_commission",
    name: "Lands Commission (LC) — Ghana",
    description: "Cross-check title registrations, deed lookups, and ownership verification.",
    icon: ShieldCheck,
    category: "Registry",
    fields: [
      { key: "lc_api_url", label: "Registry API URL", placeholder: "https://registry.lands.gov.gh/api" },
      { key: "lc_api_key", label: "API Key", placeholder: "lc_key_…", sensitive: true },
    ],
  },
];

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function AdminGatewayPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({});
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    adminAPI.getSettings()
      .then((res) => {
        const map: Record<string, string> = {};
        for (const s of (res.data?.data ?? [])) {
          map[s.key] = s.value;
        }
        setValues(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setValue = (key: string, val: string) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const saveField = async (key: string, value: string) => {
    setSaveStatus((prev) => ({ ...prev, [key]: "saving" }));
    try {
      await adminAPI.saveSetting({ key, value: value.trim() });
      setSaveStatus((prev) => ({ ...prev, [key]: "saved" }));
      setTimeout(() => setSaveStatus((prev) => ({ ...prev, [key]: "idle" })), 2000);
    } catch {
      setSaveStatus((prev) => ({ ...prev, [key]: "error" }));
      setTimeout(() => setSaveStatus((prev) => ({ ...prev, [key]: "idle" })), 3000);
    }
  };

  const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];

  const inputCls = "flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono";
  const labelCls = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";

  return (
    <PortalShell
      portal="Admin Portal"
      title="API Gateway"
      subtitle="Manage third-party integrations: banks, licensed surveyors, judicial courts, and the Ghana Lands Commission."
      navItems={navItems}
      stats={[
        { label: "Integrations", value: String(INTEGRATIONS.length), icon: ShieldCheck },
        { label: "Banks", value: String(INTEGRATIONS.filter((i) => i.category === "Banks").length), icon: Building2 },
        { label: "Courts", value: String(INTEGRATIONS.filter((i) => i.category === "Courts").length), icon: Gavel },
        { label: "Surveyors", value: String(INTEGRATIONS.filter((i) => i.category === "Surveyors").length), icon: Wrench },
      ]}
    >
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <div key={cat}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">{cat}</h2>
              <div className="grid lg:grid-cols-2 gap-4">
                {INTEGRATIONS.filter((i) => i.category === cat).map((intg) => (
                  <Panel key={intg.id} title={intg.name} subtitle={intg.description}>
                    <div className="flex items-center gap-2 mb-4">
                      <intg.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {intg.category}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {intg.fields.map((field) => {
                        const status = saveStatus[field.key] ?? "idle";
                        const revealed = showSensitive[field.key];
                        return (
                          <div key={field.key}>
                            <label className={labelCls}>{field.label}</label>
                            <div className="flex items-center gap-2">
                              <input
                                type={field.sensitive && !revealed ? "password" : "text"}
                                className={inputCls}
                                placeholder={field.placeholder}
                                value={values[field.key] ?? ""}
                                onChange={(e) => setValue(field.key, e.target.value)}
                              />
                              {field.sensitive && (
                                <button
                                  type="button"
                                  onClick={() => setShowSensitive((p) => ({ ...p, [field.key]: !p[field.key] }))}
                                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0 px-1"
                                  title={revealed ? "Hide" : "Show"}
                                >
                                  {revealed ? "Hide" : "Show"}
                                </button>
                              )}
                              <button
                                onClick={() => saveField(field.key, values[field.key] ?? "")}
                                disabled={status === "saving"}
                                title="Save"
                                className="shrink-0 rounded-lg bg-blue-600 text-white px-3 py-2 hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-1"
                              >
                                {status === "saving" ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : status === "saved" ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                ) : status === "error" ? (
                                  <XCircle className="w-3.5 h-3.5 text-red-300" />
                                ) : (
                                  <Save className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {status === "saved" && (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Saved</p>
                            )}
                            {status === "error" && (
                              <p className="text-xs text-red-500 mt-0.5">Save failed — please retry</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm text-amber-800 dark:text-amber-300">
            <strong>Security notice:</strong> All credentials are stored encrypted via the settings API. Rotate keys immediately if a breach is suspected. API calls to external services use HTTPS only.
          </div>
        </div>
      )}
    </PortalShell>
  );
}
