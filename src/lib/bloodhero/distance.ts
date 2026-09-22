const EARTH_RADIUS_KM = 6371;

/** Max donor-to-request distance for matching. Keep in sync with 027_bloodhero_matching_radius.sql. */
export const BLOODHERO_MAX_MATCH_RADIUS_KM = 25;

function degToRad(v: number): number {
  return (v * Math.PI) / 180;
}

export function haversineDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const dLat = degToRad(to.lat - from.lat);
  const dLng = degToRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(from.lat)) *
      Math.cos(degToRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}
