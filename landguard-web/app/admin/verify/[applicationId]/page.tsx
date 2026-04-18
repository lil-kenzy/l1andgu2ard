import { CheckCircle2, FileText, ScanSearch, Workflow, XCircle } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

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

export default async function AdminVerifyPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;

  return (
    <PortalShell
      portal="Admin Portal"
      title={`Document Review #${applicationId}`}
      subtitle="Split-screen review interface with OCR auto-fill, registry cross-checks, and approval workflow actions."
      navItems={navItems}
    >
      <div className="grid xl:grid-cols-2 gap-4">
        <Panel title="Document Viewer" subtitle="Application files">
          <div className="h-[420px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center gap-2 text-slate-500">
            <FileText className="w-5 h-5" /> Split-view document preview
          </div>
        </Panel>

        <Panel title="Verification Workspace" subtitle="OCR and workflow tools">
          <ItemList items={["OCR extracted owner name, parcel ID, filing date", "Cross-check against land registry and fraud index", "Conflict alert and duplicate claim detection"]} />
          <div className="mt-4 grid sm:grid-cols-3 gap-2 text-sm">
            <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><ScanSearch className="w-4 h-4" />Run cross-check</button>
            <button className="rounded-lg bg-emerald-600 text-white py-2 hover:bg-emerald-700 transition flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />Approve</button>
            <button className="rounded-lg bg-red-600 text-white py-2 hover:bg-red-700 transition flex items-center justify-center gap-2"><XCircle className="w-4 h-4" />Reject</button>
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
