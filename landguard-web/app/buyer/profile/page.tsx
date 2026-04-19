"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Download, ExternalLink, HelpCircle, Lock, Mail, Phone, Shield, Trash2, User } from "lucide-react";
import { Panel, PortalShell, ItemList } from "@/components/portal/PortalShell";
import { usersAPI } from "@/lib/api/client";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

const FAQ_ITEMS = [
  { q: "How do I verify my identity?", a: "Upload your Ghana Card via Settings → Identity Verification. Our OCR pipeline processes it within minutes." },
  { q: "How do I save a property?", a: "On any listing page click the ♡ heart icon. Saved lands appear under Favorites." },
  { q: "Can I download title documents?", a: "Documents are displayed with watermarks. You can request an un-watermarked copy after completing a transaction." },
  { q: "How do I raise a dispute?", a: "Open the transaction record, click "Raise Dispute", and describe the issue. Our team responds within 48 h." },
  { q: "How do I change my phone number?", a: "Phone numbers are tied to your account identity. Contact support@landguard.app to request a change." },
];

export default function BuyerProfilePage() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"verified" | "pending" | "unverified">("unverified");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    usersAPI.getProfile()
      .then((res) => {
        const u = res.data?.data;
        if (!u) return;
        const status = u.kycStatus ?? u.verificationStatus;
        if (status === "verified" || u.personalInfo?.niaVerified) setVerificationStatus("verified");
        else if (status === "pending") setVerificationStatus("pending");
        setFirstName(u.personalInfo?.firstName ?? "");
        setLastName(u.personalInfo?.lastName ?? "");
        setEmail(u.email ?? "");
        setPhone(u.personalInfo?.phone ?? u.phone ?? "");
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await usersAPI.updateProfile({ personalInfo: { firstName, lastName, phone } });
      setSaveMsg("Profile updated.");
    } catch {
      setSaveMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const verBadge = {
    verified:   { text: "✅ Identity Verified",       cls: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" },
    pending:    { text: "⏳ Verification Pending",    cls: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700" },
    unverified: { text: "⚠️ Not Verified",            cls: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },
  }[verificationStatus];

  return (
    <PortalShell
      portal="Buyer Portal"
      title="Profile Settings"
      subtitle="Manage personal information, security controls, privacy settings, and account data rights."
      navItems={navItems}
      stats={[
        { label: "Profile Completion", value: "92%", icon: User },
        { label: "2FA Status", value: twoFactor ? "On" : "Off", icon: Shield },
        { label: "Privacy Mode", value: privacyMode ? "High" : "Standard", icon: Lock },
        { label: "Exports", value: "2", icon: Download },
      ]}
    >
      {/* Verification Status */}
      <div className={`mb-4 rounded-xl border px-4 py-3 flex items-center justify-between ${verBadge.cls}`}>
        <span className="text-sm font-semibold">{verBadge.text}</span>
        {verificationStatus !== "verified" && (
          <button className="text-xs underline font-medium opacity-80 hover:opacity-100">
            Complete verification →
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Personal Information" subtitle="Identity and contact details">
          <div className="grid gap-3 text-sm">
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
            <input value={email} readOnly className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-2 cursor-not-allowed text-slate-500" title="Email cannot be changed here" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-2" />
            {saveMsg && <p className={`text-xs ${saveMsg.startsWith("Failed") ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>{saveMsg}</p>}
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-600 text-white py-2 hover:bg-blue-700 transition disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
          </div>
        </Panel>

        <Panel title="Security & Privacy" subtitle="2FA, data controls and account protection">
          <div className="space-y-3 text-sm">
            <label className="flex items-center justify-between">Enable 2FA <input type="checkbox" checked={twoFactor} onChange={() => setTwoFactor((v) => !v)} /></label>
            <label className="flex items-center justify-between">High privacy mode <input type="checkbox" checked={privacyMode} onChange={() => setPrivacyMode((v) => !v)} /></label>
            <ItemList items={["Trusted devices management", "Session history and remote sign-out", "Suspicious login alerts"]} />
            <div className="grid sm:grid-cols-2 gap-2">
              <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><Download className="w-4 h-4" />Export my data</button>
              <button className="rounded-lg border border-red-300 text-red-700 dark:border-red-700 dark:text-red-300 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" />Delete request</button>
            </div>
          </div>
        </Panel>
      </div>

      {/* FAQ */}
      <div className="mt-4">
        <Panel title="Frequently Asked Questions" subtitle="Common questions from buyers">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="py-3">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-3"
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-500 shrink-0" />{item.q}
                  </span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {openFaq === idx && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 pl-6">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Support / Contact */}
      <div className="mt-4">
        <Panel title="Support & Contact Us" subtitle="Get help from the LandGuard team">
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <a
              href="mailto:support@landguard.app"
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex flex-col gap-2"
            >
              <Mail className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-100">Email Support</span>
              <span className="text-slate-500 dark:text-slate-400">support@landguard.app</span>
            </a>
            <a
              href="tel:+233302000000"
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex flex-col gap-2"
            >
              <Phone className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-100">Phone</span>
              <span className="text-slate-500 dark:text-slate-400">+233 30 200 0000</span>
            </a>
            <a
              href="https://landguard.app/help"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex flex-col gap-2"
            >
              <ExternalLink className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-100">Help Centre</span>
              <span className="text-slate-500 dark:text-slate-400">landguard.app/help</span>
            </a>
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
