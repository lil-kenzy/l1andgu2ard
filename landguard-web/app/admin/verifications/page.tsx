"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, ListChecks, TimerReset, UserCheck } from "lucide-react";
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

interface PendingProperty {
  _id: string;
  title: string;
  seller?: { personalInfo?: { fullName?: string } };
  createdAt: string;
  verificationStatus: string;
}

export default function AdminVerificationsPage() {
  const [properties, setProperties] = useState<PendingProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getPendingProperties()
      .then((res) => setProperties(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
            {loading ? (
              <p className="text-sm text-slate-500 py-4">Loading queue…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
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
                        className="border-b border-slate-100 dark:border-slate-700/60"
                      >
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
                        <td colSpan={4} className="py-6 text-center text-slate-400 text-sm">
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
    </PortalShell>
  );
}

