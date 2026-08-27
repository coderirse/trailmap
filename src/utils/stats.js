// ==========================================================================
// Stats — Shared trip statistics computation
//
// Single source of truth for the summary numbers shown in the sidebar
// footer and the floating stats panel.
// ==========================================================================

import { haversineDistance } from './geo.js';

/**
 * Compute trip statistics for a list of locations.
 * Total distance sums consecutive great-circle legs after sorting by date.
 * @param {Array} locations
 * @returns {{ cityCount: number, totalDist: number, tagCount: number }}
 */
export function computeStats(locations) {
  const cityCount = locations.length;

  const sorted = [...locations].sort((a, b) => a.date.localeCompare(b.date));
  let totalDist = 0;
  for (let i = 1; i < sorted.length; i++) {
    totalDist += haversineDistance(
      sorted[i - 1].lat, sorted[i - 1].lng,
      sorted[i].lat, sorted[i].lng
    );
  }

  const tags = new Set();
  locations.forEach(l => l.tags && l.tags.forEach(t => tags.add(t)));

  return {
    cityCount,
    totalDist: Math.round(totalDist),
    tagCount: tags.size,
  };
}
