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
    /** @type {number} */
    this._animFrame = null;
  }

  init() {
    if (!this._map) return this;
    this._layerGroup = L.layerGroup().addTo(this._map);
    this._drawRoutes();
    this._startAnimation();
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

      // Store reference for animation
      polyline._routeDashOffset = 0;
    }
  }

  /**
   * Animate the dash offset to create flowing effect.
   */
  _startAnimation() {
    let offset = 0;
    const animate = () => {
      offset = (offset + 0.3) % 24;
      if (this._layerGroup) {
        this._layerGroup.eachLayer((layer) => {
          if (layer.setStyle && layer._routeDashOffset !== undefined) {
            layer.setStyle({ dashOffset: String(-offset) });
          }
          // Also try setting via DOM
          if (layer._path) {
            layer._path.style.strokeDashoffset = String(-offset);
          }
        });
      }
      this._animFrame = requestAnimationFrame(animate);
    };
    this._animFrame = requestAnimationFrame(animate);
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
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    if (this._layerGroup) {
      this._layerGroup.clearLayers();
      if (this._map) this._map.removeLayer(this._layerGroup);
      this._layerGroup = null;
    }
    super.destroy();
  }
}

export default RouteLines;
