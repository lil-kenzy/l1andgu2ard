"use client";

import { useEffect, useState } from "react";
import { CalendarDays, FilePlus2, Gavel, Scale, ShieldQuestion } from "lucide-react";
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

interface Dispute {
  _id: string;
  status: string;
  createdAt: string;
  complainantId?: { personalInfo?: { fullName?: string } };
  respondentId?: { personalInfo?: { fullName?: string } };
  propertyId?: { title?: string };
  resolutionNotes?: string;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState<Record<string, string>>({});

  const fetchDisputes = () => {
    setLoading(true);
    adminAPI
      .getDisputes()
      .then((res) => setDisputes(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const resolveDispute = async (id: string) => {
    setResolving(id);
    try {
      await adminAPI.resolveDispute(id, {
        status: "resolved",
        resolution: resolutionText[id] || "Resolved by admin",
      });
      fetchDisputes();
    } catch {
      // continue
    } finally {
      setResolving(null);
    }
  };

  const open = disputes.filter((d) => d.status === "open" || d.status === "escalated").length;
  const escalated = disputes.filter((d) => d.status === "escalated").length;

  return (
    <PortalShell
      portal="Admin Portal"
      title="Dispute Resolution Module"
      subtitle="Case registry with evidence management, hearing schedules, and decision logging."
      navItems={navItems}
      stats={[
        { label: "Open Cases", value: loading ? "…" : String(open), icon: Scale },
        { label: "Hearings", value: "—", icon: CalendarDays },
        { label: "Escalated", value: loading ? "…" : String(escalated), icon: ShieldQuestion },
        { label: "Evidence Files", value: "—", icon: FilePlus2 },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Case Registry" subtitle="Status and resolution">
            {loading ? (
              <p className="text-sm text-slate-500 py-4">Loading disputes…</p>
            ) : (
              <div className="space-y-3">
                {disputes.map((d) => (
                  <div
                    key={d._id}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {d.propertyId?.title || "Property dispute"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {d.complainantId?.personalInfo?.fullName || "?"} vs{" "}
                          {d.respondentId?.personalInfo?.fullName || "?"} ·{" "}
                          {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          d.status === "escalated"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : d.status === "resolved"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                    {d.status !== "resolved" && (
                      <div className="flex gap-2 mt-2">
                        <input
                          value={resolutionText[d._id] || ""}
                          onChange={(e) =>
                            setResolutionText((prev) => ({
                              ...prev,
                              [d._id]: e.target.value,
                            }))
                          }
                          placeholder="Resolution notes…"
                          className="flex-1 text-xs rounded border border-slate-300 dark:border-slate-600 px-2 py-1.5 bg-transparent text-slate-900 dark:text-white"
                        />
                        <button
                          onClick={() => resolveDispute(d._id)}
                          disabled={resolving === d._id}
                          className="text-xs px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                        >
                          {resolving === d._id ? "…" : "Resolve"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {disputes.length === 0 && (
                  <p className="text-sm text-center text-slate-400 py-6">No disputes found.</p>
                )}
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Decision Workflow" subtitle="Legal and administrative outcomes">
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {[
              "Upload and sign hearing outcomes",
              "Record binding administrative decisions",
              "Notify all stakeholders with audit trail",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 text-sm rounded-lg border border-slate-300 dark:border-slate-600 p-3 flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <Gavel className="w-4 h-4 mt-0.5" /> Decision records are immutable once finalized.
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}

