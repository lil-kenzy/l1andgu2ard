"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { LatLngTuple } from "leaflet";
import { CheckCircle2, FileText, ImagePlus, MapPinned, Send, Trash2, UploadCloud } from "lucide-react";
import { Panel, PortalShell } from "@/components/portal/PortalShell";

const LeafletParcelMap = dynamic(() => import("@/components/common/LeafletParcelMap"), {
  ssr: false,
});

const navItems = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "List Property", href: "/seller/list-property" },
  { label: "Listings", href: "/seller/listings" },
  { label: "Documents", href: "/seller/documents" },
  { label: "Inquiries", href: "/seller/inquiries" },
  { label: "Offers", href: "/seller/offers" },
  { label: "Profile", href: "/seller/profile" },
];

const stepTitles = ["Location & Polygon", "Property Details", "Media Upload", "Documents", "Review & Publish"];
const emptyParcelCenter: LatLngTuple = [5.6037, -0.187];

export default function SellerListPropertyPage() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<LatLngTuple[]>([]);
  const [form, setForm] = useState({
    digitalAddress: "",
    region: "Greater Accra",
    district: "",
    propertyTitle: "",
    transactionType: "sale",
    category: "residential",
    size: "",
    price: "",
    description: "",
    features: "",
    negotiable: true,
    contactMethod: "phone",
  });
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [documentFiles, setDocumentFiles] = useState<string[]>([]);

  const progress = (step / 5) * 100;

  const parcelPreview = useMemo(
    () => [
      {
        id: "draft-listing",
        name: form.propertyTitle || "Draft Parcel",
        location: `${form.district || "District pending"}, ${form.region}`,
        gpsAddress: form.digitalAddress || "GPS address pending",
        price: form.price || "Price pending",
        size: form.size || "Size pending",
        status: "available" as const,
        verified: true,
        center: drawnPoints[0] || emptyParcelCenter,
        polygon: drawnPoints.length >= 3 ? drawnPoints : undefined,
      },
    ],
    [drawnPoints, form.digitalAddress, form.district, form.price, form.propertyTitle, form.region, form.size]
  );

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!form.digitalAddress.trim()) return "Enter a GhanaPostGPS digital address.";
      if (!form.district.trim()) return "Enter the district for this listing.";
      if (drawnPoints.length < 3) return "Draw at least 3 map points to define the land polygon.";
    }

    if (step === 2) {
      if (!form.propertyTitle.trim()) return "Enter a property title.";
      if (!form.size.trim()) return "Enter the land size.";
      if (!form.price.trim()) return "Enter the property price.";
      if (!form.description.trim()) return "Add a listing description.";
    }

    if (step === 3 && mediaFiles.length === 0) return "Upload at least one image or media file.";
    if (step === 4 && documentFiles.length < 2) return "Upload at least two ownership or verification documents.";
    return "";
  };

  const goNext = () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setStep((current) => Math.min(5, current + 1));
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>, target: "media" | "documents") => {
    const files = Array.from(event.target.files || []).map((file) => file.name);

    if (target === "media") {
      setMediaFiles((current) => [...current, ...files]);
    } else {
      setDocumentFiles((current) => [...current, ...files]);
    }

    event.target.value = "";
  };

  const removeFile = (target: "media" | "documents", fileName: string) => {
    if (target === "media") {
      setMediaFiles((current) => current.filter((item) => item !== fileName));
      return;
    }

    setDocumentFiles((current) => current.filter((item) => item !== fileName));
  };

  const publishListing = () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setPublishSuccess(true);
  };

  return (
    <PortalShell
      portal="Seller Portal"
      title="List New Property"
      subtitle="Complete the structured 5-step listing workflow for mapped parcels, ownership proof, media, and publication review."
      navItems={navItems}
    >
      <Panel title={`Step ${step}: ${stepTitles[step - 1]}`} subtitle="Complete each section to enable secure publication">
        <div className="mb-5 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {step === 1 && (
          <div className="space-y-4 text-sm">
            <div className="grid md:grid-cols-3 gap-3">
              <input value={form.digitalAddress} onChange={(event) => updateField("digitalAddress", event.target.value)} placeholder="GhanaPostGPS address (e.g. GA-123-4567)" className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700" />
              <select value={form.region} onChange={(event) => updateField("region", event.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700">
                <option value="Greater Accra">Greater Accra</option>
                <option value="Ashanti">Ashanti</option>
                <option value="Central">Central</option>
                <option value="Eastern">Eastern</option>
                <option value="Western">Western</option>
              </select>
              <input value={form.district} onChange={(event) => updateField("district", event.target.value)} placeholder="District" className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700" />
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2"><MapPinned className="w-4 h-4" /> Draw parcel polygon</p>
                <button onClick={() => setDrawnPoints([])} className="text-sm text-blue-600 hover:text-blue-700">Clear points</button>
              </div>
              <LeafletParcelMap parcels={parcelPreview} selectedParcelId="draft-listing" drawMode="polygon" drawingEnabled drawnPoints={drawnPoints} onDrawnPointsChange={setDrawnPoints} className="h-108" />
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-slate-600 dark:text-slate-300">
              Polygon points captured: <span className="font-semibold text-slate-900 dark:text-white">{drawnPoints.length}</span>. Right-click map to reset.
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <input value={form.propertyTitle} onChange={(event) => updateField("propertyTitle", event.target.value)} placeholder="Property title" className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700" />
            <select value={form.transactionType} onChange={(event) => updateField("transactionType", event.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700">
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
            <select value={form.category} onChange={(event) => updateField("category", event.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700">
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="vacant_land">Vacant Land</option>
              <option value="with_building">With Building</option>
            </select>
            <input value={form.size} onChange={(event) => updateField("size", event.target.value)} placeholder="Land size (e.g. 0.25 acres)" className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700" />
            <input value={form.price} onChange={(event) => updateField("price", event.target.value)} placeholder="Price (GHS)" className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700" />
            <select value={form.contactMethod} onChange={(event) => updateField("contactMethod", event.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700">
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="platform">In-app messaging</option>
            </select>
            <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Property description" className="sm:col-span-2 min-h-28 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700" />
            <input value={form.features} onChange={(event) => updateField("features", event.target.value)} placeholder="Features separated by commas" className="sm:col-span-2 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 bg-slate-50 dark:bg-slate-700" />
            <label className="sm:col-span-2 flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={form.negotiable} onChange={(event) => updateField("negotiable", event.target.checked)} /> Price is negotiable
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-sm">
            <p className="text-slate-600 dark:text-slate-300">Upload listing media such as photos, drone views, videos, or 360 tours.</p>
            <label className="h-44 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2 text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <UploadCloud className="w-6 h-6" />
              <span>Select media files</span>
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(event) => handleFileSelection(event, "media")} />
            </label>

            <div className="space-y-2">
              {mediaFiles.map((file) => (
                <div key={file} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                  <span className="flex items-center gap-2"><ImagePlus className="w-4 h-4" /> {file}</span>
                  <button onClick={() => removeFile("media", file)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-sm">
            <p className="text-slate-600 dark:text-slate-300">Upload title deed, site plan, owner ID, and any permits required for review.</p>
            <label className="h-44 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2 text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <FileText className="w-6 h-6" />
              <span>Select ownership documents</span>
              <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={(event) => handleFileSelection(event, "documents")} />
            </label>

            <div className="space-y-2">
              {documentFiles.map((file) => (
                <div key={file} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {file}</span>
                  <button onClick={() => removeFile("documents", file)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 text-sm">
            {publishSuccess && (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Listing submitted successfully for verification and publication review.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">Location summary</p>
                <p>{form.digitalAddress}</p>
                <p>{form.district}, {form.region}</p>
                <p>Polygon points: {drawnPoints.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">Listing summary</p>
                <p>{form.propertyTitle}</p>
                <p className="capitalize">{form.transactionType} • {form.category.replace("_", " ")}</p>
                <p>{form.size}</p>
                <p>{form.price}</p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-2">
              <p className="font-semibold text-slate-900 dark:text-white">Compliance checklist</p>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                <li>• Media files uploaded: {mediaFiles.length}</li>
                <li>• Ownership documents uploaded: {documentFiles.length}</li>
                <li>• Contact method: {form.contactMethod}</li>
                <li>• Negotiable: {form.negotiable ? "Yes" : "No"}</li>
              </ul>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="mt-5 flex items-center justify-between">
          <button disabled={step === 1} onClick={goBack} className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 disabled:opacity-50">Back</button>
          {step < 5 ? (
            <button onClick={goNext} className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition">Next</button>
          ) : (
            <button onClick={publishListing} className="rounded-lg bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition flex items-center gap-2"><Send className="w-4 h-4" /> Publish listing</button>
          )}
        </div>
      </Panel>

      <div className="mt-4 grid md:grid-cols-5 gap-2 text-sm">
        {stepTitles.map((item, index) => (
          <div key={item} className={`rounded-lg border px-2 py-2 text-center ${step === index + 1 ? "border-blue-500 text-blue-600" : "border-slate-300 dark:border-slate-600"}`}>
            {index + 1}. {item}
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
