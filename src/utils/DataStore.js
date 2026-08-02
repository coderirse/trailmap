// ==========================================================================
// DataStore — Data access abstraction layer
//
// All data queries go through this class. If the data source changes
// (e.g. from a local JSON to a remote API or localStorage), only this
// file needs to be modified.
// ==========================================================================

import locationsData from '../data/locations.json';

class DataStore {
  constructor() {
    /** @type {Array} */
    this._locations = locationsData.locations || [];
  }

  /**
   * Return all locations.
   * @returns {Array}
   */
  getAll() {
    return [...this._locations];
  }

  /**
   * Get a location by its unique id.
   * @param {string} id
   * @returns {Object|undefined}
   */
  getById(id) {
    return this._locations.find((loc) => loc.id === id);
  }

  /**
   * Get all unique tags across locations, with counts.
   * @returns {Array<{tag: string, count: number}>}
   */
  getTagStats() {
    const counts = new Map();
    for (const loc of this._locations) {
      if (loc.tags) {
        for (const tag of loc.tags) {
          counts.set(tag, (counts.get(tag) || 0) + 1);
        }
      }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Reload data from a custom source (for future API integration).
   * @param {Array} locations
   */
  load(locations) {
    this._locations = locations || [];
  }
}

// Singleton instance
const store = new DataStore();
export default store;
