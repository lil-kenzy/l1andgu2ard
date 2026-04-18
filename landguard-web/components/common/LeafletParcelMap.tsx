"use client";

import { useMemo } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";

export interface ParcelMapItem {
  id: string;
  name: string;
  location: string;
  gpsAddress: string;
  price: string;
  size: string;
  status: "available" | "under_offer" | "sold" | "disputed";
  verified: boolean;
  center: LatLngTuple;
  polygon?: LatLngTuple[];
}

interface LeafletParcelMapProps {
  parcels?: ParcelMapItem[];
  selectedParcelId?: string | null;
  onParcelSelect?: (parcelId: string) => void;
  drawMode?: "none" | "polygon" | "radius";
  drawingEnabled?: boolean;
  drawnPoints?: LatLngTuple[];
  onDrawnPointsChange?: (points: LatLngTuple[]) => void;
  radiusCenter?: LatLngTuple | null;
  onRadiusCenterChange?: (center: LatLngTuple | null) => void;
  radiusMeters?: number;
  className?: string;
}

const ghanaCenter: LatLngTuple = [7.9465, -1.0232];

function statusColor(status: ParcelMapItem["status"]) {
  if (status === "available") return "#16a34a";
  if (status === "under_offer") return "#f59e0b";
  if (status === "sold") return "#2563eb";
  return "#dc2626";
}

function MapClickHandler({
  drawMode,
  drawingEnabled,
  drawnPoints,
  onDrawnPointsChange,
  onRadiusCenterChange,
}: {
  drawMode: "none" | "polygon" | "radius";
  drawingEnabled: boolean;
  drawnPoints: LatLngTuple[];
  onDrawnPointsChange?: (points: LatLngTuple[]) => void;
  onRadiusCenterChange?: (center: LatLngTuple | null) => void;
}) {
  useMapEvents({
    click(event) {
      if (!drawingEnabled) return;

      const nextPoint: LatLngTuple = [event.latlng.lat, event.latlng.lng];

      if (drawMode === "polygon") {
        onDrawnPointsChange?.([...drawnPoints, nextPoint]);
      }

      if (drawMode === "radius") {
        onRadiusCenterChange?.(nextPoint);
      }
    },
    contextmenu() {
      if (!drawingEnabled) return;

      if (drawMode === "polygon") {
        onDrawnPointsChange?.([]);
      }

      if (drawMode === "radius") {
        onRadiusCenterChange?.(null);
      }
    },
  });

  return null;
}

export default function LeafletParcelMap({
  parcels = [],
  selectedParcelId,
  onParcelSelect,
  drawMode = "none",
  drawingEnabled = false,
  drawnPoints = [],
  onDrawnPointsChange,
  radiusCenter = null,
  onRadiusCenterChange,
  radiusMeters = 500,
  className = "h-130",
}: LeafletParcelMapProps) {
  const selectedParcel = useMemo(
    () => parcels.find((parcel) => parcel.id === selectedParcelId) || null,
    [parcels, selectedParcelId]
  );

  const mapCenter = selectedParcel?.center || parcels[0]?.center || ghanaCenter;

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
      <MapContainer center={mapCenter} zoom={7} scrollWheelZoom className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          drawMode={drawMode}
          drawingEnabled={drawingEnabled}
          drawnPoints={drawnPoints}
          onDrawnPointsChange={onDrawnPointsChange}
          onRadiusCenterChange={onRadiusCenterChange}
        />

        {parcels.map((parcel) => {
          const color = statusColor(parcel.status);
          const active = parcel.id === selectedParcelId;

          return (
            <div key={parcel.id}>
              <CircleMarker
                center={parcel.center}
                radius={active ? 11 : 8}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: parcel.verified ? 0.85 : 0.45,
                  weight: active ? 3 : 2,
                }}
                eventHandlers={{
                  click: () => onParcelSelect?.(parcel.id),
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{parcel.name}</p>
                    <p>{parcel.location}</p>
                    <p>{parcel.gpsAddress}</p>
                    <p>{parcel.price}</p>
                  </div>
                </Popup>
              </CircleMarker>

              {parcel.polygon && parcel.polygon.length >= 3 && (
                <Polygon
                  positions={parcel.polygon}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: active ? 0.28 : 0.14,
                    weight: active ? 3 : 2,
                    dashArray: parcel.status === "disputed" ? "6 6" : undefined,
                  }}
                  eventHandlers={{
                    click: () => onParcelSelect?.(parcel.id),
                  }}
                />
              )}
            </div>
          );
        })}

        {drawMode === "polygon" && drawnPoints.length >= 1 && (
          <>
            {drawnPoints.map((point, index) => (
              <CircleMarker
                key={`${point[0]}-${point[1]}-${index}`}
                center={point}
                radius={6}
                pathOptions={{ color: "#1d4ed8", fillColor: "#1d4ed8", fillOpacity: 0.85 }}
              />
            ))}
            {drawnPoints.length >= 3 && (
              <Polygon
                positions={drawnPoints}
                pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.2, weight: 2 }}
              />
            )}
          </>
        )}

        {drawMode === "radius" && radiusCenter && (
          <>
            <CircleMarker
              center={radiusCenter}
              radius={7}
              pathOptions={{ color: "#1d4ed8", fillColor: "#1d4ed8", fillOpacity: 0.9 }}
            />
            <Circle
              center={radiusCenter}
              radius={radiusMeters}
              pathOptions={{ color: "#1d4ed8", fillColor: "#60a5fa", fillOpacity: 0.14, weight: 2 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
