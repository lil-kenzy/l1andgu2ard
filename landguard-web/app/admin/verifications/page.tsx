"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, ListChecks, TimerReset, UserCheck, XCircle } from "lucide-react";
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

interface PendingProperty {
  _id: string;
  title: string;
  seller?: { personalInfo?: { fullName?: string } };
  createdAt: string;
  verificationStatus: string;
}

type BulkModal = "approve" | "reject" | null;

export default function AdminVerificationsPage() {
  const [properties, setProperties] = useState<PendingProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkModal, setBulkModal] = useState<BulkModal>(null);
  const [bulkNotes, setBulkNotes] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");

  const fetchProperties = () => {
    setLoading(true);
    adminAPI
      .getPendingProperties()
      .then((res) => setProperties(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === properties.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(properties.map((p) => p._id)));
    }
  };

  const openBulkModal = (action: BulkModal) => {
    setBulkNotes("");
    setBulkError("");
    setBulkModal(action);
  };

  const handleBulkAction = async () => {
    if (!bulkModal) return;
    const verified = bulkModal === "approve";
    if (!verified && !bulkNotes.trim()) {
      setBulkError("A reason note is required when rejecting.");
      return;
    }
    setBulkLoading(true);
    setBulkError("");
    try {
      await adminAPI.bulkVerify({ ids: Array.from(selected), verified, notes: bulkNotes.trim() || undefined });
      setBulkModal(null);
      setSelected(new Set());
      fetchProperties();
    } catch {
      setBulkError("Action failed. Please try again.");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <PortalShell
      portal="Admin Portal"
      title="Verification Queue"
      subtitle="Process applications with SLA tracking, bulk assignment, and workload balancing analytics."
      navItems={navItems}
      stats={[
        { label: "Queue Size", value: loading ? "…" : String(properties.length), icon: ListChecks },
        { label: "Avg SLA", value: "14h", icon: Clock3 },
        { label: "Assigned Today", value: "—", icon: UserCheck },
        { label: "SLA Breaches", value: "—", icon: TimerReset },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Pending Applications" subtitle="Properties awaiting verification">
            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-2">
                <span className="text-sm text-blue-700 dark:text-blue-300 flex-1">
                  {selected.size} selected
                </span>
                <button
                  onClick={() => openBulkModal("approve")}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve All
                </button>
                <button
                  onClick={() => openBulkModal("reject")}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject All
                </button>
              </div>
            )}

            {loading ? (
              <p className="text-sm text-slate-500 py-4">Loading queue…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 pr-3">
                        <input
                          type="checkbox"
                          checked={properties.length > 0 && selected.size === properties.length}
                          onChange={toggleAll}
                          className="rounded"
                        />
                      </th>
                      <th className="py-2 pr-4">Title</th>
                      <th className="py-2 pr-4">Seller</th>
                      <th className="py-2 pr-4">Submitted</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr
                        key={p._id}
                        className={`border-b border-slate-100 dark:border-slate-700/60 ${selected.has(p._id) ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
                      >
                        <td className="py-2.5 pr-3">
                          <input
                            type="checkbox"
                            checked={selected.has(p._id)}
                            onChange={() => toggleSelect(p._id)}
                            className="rounded"
                          />
                        </td>
                        <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">
                          {p.title}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">
                          {p.seller?.personalInfo?.fullName || "—"}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5">
                          <Link
                            href={`/admin/verify/${p._id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {properties.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400 text-sm">
                          No pending applications.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Queue Controls" subtitle="Assignment and balancing">
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {[
              "Bulk assign by region",
              "Re-prioritize with fraud score",
              "Distribute by officer workload",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Bulk action modal */}
      {bulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
              {bulkModal === "approve" ? "Bulk Approve" : "Bulk Reject"} — {selected.size} application{selected.size !== 1 ? "s" : ""}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {bulkModal === "reject"
                ? "A reason note is required. It will be sent to all affected sellers."
                : "Optional notes will be included in the approval notification."}
            </p>
            <textarea
              value={bulkNotes}
              onChange={(e) => setBulkNotes(e.target.value)}
              placeholder={bulkModal === "reject" ? "Reason for rejection (required)…" : "Decision notes (optional)…"}
              rows={3}
              className="w-full mb-2 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white resize-none"
            />
            {bulkError && <p className="text-xs text-red-600 dark:text-red-400 mb-3">{bulkError}</p>}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setBulkModal(null)}
                disabled={bulkLoading}
                className="px-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAction}
                disabled={bulkLoading}
                className={`px-4 py-2 text-sm rounded-lg text-white transition disabled:opacity-50 ${bulkModal === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {bulkLoading ? "Processing…" : bulkModal === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}

