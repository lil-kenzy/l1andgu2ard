"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Brain, FileSearch, Siren, Workflow } from "lucide-react";
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

type FraudStatus = "new" | "investigating" | "resolved" | "dismissed";

interface FraudAlert {
  _id: string;
  status: FraudStatus;
  createdAt: string;
  reportedUserId?: { personalInfo?: { fullName?: string; email?: string } };
  resolutionNotes?: string;
}

const STATUS_LABELS: Record<FraudStatus, string> = {
  new: "New",
  investigating: "Investigating",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const STATUS_COLORS: Record<FraudStatus, string> = {
  new: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  investigating: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  dismissed: "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400",
};

export default function AdminFraudPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchAlerts = () => {
    setLoading(true);
    adminAPI
      .getFraudAlerts()
      .then((res) => setAlerts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const updateStatus = async (id: string, status: FraudStatus) => {
    setActionId(id);
    try {
      await adminAPI.triageFraudAlert(id, { status });
      fetchAlerts();
    } catch {
      // continue
    } finally {
      setActionId(null);
    }
  };

  const critical = alerts.filter((a) => a.status === "new").length;
  const investigating = alerts.filter((a) => a.status === "investigating").length;

  return (
    <PortalShell
      portal="Admin Portal"
      title="Fraud Detection Center"
      subtitle="AI-driven alerts dashboard for investigation, case management, and escalation workflows."
      navItems={navItems}
      stats={[
        { label: "AI Alerts", value: loading ? "…" : String(alerts.length), icon: Brain },
        { label: "Critical (New)", value: loading ? "…" : String(critical), icon: Siren },
        { label: "Investigating", value: loading ? "…" : String(investigating), icon: FileSearch },
        { label: "Escalations", value: "—", icon: AlertTriangle },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Case Board" subtitle="Alert triage and case assignment">
            {loading ? (
              <p className="text-sm text-slate-500 py-4">Loading alerts…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 pr-4">Reported User</th>
                      <th className="py-2 pr-4">Reported</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr
                        key={alert._id}
                        className="border-b border-slate-100 dark:border-slate-700/60"
                      >
                        <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">
                          {alert.reportedUserId?.personalInfo?.fullName ||
                            alert.reportedUserId?.personalInfo?.email ||
                            "Unknown"}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[alert.status]}`}
                          >
                            {STATUS_LABELS[alert.status]}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex gap-1">
                            {alert.status === "new" && (
                              <button
                                onClick={() => updateStatus(alert._id, "investigating")}
                                disabled={actionId === alert._id}
                                className="text-xs px-2 py-1 rounded border border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50 transition"
                              >
                                Investigate
                              </button>
                            )}
                            {alert.status === "investigating" && (
                              <>
                                <button
                                  onClick={() => updateStatus(alert._id, "resolved")}
                                  disabled={actionId === alert._id}
                                  className="text-xs px-2 py-1 rounded border border-emerald-400 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 transition"
                                >
                                  Resolve
                                </button>
                                <button
                                  onClick={() => updateStatus(alert._id, "dismissed")}
                                  disabled={actionId === alert._id}
                                  className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {alerts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 text-sm">
                          No fraud alerts.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Escalation Workflow" subtitle="From detection to enforcement">
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {[
              "Automated severity scoring",
              "Officer assignment and deadlines",
              "Evidence package export for legal action",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 text-sm rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Workflow className="w-4 h-4 mt-0.5" /> AI confidence updates as evidence is added.
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}

