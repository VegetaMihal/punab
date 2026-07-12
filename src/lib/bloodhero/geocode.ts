export type BloodHeroGeocodePoint = {
  lat: number;
  lng: number;
};

/**
 * Geocode an address with OpenStreetMap Nominatim.
 * Returns null on any failure so request/donor flows remain non-blocking.
 */
export async function geocodeBloodHeroAddress(address: string): Promise<BloodHeroGeocodePoint | null> {
  const q = address.trim();
  if (!q) return null;

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "PUNAB-BloodHero/1.0 (punab.org)",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const rows = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const first = rows[0];
    if (!first?.lat || !first?.lon) return null;

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}
