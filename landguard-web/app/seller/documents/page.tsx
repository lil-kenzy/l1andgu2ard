"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FileArchive, History, Loader2, RefreshCw, Share2, Upload, XCircle } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";
import { documentsAPI } from "@/lib/api/client";

const navItems = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "List Property", href: "/seller/list-property" },
  { label: "Listings", href: "/seller/listings" },
  { label: "Documents", href: "/seller/documents" },
  { label: "Inquiries", href: "/seller/inquiries" },
  { label: "Offers", href: "/seller/offers" },
  { label: "Analytics", href: "/seller/analytics" },
  { label: "Profile", href: "/seller/profile" },
];

interface DocDefinition {
  key: string;
  label: string;
  required: boolean;
  /** Typical validity in days — used to compute expiry reminders */
  validityDays?: number;
}

const MANDATORY_DOCS: DocDefinition[] = [
  { key: "land_title",      label: "Land Title Certificate / Deed of Assignment", required: true,  validityDays: 3650 },
  { key: "ghana_card",      label: "Ghana Card of Registered Owner(s)",            required: true,  validityDays: 3650 },
  { key: "consent_letter",  label: "Consent Letter (if selling inherited property)", required: false, validityDays: 365 },
  { key: "building_permit", label: "Building Permit (if structures exist)",        required: false, validityDays: 730 },
];

type UploadState = "idle" | "uploading" | "ocr" | "done" | "error";

interface DocUploadState {
  state: UploadState;
  fileName?: string;
  errorMessage?: string;
  documentId?: string;
  uploadedAt?: Date;
  expiresAt?: Date;
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
}

function expiryLabel(expiresAt: Date): { text: string; color: string } {
  const days = daysUntil(expiresAt);
  if (days < 0)  return { text: `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`, color: "text-red-600 dark:text-red-400" };
  if (days <= 30) return { text: `Expires in ${days} day${days !== 1 ? "s" : ""} — renew soon`, color: "text-amber-600 dark:text-amber-400" };
  if (days <= 90) return { text: `Expires in ${days} days`, color: "text-amber-500 dark:text-amber-300" };
  return { text: `Valid for ${days} days`, color: "text-emerald-600 dark:text-emerald-400" };
}

