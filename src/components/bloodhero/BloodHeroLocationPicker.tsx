"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { LeafletMouseEvent } from "leaflet";
import {
  reverseGeocodeBloodHeroPoint,
  searchBloodHeroAddress,
  type BloodHeroGeocodeSuggestion,
} from "@/lib/bloodhero/geocode";

const MapInner = dynamic(() => import("./BloodHeroLocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 items-center justify-center rounded-xl border-2 border-(--bh-line) bg-(--bh-panel) text-sm text-(--bh-ink-soft)">
      Loading map…
    </div>
  ),
});

// Dhaka, Bangladesh — sane default center when no coordinates are set yet.
const DEFAULT_CENTER: [number, number] = [23.8103, 90.4125];
const SEARCH_DEBOUNCE_MS = 350;

type LocateStatus = "idle" | "locating" | "denied" | "unavailable";

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
  const [reverseLocating, setReverseLocating] = useState(false);
  const [locateStatus, setLocateStatus] = useState<LocateStatus>("idle");
  const [suggestions, setSuggestions] = useState<BloodHeroGeocodeSuggestion[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [searching, setSearching] = useState(false);

  const reverseSeq = useRef(0);
  const searchSeq = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const skipNextSearch = useRef(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const applyPoint = useCallback(async (lat: number, lng: number, opensMap = true) => {
    setCoords({ lat, lng });
    if (opensMap) setMapOpen(true);
    const seq = ++reverseSeq.current;
    setReverseLocating(true);
    const label = await reverseGeocodeBloodHeroPoint(lat, lng);
    if (seq === reverseSeq.current) {
      setReverseLocating(false);
      if (label) {
        skipNextSearch.current = true;
        setAddress(label);
      }
    }
  }, []);

  // Type-ahead: debounced search-as-you-type, Bangladesh-biased, like a ride-hailing pickup search.
  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      setSuggestions([]);
      setSuggestOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (address.trim().length < 3) {
      setSuggestions([]);
      setSuggestOpen(false);
      setSearching(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const seq = ++searchSeq.current;
      setSearching(true);
      searchBloodHeroAddress(address, 5, controller.signal)
        .then((rows) => {
          if (seq !== searchSeq.current) return;
          setSuggestions(rows);
          setSuggestOpen(rows.length > 0);
          setHighlight(-1);
        })
        .finally(() => {
          if (seq === searchSeq.current) setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [address]);

  // Close the suggestion dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setSuggestOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selectSuggestion = useCallback((s: BloodHeroGeocodeSuggestion) => {
    skipNextSearch.current = true;
    setAddress(s.label);
    setCoords({ lat: s.lat, lng: s.lng });
    setMapOpen(true);
    setSuggestions([]);
    setSuggestOpen(false);
    setHighlight(-1);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!suggestOpen || suggestions.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter" && highlight >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[highlight]);
      } else if (e.key === "Escape") {
        setSuggestOpen(false);
      }
    },
    [suggestOpen, suggestions, highlight, selectSuggestion],
  );

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

  // "Use my current location" — same shape as a ride-hailing pickup pin: ask permission,
  // show a clear state while locating, and fail into search/map instead of a silent dead end.
  const useMyLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocateStatus("unavailable");
      return;
    }
    setLocateStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocateStatus("idle");
        void applyPoint(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setLocateStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [applyPoint]);

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={addressFieldId} className="block text-sm font-semibold text-(--bh-ink)">
        {addressLabel}
        {addressRequired ? (
          <span className="ml-0.5 text-(--bh-blood-deep)" aria-hidden>
            *
          </span>
        ) : null}
      </label>

      <div className="relative mt-2">
        <input
          id={addressFieldId}
          name={addressName}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-expanded={suggestOpen}
          aria-controls={`${addressFieldId}-suggestions`}
          aria-autocomplete="list"
          required={addressRequired}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setSuggestOpen(true)}
          className="w-full min-h-11 rounded-xl border-2 border-(--bh-line) bg-(--bh-panel) px-3.5 py-2.5 pr-9 text-base text-(--bh-ink) placeholder:text-(--bh-ink-soft) focus:border-(--bh-blood) focus:outline-none sm:min-h-0 sm:text-sm"
          placeholder={addressPlaceholder}
          aria-invalid={fieldError ? "true" : undefined}
        />
        {searching || reverseLocating ? (
          <span
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-(--bh-line) border-t-(--bh-blood)"
            aria-hidden
          />
        ) : null}

        {suggestOpen ? (
          <ul
            id={`${addressFieldId}-suggestions`}
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border-2 border-(--bh-line) bg-(--bh-panel) py-1 shadow-lg"
          >
            {suggestions.map((s, i) => (
              <li key={`${s.lat},${s.lng}`} role="option" aria-selected={i === highlight}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(s)}
                  className={`block w-full px-3.5 py-2.5 text-left text-sm leading-snug ${
                    i === highlight ? "bg-(--bh-blood-tint) text-(--bh-ink)" : "text-(--bh-ink-soft) hover:bg-(--bh-blood-tint)/60"
                  }`}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <input type="hidden" name={latName} value={coords?.lat ?? ""} />
      <input type="hidden" name={lngName} value={coords?.lng ?? ""} />

      {fieldError ? (
        <p className="mt-1.5 text-sm font-medium text-(--bh-blood-deep)">{fieldError}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-snug text-(--bh-ink-soft)">{hint}</p>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locateStatus === "locating"}
          className="bh-focus inline-flex items-center gap-1.5 rounded-lg text-xs font-bold text-(--bh-blood-deep) disabled:opacity-60"
        >
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <circle cx="10" cy="10" r="3" />
            <path strokeLinecap="round" d="M10 1.5v2.2M10 16.3v2.2M18.5 10h-2.2M3.7 10H1.5" />
          </svg>
          {locateStatus === "locating" ? "Finding you…" : "Use my current location"}
        </button>
        <button
          type="button"
          onClick={() => setMapOpen((v) => !v)}
          className="bh-focus text-xs font-semibold text-(--bh-ink-soft) underline-offset-2 hover:text-(--bh-ink) hover:underline"
        >
          {mapOpen ? "Hide map" : "Pick exact spot on map"}
        </button>
        {coords ? (
          <span className="font-mono text-xs text-(--bh-ink-soft)">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        ) : null}
      </div>

      {locateStatus === "denied" ? (
        <p className="mt-2 rounded-lg border border-(--bh-line) bg-(--bh-blood-tint) px-3 py-2 text-xs leading-relaxed text-(--bh-ink)">
          Location permission was denied. You can still search for the address above, or drop a pin on the map.
        </p>
      ) : locateStatus === "unavailable" ? (
        <p className="mt-2 rounded-lg border border-(--bh-line) bg-(--bh-blood-tint) px-3 py-2 text-xs leading-relaxed text-(--bh-ink)">
          Couldn't get your location. Search for the address above, or drop a pin on the map.
        </p>
      ) : null}

      {mapOpen ? (
        <div className="mt-3 overflow-hidden rounded-xl border-2 border-(--bh-line)">
          <MapInner
            center={coords ? [coords.lat, coords.lng] : DEFAULT_CENTER}
            marker={coords}
            onMapClick={handleMapClick}
            onMarkerDragEnd={handleMarkerDragEnd}
          />
          <p className="border-t-2 border-(--bh-line) bg-(--bh-panel) px-3 py-1.5 text-[11px] text-(--bh-ink-soft)">
            Tap the map or drag the pin to set the exact spot.
          </p>
        </div>
      ) : null}
    </div>
  );
}
