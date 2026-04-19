"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, FileText, ScanSearch, Workflow, XCircle } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";
import { adminAPI, propertiesAPI } from "@/lib/api/client";

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

interface Property {
  _id: string;
  title: string;
  verificationStatus: string;
  seller?: { personalInfo?: { fullName?: string; email?: string } };
  location?: { region?: string; district?: string; address?: string };
  serialNumber?: string;
  parcelNumber?: string;
  description?: string;
}

type DecisionStatus = "idle" | "loading" | "approved" | "rejected" | "error";

export default function AdminVerifyPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = use(params);

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState("");
  const [decision, setDecision] = useState<DecisionStatus>("idle");

  useEffect(() => {
    propertiesAPI
      .getById(applicationId)
      .then((res) => setProperty(res.data.data || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [applicationId]);

  const handleDecision = async (approved: boolean) => {
    if (!approved && !notes.trim()) {
      setNotesError("A reason note is required when rejecting.");
      return;
    }
    setNotesError("");
    setDecision("loading");
    try {
      await adminAPI.verifyProperty(applicationId, { verified: approved, notes });
      setDecision(approved ? "approved" : "rejected");
      // Refresh property to show updated status
      const res = await propertiesAPI.getById(applicationId);
      setProperty(res.data.data || res.data);
    } catch {
      setDecision("error");
    }
  };

  const alreadyDecided =
    property?.verificationStatus === "verified" ||
    property?.verificationStatus === "rejected";

  return (
    <PortalShell
      portal="Admin Portal"
      title={`Document Review #${applicationId}`}
      subtitle="Split-screen review interface with OCR auto-fill, registry cross-checks, and approval workflow actions."
      navItems={navItems}
    >
      <div className="grid xl:grid-cols-2 gap-4">
        <Panel title="Property Details" subtitle="Application information">
          {loading ? (
            <p className="text-sm text-slate-500 py-4">Loading property…</p>
          ) : property ? (
            <div className="space-y-3 text-sm">
              <div className="h-[200px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center gap-2 text-slate-500">
                <FileText className="w-5 h-5" /> Document preview
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                <dt className="text-slate-500">Title</dt>
                <dd className="text-slate-800 dark:text-slate-200 font-medium">
                  {property.title}
                </dd>
                <dt className="text-slate-500">Seller</dt>
                <dd className="text-slate-800 dark:text-slate-200">
                  {property.seller?.personalInfo?.fullName || "—"}
                </dd>
                <dt className="text-slate-500">Serial No.</dt>
                <dd className="text-slate-800 dark:text-slate-200">
                  {property.serialNumber || "—"}
                </dd>
                <dt className="text-slate-500">Parcel No.</dt>
                <dd className="text-slate-800 dark:text-slate-200">
                  {property.parcelNumber || "—"}
                </dd>
                <dt className="text-slate-500">Region</dt>
                <dd className="text-slate-800 dark:text-slate-200">
                  {property.location?.region || property.location?.district || "—"}
                </dd>
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      property.verificationStatus === "verified"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : property.verificationStatus === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}
                  >
                    {property.verificationStatus}
                  </span>
                </dd>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-4">Property not found.</p>
          )}
        </Panel>

        <Panel title="Verification Workspace" subtitle="OCR and workflow tools">
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 mb-4">
            {[
              "OCR extracted owner name, parcel ID, filing date",
              "Cross-check against land registry and fraud index",
              "Conflict alert and duplicate claim detection",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                {item}
              </li>
            ))}
          </ul>

          <textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); if (notesError) setNotesError(""); }}
            placeholder="Decision notes (required for rejection)…"
            rows={3}
            disabled={alreadyDecided}
            className="w-full mb-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white resize-none disabled:opacity-50"
          />
          {notesError && <p className="text-xs text-red-600 dark:text-red-400 mb-2">{notesError}</p>}

          {decision === "approved" && (
            <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              ✓ Property approved successfully.
            </p>
          )}
          {decision === "rejected" && (
            <p className="mb-3 text-sm text-red-600 dark:text-red-400 font-medium">
              ✗ Property rejected.
            </p>
          )}
          {decision === "error" && (
            <p className="mb-3 text-sm text-red-500">Action failed. Please try again.</p>
          )}

          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2">
              <ScanSearch className="w-4 h-4" />
              Run cross-check
            </button>
            <button
              onClick={() => handleDecision(true)}
              disabled={decision === "loading" || alreadyDecided || !property}
              className="rounded-lg bg-emerald-600 text-white py-2 hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {decision === "loading" ? "…" : "Approve"}
            </button>
            <button
              onClick={() => handleDecision(false)}
              disabled={decision === "loading" || alreadyDecided || !property}
              className="rounded-lg bg-red-600 text-white py-2 hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              {decision === "loading" ? "…" : "Reject"}
            </button>
          </div>

          <div className="mt-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
            <Workflow className="w-4 h-4 mt-0.5" />
            Decision logs are automatically captured in audit history with reviewer signature.
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}

