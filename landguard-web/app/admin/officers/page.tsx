"use client";

import { useEffect, useState } from "react";
import { BookOpenCheck, BriefcaseBusiness, Network, UserRoundCog, UsersRound } from "lucide-react";
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

interface Officer {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  staffId?: string;
}

const EMPTY_FORM = { fullName: "", email: "", phone: "", department: "", staffId: "" };

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchOfficers = () => {
    setLoading(true);
    adminAPI
      .getOfficers()
      .then((res) => setOfficers(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminAPI.createOfficer(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchOfficers();
    } catch {
      // continue
    } finally {
      setSaving(false);
    }
  };

  return (
    <PortalShell
      portal="Admin Portal"
      title="Officer Management"
      subtitle="Manage officer profiles, role assignment, workload distribution, and training readiness."
      navItems={navItems}
      stats={[
        { label: "Officers", value: loading ? "…" : String(officers.length), icon: UsersRound },
        { label: "Assigned Cases", value: "—", icon: BriefcaseBusiness },
        { label: "Training Modules", value: "14", icon: BookOpenCheck },
        { label: "Role Profiles", value: "—", icon: UserRoundCog },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel title="Officer Directory" subtitle="All registered field officers">
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setShowForm((s) => !s)}
                className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {showForm ? "Cancel" : "+ Add Officer"}
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={handleAddOfficer}
                className="mb-4 grid sm:grid-cols-2 gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
              >
                {(
                  [
                    ["fullName", "Full name"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["department", "Department"],
                    ["staffId", "Staff ID"],
                  ] as [keyof typeof EMPTY_FORM, string][]
                ).map(([key, label]) => (
                  <input
                    key={key}
                    required={key === "fullName" || key === "email"}
                    value={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={label}
                    className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-white"
                  />
                ))}
                <button
                  type="submit"
                  disabled={saving}
                  className="sm:col-span-2 rounded-lg bg-emerald-600 text-white py-2 text-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                >
                  {saving ? "Saving…" : "Create Officer"}
                </button>
              </form>
            )}

            {loading ? (
              <p className="text-sm text-slate-500 py-4">Loading officers…</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Department</th>
                      <th className="py-2">Staff ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.map((o) => (
                      <tr
                        key={o._id}
                        className="border-b border-slate-100 dark:border-slate-700/60"
                      >
                        <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">
                          {o.fullName}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">
                          {o.email}
                        </td>
                        <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">
                          {o.department || "—"}
                        </td>
                        <td className="py-2.5 text-slate-500 dark:text-slate-400">
                          {o.staffId || "—"}
                        </td>
                      </tr>
                    ))}
                    {officers.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-6 text-center text-slate-400 text-sm"
                        >
                          No officers registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Development" subtitle="Training and enablement">
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {[
              "Skill matrix and certifications",
              "Mandatory module completion",
              "Mentorship and performance check-ins",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 text-sm rounded-lg border border-slate-300 dark:border-slate-600 p-3 flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Network className="w-4 h-4" /> Create team clusters for regional support coverage.
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}

