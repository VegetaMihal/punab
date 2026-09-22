export type BloodHeroGeocodePoint = {
  lat: number;
  lng: number;
};

export type BloodHeroGeocodeSuggestion = BloodHeroGeocodePoint & {
  label: string;
};

// Bangladesh bounding box — clips Photon results so a query like "City Hospital" doesn't
// return a same-named place in another country. Free, no key: https://photon.komoot.io
const BD_BBOX = "88.0,20.5,92.7,26.7"; // minLon,minLat,maxLon,maxLat
// Dhaka — biases ranking toward the capital without hard-excluding the rest of the country.
const BD_BIAS = { lat: 23.8103, lon: 90.4125 };

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

function labelFromProperties(p: NonNullable<PhotonFeature["properties"]>): string {
  const parts = [
    [p.housenumber, p.street].filter(Boolean).join(" ") || undefined,
    p.name,
    p.district,
    p.city,
    p.county,
    p.state,
  ].filter((v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i);
  return parts.length > 0 ? parts.join(", ") : (p.country ?? "Unknown location");
}

function parseFeatures(features: PhotonFeature[]): BloodHeroGeocodeSuggestion[] {
  return features
    .map((f) => {
      const [lng, lat] = f.geometry?.coordinates ?? [];
      if (typeof lat !== "number" || typeof lng !== "number" || !f.properties) return null;
      return { lat, lng, label: labelFromProperties(f.properties) };
    })
    .filter((r): r is BloodHeroGeocodeSuggestion => r !== null);
}

/**
 * Geocode an address with Photon (komoot's free OSM search) — the top match.
 * Returns null on any failure so request/donor flows remain non-blocking.
 */
export async function geocodeBloodHeroAddress(address: string): Promise<BloodHeroGeocodePoint | null> {
  const first = (await searchBloodHeroAddress(address, 1, undefined))[0];
  return first ? { lat: first.lat, lng: first.lng } : null;
}

/**
 * Type-ahead search — top N place matches (hospitals, landmarks, addresses), Bangladesh-biased.
 * Free, no API key: Photon (https://photon.komoot.io), an OSM search index run by komoot.
 * Callers should debounce (see BloodHeroLocationPicker) since this hits the API per call.
 */
export async function searchBloodHeroAddress(
  query: string,
  limit = 5,
  signal?: AbortSignal,
): Promise<BloodHeroGeocodeSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = new URL("https://photon.komoot.io/api/");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("lat", String(BD_BIAS.lat));
  url.searchParams.set("lon", String(BD_BIAS.lon));
  url.searchParams.set("bbox", BD_BBOX);

  try {
    const res = await fetch(url.toString(), { cache: "no-store", signal });
    if (!res.ok) return [];
    const data = (await res.json()) as { features?: PhotonFeature[] };
    return parseFeatures(data.features ?? []);
  } catch {
    return [];
  }
}

/** Reverse geocode a point to a human-readable address, via the same free Photon service. */
export async function reverseGeocodeBloodHeroPoint(lat: number, lng: number): Promise<string | null> {
  try {
    const url = new URL("https://photon.komoot.io/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { features?: PhotonFeature[] };
    const first = parseFeatures(data.features ?? [])[0];
    return first?.label ?? null;
  } catch {
    return null;
  }
}
