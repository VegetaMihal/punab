"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L, { type LeafletMouseEvent } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// assumed: default Leaflet marker asset URLs break under bundlers unless re-pointed explicitly
const markerDefaultIcon = L.icon({
  iconUrl: markerIcon.src ?? markerIcon,
  iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
  shadowUrl: markerShadow.src ?? markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onMapClick }: { onMapClick: (e: LeafletMouseEvent) => void }) {
  useMapEvents({ click: onMapClick });
  return null;
}

export default function BloodHeroLocationPickerMap({
  center,
  marker,
  onMapClick,
  onMarkerDragEnd,
}: {
  center: [number, number];
  marker: { lat: number; lng: number } | null;
  onMapClick: (e: LeafletMouseEvent) => void;
  onMarkerDragEnd: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer center={center} zoom={marker ? 15 : 12} style={{ height: "16rem", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />
      {marker ? (
        <Marker
          position={[marker.lat, marker.lng]}
          icon={markerDefaultIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const pos = e.target.getLatLng();
              onMarkerDragEnd(pos.lat, pos.lng);
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}