export default function SellerDocumentsPage() {
  const [uploads, setUploads] = useState<Record<string, DocUploadState>>(
    Object.fromEntries(MANDATORY_DOCS.map((d) => [d.key, { state: "idle" }]))
  );

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Load existing documents from backend on mount
  useEffect(() => {
    documentsAPI.getAll().then((res) => {
      const docs: Array<{ documentType: string; _id: string; fileName?: string; createdAt?: string; expiresAt?: string }> = res.data?.data ?? [];
      setUploads((prev) => {
        const next = { ...prev };
        for (const doc of docs) {
          const key = doc.documentType;
          if (key && next[key]) {
            next[key] = {
              state: "done",
              documentId: doc._id,
              fileName: doc.fileName,
              uploadedAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
              expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : undefined,
            };
          }
        }
        return next;
      });
    }).catch(() => {/* non-fatal */});
  }, []);

  const setDocState = (key: string, update: Partial<DocUploadState>) =>
    setUploads((prev) => ({ ...prev, [key]: { ...prev[key], ...update } }));

  const handleFileChange = async (docKey: string, file: File) => {
    setDocState(docKey, { state: "uploading", fileName: file.name, errorMessage: undefined });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", docKey);

    const docDef = MANDATORY_DOCS.find((d) => d.key === docKey);
    if (docDef?.validityDays) {
      const exp = new Date(Date.now() + docDef.validityDays * 86_400_000);
      formData.append("expiresAt", exp.toISOString());
    }

    try {
      const res = await documentsAPI.upload(formData);
      const docId: string = res.data?.data?._id ?? res.data?.data?.id ?? "";
      const expiresAtRaw: string | undefined = res.data?.data?.expiresAt;

      setDocState(docKey, { state: "ocr", documentId: docId });

      if (docId) documentsAPI.triggerOcr(docId).catch(() => {});

      setDocState(docKey, {
        state: "done",
        documentId: docId,
        uploadedAt: new Date(),
        expiresAt: expiresAtRaw ? new Date(expiresAtRaw) : undefined,
      });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setDocState(docKey, {
        state: "error",
        errorMessage: axiosErr?.response?.data?.message ?? "Upload failed. Please try again.",
      });
    }
  };

  const docStateIcon = (s: UploadState) => {
    if (s === "uploading" || s === "ocr") return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    if (s === "done") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (s === "error") return <XCircle className="w-4 h-4 text-red-600" />;
    return null;
  };

  const doneCount = Object.values(uploads).filter((u) => u.state === "done").length;
  const requiredDone = MANDATORY_DOCS.filter((d) => d.required).every((d) => uploads[d.key]?.state === "done");

  // Compute expiry alerts
  const expiryAlerts = MANDATORY_DOCS.filter((d) => {
    const up = uploads[d.key];
    if (up?.state !== "done" || !up.expiresAt) return false;
    return daysUntil(up.expiresAt) <= 90;
  });

  return (
    <PortalShell
      portal="Seller Portal"
      title="Document Vault"
      subtitle="Encrypted storage for listing documents with expiry tracking, OCR search, version history, and share links."
      navItems={navItems}
      stats={[
        { label: "Uploaded", value: String(doneCount), icon: FileArchive },
        { label: "Mandatory Done", value: requiredDone ? "✓ Yes" : "No", icon: CheckCircle2 },
        { label: "Expiry Alerts", value: String(expiryAlerts.length), icon: AlertTriangle },
        { label: "Shared Links", value: "—", icon: Share2 },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Expiry Reminders Banner */}
          {expiryAlerts.length > 0 && (
            <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  {expiryAlerts.length} document{expiryAlerts.length !== 1 ? "s" : ""} expiring soon — re-upload to stay compliant
                </span>
              </div>
              <ul className="space-y-1">
                {expiryAlerts.map((d) => {
                  const up = uploads[d.key];
                  const label = up?.expiresAt ? expiryLabel(up.expiresAt) : null;
                  return (
                    <li key={d.key} className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
                      <span>{d.label}</span>
                      <button
                        onClick={() => fileInputRefs.current[d.key]?.click()}
                        className="flex items-center gap-1 rounded border border-amber-400 dark:border-amber-600 px-2 py-0.5 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
                      >
                        <RefreshCw className="w-3 h-3" />
                        {label && daysUntil(up!.expiresAt!) < 0 ? "Re-upload (Expired)" : "Re-upload"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <Panel title="Mandatory Documents" subtitle="Upload before listing any property. Files are encrypted (AES-256) and OCR-processed.">
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {MANDATORY_DOCS.map((doc) => {
                const up = uploads[doc.key];
                const expiry = up?.expiresAt ? expiryLabel(up.expiresAt) : null;
                const isExpired = up?.expiresAt ? daysUntil(up.expiresAt) < 0 : false;
                return (
                  <div key={doc.key} className="py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="mt-0.5 text-lg">📄</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {doc.required ? "" : <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional) </span>}
                          {doc.label}
                        </p>
                        {up.fileName && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">{up.fileName}</p>
                        )}
                        {up.state === "error" && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{up.errorMessage}</p>
                        )}
                        {up.state === "ocr" && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Running OCR extraction…</p>
                        )}
                        {up.state === "done" && !isExpired && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded &amp; queued for Lands Commission review
                          </p>
                        )}
                        {isExpired && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Document expired — re-upload required
                          </p>
                        )}
                        {expiry && !isExpired && (
                          <p className={`text-xs mt-0.5 flex items-center gap-1 ${expiry.color}`}>
                            <Clock3 className="w-3 h-3" /> {expiry.text}
                          </p>
                        )}
                        {up.uploadedAt && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            Uploaded {up.uploadedAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {docStateIcon(up.state)}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[doc.key] = el; }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileChange(doc.key, f);
                        }}
                      />
                      <button
                        onClick={() => fileInputRefs.current[doc.key]?.click()}
                        disabled={up.state === "uploading" || up.state === "ocr"}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50 transition ${isExpired ? "border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" : "border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                      >
                        {isExpired ? <RefreshCw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                        {isExpired ? "Re-upload" : up.state === "done" ? "Replace" : "Upload"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {requiredDone && !expiryAlerts.some((d) => MANDATORY_DOCS.find((m) => m.key === d.key && m.required)) && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-sm text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                All mandatory documents uploaded. Lands Commission review in progress (72-hour SLA).
              </div>
            )}

            <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300">
              <strong>Verification Workflow:</strong> Upload → Encrypted Storage → OCR &amp; Metadata Extraction → Admin Panel → Lands Commission Officer Review (72hr) → Status: Pending → Verified / Rejected
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <Panel title="Accepted Formats" subtitle="">
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>• PDF — preferred for title deeds</li>
              <li>• JPEG / PNG — scanned documents</li>
              <li>• Max 20 MB per file</li>
              <li>• All files encrypted with AES-256</li>
            </ul>
          </Panel>

          <Panel title="Required Before Listing" subtitle="">
            <ul className="text-xs space-y-2">
              {MANDATORY_DOCS.filter((d) => d.required).map((d) => {
                const up = uploads[d.key];
                const isExpired = up?.expiresAt ? daysUntil(up.expiresAt) < 0 : false;
                return (
                  <li key={d.key} className="flex items-center gap-1.5">
                    {up?.state === "done" && !isExpired ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : isExpired ? (
                      <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    ) : (
                      <Clock3 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <span className={`${isExpired ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}>{d.label}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Expiry Schedule" subtitle="Upcoming renewals">
            <ul className="text-xs space-y-2">
              {MANDATORY_DOCS.map((d) => {
                const up = uploads[d.key];
                if (up?.state !== "done" || !up.expiresAt) return null;
                const label = expiryLabel(up.expiresAt);
                return (
                  <li key={d.key} className="flex flex-col gap-0.5">
                    <span className="text-slate-600 dark:text-slate-400 font-medium truncate">{d.label.split(" /")[0]}</span>
                    <span className={`${label.color}`}>{label.text}</span>
                  </li>
                );
              })}
              {MANDATORY_DOCS.every((d) => !uploads[d.key]?.expiresAt) && (
                <li className="text-slate-400 dark:text-slate-500">No expiry data yet — upload documents to track</li>
              )}
            </ul>
          </Panel>

          <Panel title="Version History" subtitle="">
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <History className="w-4 h-4 shrink-0" />
              <span>Full version history available after upload. Re-upload to create a new version.</span>
            </div>
          </Panel>
        </div>
      </div>
    </PortalShell>
  );
}
