"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Clock3, FileArchive, History, Loader2, Share2, Upload, XCircle } from "lucide-react";
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
}

const MANDATORY_DOCS: DocDefinition[] = [
  { key: "land_title",      label: "Land Title Certificate / Deed of Assignment", required: true },
  { key: "ghana_card",      label: "Ghana Card of Registered Owner(s)",            required: true },
  { key: "consent_letter",  label: "Consent Letter (if selling inherited property)", required: false },
  { key: "building_permit", label: "Building Permit (if structures exist)",        required: false },
];

type UploadState = "idle" | "uploading" | "ocr" | "done" | "error";

interface DocUploadState {
  state: UploadState;
  fileName?: string;
  errorMessage?: string;
  documentId?: string;
}

export default function SellerDocumentsPage() {
  const [uploads, setUploads] = useState<Record<string, DocUploadState>>(
    Object.fromEntries(MANDATORY_DOCS.map((d) => [d.key, { state: "idle" }]))
  );

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const setDocState = (key: string, update: Partial<DocUploadState>) =>
    setUploads((prev) => ({ ...prev, [key]: { ...prev[key], ...update } }));

  const handleFileChange = async (docKey: string, file: File) => {
    setDocState(docKey, { state: "uploading", fileName: file.name, errorMessage: undefined });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", docKey);

    try {
      const res = await documentsAPI.upload(formData);
      const docId: string = res.data?.data?._id ?? res.data?.data?.id ?? "";

      setDocState(docKey, { state: "ocr", documentId: docId });

      // Trigger OCR async (non-blocking — backend queues it)
      if (docId) {
        documentsAPI.triggerOcr(docId).catch(() => {});
      }

      setDocState(docKey, { state: "done", documentId: docId });
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

  return (
    <PortalShell
      portal="Seller Portal"
      title="Document Vault"
      subtitle="Encrypted storage for listing documents with expiry tracking, OCR search, version history, and share links."
      navItems={navItems}
      stats={[
        { label: "Uploaded", value: String(doneCount), icon: FileArchive },
        { label: "Mandatory Done", value: requiredDone ? "✓ Yes" : "No", icon: CheckCircle2 },
        { label: "Version Entries", value: "—", icon: History },
        { label: "Shared Links", value: "—", icon: Share2 },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Mandatory Documents" subtitle="Upload before listing any property. Files are encrypted (AES-256) and OCR-processed.">
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {MANDATORY_DOCS.map((doc) => {
                const up = uploads[doc.key];
                return (
                  <div key={doc.key} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="mt-0.5 text-lg">📄</span>
                      <div>
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
                        {up.state === "done" && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Uploaded &amp; queued for Lands Commission review
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
                        className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {up.state === "done" ? "Replace" : "Upload"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {requiredDone && (
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
              {MANDATORY_DOCS.filter((d) => d.required).map((d) => (
                <li key={d.key} className="flex items-center gap-1.5">
                  {uploads[d.key]?.state === "done" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock3 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span className="text-slate-700 dark:text-slate-300">{d.label}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </PortalShell>
  );
}
