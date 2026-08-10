"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LeafletMouseEvent } from "leaflet";

const MapInner = dynamic(() => import("./BloodHeroLocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center rounded-xl border border-zinc-300 bg-zinc-50 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
      Loading map…
    </div>
  ),
});

// Dhaka, Bangladesh — sane default center when no coordinates are set yet.
const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125];

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "jsonv2");
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "PUNAB-BloodHero/1.0 (punab.org)" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

export function BloodHeroLocationPicker({
  addressFieldId,
  addressName,
  latName,
  lngName,
  addressLabel,
  addressPlaceholder,
  addressRequired,
  hint,
  fieldError,
}: {
  addressFieldId: string;
  addressName: string;
  latName: string;
  lngName: string;
  addressLabel: string;
  addressPlaceholder: string;
  addressRequired?: boolean;
  hint?: string;
  fieldError?: string;
}) {
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const requestSeq = useRef(0);

  const applyPoint = useCallback(async (lat: number, lng: number) => {
    setCoords({ lat, lng });
    const seq = ++requestSeq.current;
    setLocating(true);
    const label = await reverseGeocode(lat, lng);
    if (seq === requestSeq.current) {
      setLocating(false);
      if (label) setAddress(label);
    }
  }, []);

  const handleMapClick = useCallback(
    (e: LeafletMouseEvent) => {
      void applyPoint(e.latlng.lat, e.latlng.lng);
    },
    [applyPoint],
  );

  const handleMarkerDragEnd = useCallback(
    (lat: number, lng: number) => {
      void applyPoint(lat, lng);
    },
    [applyPoint],
  );

  const useMyLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setMapOpen(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => void applyPoint(pos.coords.latitude, pos.coords.longitude),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [applyPoint]);

  return (
    <div>
      <label htmlFor={addressFieldId} className="block text-sm font-semibold text-zinc-800 dark:text-zinc-100">
        {addressLabel}
        {addressRequired ? (
          <span className="ml-0.5 text-red-600 dark:text-red-400" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <input
        id={addressFieldId}
        name={addressName}
        type="text"
        autoComplete="street-address"
        required={addressRequired}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="mt-2 w-full min-h-[2.75rem] rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:min-h-0 sm:text-sm dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        placeholder={addressPlaceholder}
        aria-invalid={fieldError ? "true" : undefined}
      />
      <input type="hidden" name={latName} value={coords?.lat ?? ""} />
      <input type="hidden" name={lngName} value={coords?.lng ?? ""} />

      {fieldError ? (
        <p className="mt-1.5 text-sm font-medium text-red-600 dark:text-red-400">{fieldError}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-snug text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setMapOpen((v) => !v)}
          className="text-xs font-semibold text-red-800 hover:underline dark:text-red-300"
        >
          {mapOpen ? "Hide map" : "Pick exact location on map"}
        </button>
        <button
          type="button"
          onClick={useMyLocation}
          className="text-xs font-semibold text-zinc-600 hover:underline dark:text-zinc-400"
        >
          Use my current location
        </button>
        {locating ? <span className="text-xs text-zinc-500 dark:text-zinc-400">Finding address…</span> : null}
        {coords ? (
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        ) : null}
      </div>

      {mapOpen ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-zinc-300 dark:border-zinc-700">
          <MapInner
            center={coords ? [coords.lat, coords.lng] : DEFAULT_CENTER}
            marker={coords}
            onMapClick={handleMapClick}
            onMarkerDragEnd={handleMarkerDragEnd}
          />
        </div>
      ) : null}
    </div>
  );
}
