// ==========================================================================
// Geo — Geographic calculation utilities (reserved for future use)
// ==========================================================================

/**
 * Calculate distance between two points using the Haversine formula.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} Distance in kilometers
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Compute a LatLngBounds-compatible bounding box from an array of points.
 * Leaflet's L.latLngBounds can take this array directly.
 * @param {Array<{lat: number, lng: number}>} points
 * @returns {{ southWest: [number, number], northEast: [number, number]} | null}
 */
export function computeBoundingBox(points) {
  if (!points || points.length === 0) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  }

  return {
    southWest: [minLat, minLng],
    northEast: [maxLat, maxLng],
  };
}

/**
 * Compute the center point of a set of coordinates.
 * @param {Array<{lat: number, lng: number}>} points
 * @returns {{ lat: number, lng: number } | null}
 */
export function computeCenter(points) {
  if (!points || points.length === 0) return null;
  const total = points.reduce(
    (acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }),
    { lat: 0, lng: 0 }
  );
  return {
    lat: total.lat / points.length,
    lng: total.lng / points.length,
  };
}
