"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calculator, Camera, FileText, Images, MessageCircle, ShieldCheck, View } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/buyer/dashboard" },
  { label: "Map", href: "/buyer/map" },
  { label: "Favorites", href: "/buyer/favorites" },
  { label: "Alerts", href: "/buyer/alerts" },
  { label: "Messages", href: "/buyer/messages" },
  { label: "Transactions", href: "/buyer/transactions" },
  { label: "Profile", href: "/buyer/profile" },
];

const PROPERTY_DETAILS: Record<
  string,
  {
    location: string;
    gpsAddress: string;
    size: string;
    category: string;
    ownership: string;
    utilityAccess: string;
    priceLabel: string;
    amount: number;
  }
> = {
  "1": {
    location: "East Legon, Accra",
    gpsAddress: "GA-123-4567",
    size: "0.25 acres",
    category: "Residential",
    ownership: "Freehold",
    utilityAccess: "Water + Electricity",
    priceLabel: "GHS 450,000",
    amount: 450000,
  },
  "2": {
    location: "Airport Residential, Accra",
    gpsAddress: "GA-890-1234",
    size: "0.4 acres",
    category: "Commercial",
    ownership: "Leasehold",
    utilityAccess: "Water + Electricity + Road Access",
    priceLabel: "GHS 15,000 / month",
    amount: 15000,
  },
  "3": {
    location: "Sakumono, Tema",
    gpsAddress: "MA-345-6789",
    size: "0.18 acres",
    category: "Residential",
    ownership: "Freehold",
    utilityAccess: "Water + Electricity",
    priceLabel: "GHS 320,000",
    amount: 320000,
  },
  "4": {
    location: "Cantonments, Accra",
    gpsAddress: "GA-456-7890",
    size: "0.5 acres",
    category: "Commercial",
    ownership: "Freehold",
    utilityAccess: "Water + Electricity + Sewer",
    priceLabel: "GHS 850,000",
    amount: 850000,
  },
  "5": {
    location: "Labone, Accra",
    gpsAddress: "GA-234-5678",
    size: "0.3 acres",
    category: "Residential",
    ownership: "Leasehold",
    utilityAccess: "Water + Electricity",
    priceLabel: "GHS 8,500 / month",
    amount: 8500,
  },
  "6": {
    location: "Spintex Road, Accra",
    gpsAddress: "GA-567-8901",
    size: "0.15 acres",
    category: "Residential",
    ownership: "Freehold",
    utilityAccess: "Water + Electricity",
    priceLabel: "GHS 275,000",
    amount: 275000,
  },
};

export default function BuyerPropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const [loanYears, setLoanYears] = useState(20);
  const [interestRate, setInterestRate] = useState(18);

  const propertyId = params?.id ?? "unknown";
  const propertyData = PROPERTY_DETAILS[propertyId] ?? {
    location: "Unknown Property",
    gpsAddress: "N/A",
    size: "N/A",
    category: "N/A",
    ownership: "N/A",
    utilityAccess: "N/A",
    priceLabel: "N/A",
    amount: 0,
  };
  const amount = propertyData.amount;

  const monthlyEstimate = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanYears * 12;
    const numerator = amount * monthlyRate * (1 + monthlyRate) ** totalMonths;
    const denominator = (1 + monthlyRate) ** totalMonths - 1;
    return denominator > 0 ? Math.round(numerator / denominator) : 0;
  }, [amount, interestRate, loanYears]);

  return (
    <PortalShell
      portal="Buyer Portal"
      title={`Property Details #${propertyId} • ${propertyData.location}`}
      subtitle="Review listing media, legal documents, ownership verification, and financing estimates in one place."
      navItems={navItems}
      stats={[
        { label: "Gallery Assets", value: "24", icon: Images },
        { label: "Document Files", value: "11", icon: FileText },
        { label: "360 Views", value: "3", icon: Camera },
        { label: "Verification Score", value: "96%", icon: ShieldCheck },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Panel title="Gallery + 360 Viewer" subtitle="Immersive media preview">
            <div className="grid sm:grid-cols-3 gap-2 mb-3">
              <div className="h-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="h-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="h-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
            <button className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition flex items-center gap-2">
              <View className="w-4 h-4" /> Launch 360 Viewer
            </button>
          </Panel>

          <Panel title="Property Specifications" subtitle="Structured listing details">
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
              <p><span className="font-medium">Location:</span> {propertyData.location}</p>
              <p><span className="font-medium">GPS Address:</span> {propertyData.gpsAddress}</p>
              <p><span className="font-medium">Land Size:</span> {propertyData.size}</p>
              <p><span className="font-medium">Ownership:</span> {propertyData.ownership}</p>
              <p><span className="font-medium">Utility Access:</span> {propertyData.utilityAccess}</p>
              <p><span className="font-medium">Price:</span> {propertyData.priceLabel}</p>
            </div>
          </Panel>

          <Panel title="Document Viewer" subtitle="Watermarked legal documents">
            <ItemList items={["Land title certificate (watermarked)", "Survey plan with stamp validation", "Seller identification & verification log"]} />
            <div className="mt-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
              Downloads include dynamic watermarking for compliance and anti-tamper protection.
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Mortgage Calculator" subtitle="Estimated financing preview">
            <div className="space-y-3 text-sm">
              <label className="block">Loan years
                <input type="range" min={5} max={30} value={loanYears} onChange={(e) => setLoanYears(Number(e.target.value))} className="w-full" />
              </label>
              <label className="block">Interest rate (%)
                <input type="range" min={8} max={28} value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full" />
              </label>
              <p className="text-slate-600 dark:text-slate-300">Estimated monthly: <span className="font-semibold text-slate-900 dark:text-white">GHS {monthlyEstimate.toLocaleString()}</span></p>
              <div className="text-xs text-slate-500">Illustrative only. Final terms depend on lender checks.</div>
            </div>
          </Panel>

          <Panel title="Contact Seller" subtitle="Secure thread and scheduling">
            <div className="grid gap-2 text-sm">
              <Link href="/buyer/messages" className="rounded-lg bg-blue-600 text-white py-2 text-center hover:bg-blue-700 transition flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" />Open chat</Link>
              <button className="rounded-lg border border-slate-300 dark:border-slate-600 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"><Calculator className="w-4 h-4" />Request valuation</button>
            </div>
          </Panel>
        </div>
      </div>
    </PortalShell>
  );
}
