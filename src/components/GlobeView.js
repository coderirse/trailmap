// ==========================================================================
// GlobeView — 3D globe using Globe.GL (WebGL), toggle with 2D map
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import store from '../utils/DataStore.js';
import { createElement } from '../utils/helpers.js';

// Vendored locally (public/vendor/) so the globe works offline and behind
// slow networks; falls back to the pinned version on unpkg if missing.
const GLOBE_SCRIPT_SOURCES = [
  './vendor/globe.gl.min.js',
  'https://unpkg.com/globe.gl@2.32.3/dist/globe.gl.min.js',
];
const EARTH_TEXTURE_URL = './vendor/earth-dark.jpg';
const SKY_TEXTURE_URL = './vendor/night-sky.png';

const GLOBE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';

class GlobeView extends BasePlugin {
  constructor(options = {}) {
    super(options);
    /** @type {L.Map|null} */
    this._map = options.map;
    this._mapContainer = options.mapContainer;
    /** @type {HTMLElement|null} */
    this._toggleBtn = null;
    /** @type {HTMLElement|null} */
    this._globeEl = null;
    /** @type {boolean} */
    this._globeActive = false;
    /** @type {any|null} */
    this._globe = null;
    this._globeReady = false;
  }

  init() {
    this._buildUI();
    this._toggleBtn.classList.add('visible');
    return this;
  }

  _buildUI() {
    this._toggleBtn = createElement('button', {
      id: 'globe-toggle',
      title: '3D 地球',
      onClick: () => this._toggle(),
    });
    this._toggleBtn.innerHTML = GLOBE_ICON;

    this._globeEl = createElement('div', { id: 'globe-container' });
    document.getElementById('map-container').appendChild(this._toggleBtn);
    document.getElementById('map-container').appendChild(this._globeEl);
  }

  async _toggle() {
    if (this._globeActive) {
      this._showMap();
    } else {
      await this._showGlobe();
    }
  }

  async _showGlobe() {
    // Load Globe.GL if not already available (local vendor file first, CDN fallback)
    if (typeof Globe === 'undefined') {
      try {
        await this._loadScriptFromSources(GLOBE_SCRIPT_SOURCES);
        this._globeReady = true;
      } catch (e) {
        console.warn('[GlobeView] Failed to load Globe.GL:', e);
        return;
      }
    }

    this._globeActive = true;
    this._toggleBtn.classList.add('active');
    this._toggleBtn.innerHTML = GLOBE_ICON;
    this._toggleBtn.title = '切换地图';
    // Hide only the Leaflet container — NOT #map-container, which also
    // hosts the globe canvas and the pill/stat overlays.
    const mapEl = this._map ? this._map.getContainer() : null;
    if (mapEl) mapEl.style.visibility = 'hidden';
    this._globeEl.classList.add('active');

    // If globe was already built, just resume it.
    if (this._globe) {
      this._globe.controls().autoRotate = true;
      return;
    }

    // Build globe
    const locations = store.getAll();
    const markerColor = '#D4A853';
    const points = locations.map(loc => ({
      id: loc.id,
      lat: loc.lat,
      lng: loc.lng,
      name: loc.name,
      size: 0.25,
      color: markerColor,
    }));

    try {
      this._globe = Globe()(this._globeEl)
        .globeImageUrl(EARTH_TEXTURE_URL)
        .backgroundImageUrl(SKY_TEXTURE_URL)
        .pointsData(points)
        .pointColor('color')
        .pointAltitude('size')
        .pointRadius(0.4)
        .pointLabel(d => d.name)
        .pointResolution(12)
        .onPointClick(d => {
          // Exact match via the id carried on the point datum
          const loc = store.getById(d.id);
          if (loc) {
            this.notify('globe:markerClick', { id: d.id, location: loc });
          }
        });

      // Auto-rotate slowly
      this._globe.controls().autoRotate = true;
      this._globe.controls().autoRotateSpeed = 0.4;
    } catch (e) {
      console.warn('[GlobeView] Globe init error:', e);
      this._showMap();
    }
  }

  _showMap() {
    this._globeActive = false;
    this._toggleBtn.classList.remove('active');
    this._toggleBtn.innerHTML = GLOBE_ICON;
    this._toggleBtn.title = '3D 地球';
    const mapEl = this._map ? this._map.getContainer() : null;
    if (mapEl) mapEl.style.visibility = '';

    if (this._globeEl) {
      this._globeEl.classList.remove('active');
    }

    // Pause rotation instead of destroying the globe so switching back is instant.
    if (this._globe) {
      try { this._globe.controls().autoRotate = false; } catch (e) { /* ignore */ }
    }

    if (this._map) {
      setTimeout(() => this._map.invalidateSize(), 100);
    }
  }

  _loadScriptFromSources(sources) {
    return sources.reduce((chain, src) => chain.catch(() => this._loadScript(src)),
      Promise.reject(new Error('no sources')));
  }

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  destroy() {
    this._globeActive = false;
    if (this._globeEl) { this._globeEl.innerHTML = ''; this._globeEl.remove(); this._globeEl = null; }
    this._globe = null;
    if (this._toggleBtn) { this._toggleBtn.remove(); this._toggleBtn = null; }
    super.destroy();
  }
}

export default GlobeView;
