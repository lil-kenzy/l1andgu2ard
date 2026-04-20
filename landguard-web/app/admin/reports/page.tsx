"use client";

import { useEffect, useState } from "react";
import { CalendarClock, ChartSpline, Download, FileSpreadsheet, Layers3 } from "lucide-react";
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

interface ComplianceReport {
  reportPeriod: { startDate: string; endDate: string };
  metrics: {
    totalTransactions: number;
    suspiciousActivities: number;
    openDisputes: number;
    complianceRate: string;
    auditTrailImmutable: boolean;
  };
  note?: string;
}

export default function AdminReportsPage() {
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReport = (start?: string, end?: string) => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (start) params.startDate = start;
    if (end) params.endDate = end;
    adminAPI
      .getComplianceReport(Object.keys(params).length ? params : undefined)
      .then((res) => setReport(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    adminAPI
      .getComplianceReport()
      .then((res) => setReport(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReport(startDate || undefined, endDate || undefined);
  };

  const handleExport = () => {
    if (!report) return;
    const text = JSON.stringify(report, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compliance-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PortalShell
      portal="Admin Portal"
      title="Reporting & Analytics"
      subtitle="Generate pre-built and custom reports, schedule exports, and maintain public transparency dashboards."
      navItems={navItems}
      stats={[
        {
          label: "Transactions",
          value: loading ? "…" : report ? String(report.metrics.totalTransactions) : "—",
          icon: CalendarClock,
        },
        {
          label: "Suspicious Activities",
          value: loading ? "…" : report ? String(report.metrics.suspiciousActivities) : "—",
          icon: Layers3,
        },
        {
          label: "Open Disputes",
          value: loading ? "…" : report ? String(report.metrics.openDisputes) : "—",
          icon: ChartSpline,
        },
        {
          label: "Compliance Rate",
          value: loading ? "…" : report ? report.metrics.complianceRate : "—",
          icon: Download,
        },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Compliance Report" subtitle="Period-based regulatory metrics">
          <form onSubmit={handleFilter} className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-2 py-1.5 text-sm bg-transparent text-slate-900 dark:text-white"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-2 py-1.5 text-sm bg-transparent text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 text-white py-2 text-sm hover:bg-blue-700 transition"
            >
              Generate
            </button>
          </form>

          {loading ? (
            <p className="text-sm text-slate-500">Loading report…</p>
          ) : report ? (
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex justify-between">
                <span>Total transactions</span>
                <span className="font-semibold">{report.metrics.totalTransactions}</span>
              </li>
              <li className="flex justify-between">
                <span>Suspicious activities</span>
                <span className="font-semibold">{report.metrics.suspiciousActivities}</span>
              </li>
              <li className="flex justify-between">
                <span>Open disputes</span>
                <span className="font-semibold">{report.metrics.openDisputes}</span>
              </li>
              <li className="flex justify-between">
                <span>Compliance rate</span>
                <span className="font-semibold text-emerald-600">{report.metrics.complianceRate}</span>
              </li>
              <li className="flex justify-between">
                <span>Audit trail immutable</span>
                <span className="font-semibold">{report.metrics.auditTrailImmutable ? "Yes" : "No"}</span>
              </li>
              {report.note && (
                <li className="text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700">
                  {report.note}
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No report data.</p>
          )}
        </Panel>

        <Panel title="Scheduling" subtitle="Automated distribution">
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {[
              "Email and secure share delivery",
              "Weekly/monthly scheduling",
              "Role-based report visibility",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                {item}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Export" subtitle="Download and share">
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {[
              "Public dashboard publishing",
              "Curation and approval workflow",
              "CSV and spreadsheet compatibility",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={handleExport}
            disabled={!report}
            className="mt-4 w-full rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export report
          </button>
        </Panel>
      </div>
    </PortalShell>
  );
}

