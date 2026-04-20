"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, CreditCard, Eye, Loader2, Save, Star, XCircle, Clock3 } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";
import { usersAPI } from "@/lib/api/client";

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

const MANDATORY_DOCS = [
  { key: "land_title", label: "Land Title Certificate / Deed of Assignment", required: true },
  { key: "ghana_card", label: "Ghana Card of Registered Owner(s)", required: true },
  { key: "consent_letter", label: "Consent Letter (if selling inherited property)", required: false },
  { key: "building_permit", label: "Building Permit (if structures exist)", required: false },
];

export default function SellerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>("pending");

  // Personal info (read-only from Ghana Card NIA verification)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Seller-specific fields
  const [businessRegNumber, setBusinessRegNumber] = useState("");
  const [tin, setTin] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    usersAPI.getProfile()
      .then((res) => {
        const d = res.data?.data;
        if (!d) return;
        setFullName(d.personalInfo?.fullName ?? "");
        setPhone(d.personalInfo?.phoneNumber ?? "");
        setEmail(d.personalInfo?.email ?? "");
        setVerificationStatus(d.sellerInfo?.verificationStatus ?? "pending");
        setBusinessRegNumber(d.sellerInfo?.businessRegNumber ?? "");
        setTin(d.sellerInfo?.tin ?? "");
        setPhysicalAddress(d.sellerInfo?.physicalAddress ?? "");
        setBankName(d.sellerInfo?.bankAccount?.bankName ?? "");
        setAccountNumber(d.sellerInfo?.bankAccount?.accountNumber ?? "");
        setAccountName(d.sellerInfo?.bankAccount?.accountName ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await usersAPI.updateSellerInfo({
        businessRegNumber: businessRegNumber.trim() || undefined,
        tin: tin.trim() || undefined,
        physicalAddress: physicalAddress.trim() || undefined,
        bankName: bankName.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
        accountName: accountName.trim() || undefined,
      });
      setSaved(true);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? "Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const verificationBadge = () => {
    if (verificationStatus === "verified") {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-3 mb-6">
          <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Verified Seller</span>
        </div>
      );
    }
    if (verificationStatus === "rejected") {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3 mb-6">
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-sm font-semibold text-red-800 dark:text-red-300">Verification Rejected — Please update your documents</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-3 mb-6">
        <Clock3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Verification Pending — Lands Commission review within 72 hours</span>
      </div>
    );
  };

  const inputCls = "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const readOnlyCls = `${inputCls} opacity-60 cursor-not-allowed`;
  const labelCls = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";

  return (
    <PortalShell
      portal="Seller Portal"
      title="Seller Profile"
      subtitle="Manage business identity, verification badge, public listing preview, ratings, and payout configuration."
      navItems={navItems}
      stats={[
        { label: "Verification", value: verificationStatus === "verified" ? "Verified" : verificationStatus === "rejected" ? "Rejected" : "Pending", icon: BadgeCheck },
        { label: "Public Rating", value: "—", icon: Star },
        { label: "Profile Views", value: "—", icon: Eye },
        { label: "Payout Methods", value: bankName ? "1" : "0", icon: CreditCard },
      ]}
    >
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Verification badge */}
          <div className="lg:col-span-2">{verificationBadge()}</div>

          {/* Personal info — read-only (from Ghana Card NIA) */}
          <Panel title="Personal Information" subtitle="Set during registration via Ghana Card NIA verification">
            <div className="grid gap-3">
              <div>
                <label className={labelCls}>Full Name (Ghana Card)</label>
                <input className={readOnlyCls} value={fullName || "—"} readOnly />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input className={readOnlyCls} value={phone || "—"} readOnly />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={readOnlyCls} value={email || "Not provided"} readOnly />
              </div>
            </div>
          </Panel>

          {/* Business details */}
          <Panel title="Business Details" subtitle="Optional for individual sellers; required for corporate sellers">
            <div className="grid gap-3">
              <div>
                <label className={labelCls}>Business Registration Number (corporate only, optional)</label>
                <input className={inputCls} placeholder="e.g. CS-12345" value={businessRegNumber} onChange={(e) => setBusinessRegNumber(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Tax Identification Number / TIN (optional, auto-formatted uppercase)</label>
                <input className={inputCls} placeholder="e.g. P0012345678" value={tin} onChange={(e) => setTin(e.target.value.toUpperCase())} />
              </div>
              <div>
                <label className={labelCls}>Physical Address (for verification)</label>
                <input className={inputCls} placeholder="Your verifiable physical address" value={physicalAddress} onChange={(e) => setPhysicalAddress(e.target.value)} />
              </div>
            </div>
          </Panel>

          {/* Payout / Bank */}
          <Panel title="Payout / Bank Account" subtitle="Required for digital payouts; leave blank to arrange in-person payment">
            <div className="grid gap-3">
              <div>
                <label className={labelCls}>Bank Name</label>
                <input className={inputCls} placeholder="e.g. GCB Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Account Number</label>
                <input className={inputCls} placeholder="XXXXXXXXXXXX" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Account Name</label>
                <input className={inputCls} placeholder="Name on the account" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </div>
            </div>
          </Panel>

          {/* Mandatory documents checklist (links to documents page) */}
          <Panel title="Mandatory Documents" subtitle="Required before listing any property. Upload via the Documents tab.">
            <ul className="space-y-2 text-sm">
              {MANDATORY_DOCS.map((doc) => (
                <li key={doc.key} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <span className="mt-0.5">📄</span>
                  <span>{doc.required ? "" : "(Optional) "}{doc.label}</span>
                </li>
              ))}
            </ul>
            <a href="/seller/documents" className="mt-4 inline-block rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition">
              Go to Document Vault →
            </a>
          </Panel>

          {/* Save button + feedback */}
          <div className="lg:col-span-2 flex flex-col items-start gap-3">
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            {saved && <p className="text-sm text-emerald-600 dark:text-emerald-400">Changes saved successfully.</p>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
