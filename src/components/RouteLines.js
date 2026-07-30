// ==========================================================================
// RouteLines — Curved connection lines between locations in route groups
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import store from '../utils/DataStore.js';
import config from '../config.js';

class RouteLines extends BasePlugin {
  constructor(options = {}) {
    super(options);
    /** @type {L.Map|null} */
    this._map = options.map;
    /** @type {L.LayerGroup|null} */
    this._layerGroup = null;
  }

  init() {
    if (!this._map) return this;
    this._layerGroup = L.layerGroup().addTo(this._map);
    this._drawRoutes();
    return this;
  }

  /**
   * Draw all route lines defined in config.
   */
  _drawRoutes() {
    const routes = config.routes || [];
    for (const route of routes) {
      const points = [];
      for (const id of route.locations) {
        const loc = store.getById(id);
        if (loc) points.push([loc.lat, loc.lng]);
      }
      if (points.length < 2) continue;

      // Draw a curved (great-circle style) or straight polyline
      const polyline = L.polyline(points, {
        color: route.color || '#22d3ee',
        weight: 1.5,
        opacity: 0.5,
        dashArray: '8 6',
        dashOffset: '0',
        className: 'route-line route-line-animated',
        interactive: false,
      }).addTo(this._layerGroup);

    }
  }

  /**
   * Toggle route visibility.
   * @param {boolean} show
   */
  toggle(show) {
    if (!this._map || !this._layerGroup) return;
    if (show) {
      this._layerGroup.addTo(this._map);
    } else {
      this._map.removeLayer(this._layerGroup);
    }
  }

  destroy() {
    if (this._layerGroup) {
      this._layerGroup.clearLayers();
      if (this._map) this._map.removeLayer(this._layerGroup);
      this._layerGroup = null;
    }
    super.destroy();
  }
}

export default RouteLines;
