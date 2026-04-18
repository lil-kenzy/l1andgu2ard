import { Compass, Link2, MapPinned, RadioTower, Ruler } from "lucide-react";
import { ItemList, Panel, PortalShell } from "@/components/portal/PortalShell";

const navItems = [
  { label: "Dashboard", href: "/surveyor/dashboard" },
  { label: "Field Entry", href: "/surveyor/field-entry" },
];

export default function SurveyorDashboardPage() {
  return (
    <PortalShell
      portal="Surveyor Portal"
      title="Surveyor Dashboard"
      subtitle="Track assigned surveys, validate parcel boundaries, and monitor device synchronization status."
      navItems={navItems}
      stats={[
        { label: "Assigned Surveys", value: "12", icon: Compass },
        { label: "Pending Validation", value: "5", icon: Ruler },
        { label: "Map Sync", value: "Healthy", icon: Link2 },
        { label: "Field Alerts", value: "3", icon: RadioTower },
      ]}
    >
      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Active Assignments" subtitle="Current field work queue">
          <ItemList items={["Boundary validation - East Legon Parcel E-22", "Dispute re-survey - Kasoa North Block", "Subdivision check - Tema Industrial Zone"]} />
        </Panel>
        <Panel title="Validation Toolkit" subtitle="Operational capabilities">
          <ItemList items={["GNSS point verification", "Boundary line conflict checks", "Photo and evidence capture"]} />
        </Panel>
        <Panel title="Coverage" subtitle="Geospatial context">
          <div className="h-56 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center gap-2 text-slate-500">
            <MapPinned className="w-5 h-5" /> Regional map preview
          </div>
        </Panel>
      </div>
    </PortalShell>
  );
}
