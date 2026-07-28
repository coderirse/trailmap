// ==========================================================================
// GlobeView — 3D globe using Globe.GL (WebGL), toggle with 2D map
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import store from '../utils/DataStore.js';
import { createElement } from '../utils/helpers.js';

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
    }, '🌍');

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
    // Load Globe.GL if not already available
    if (typeof Globe === 'undefined') {
      try {
        await this._loadScript('https://unpkg.com/globe.gl@2.32.3/dist/globe.gl.min.js');
        this._globeReady = true;
      } catch (e) {
        console.warn('[GlobeView] Failed to load Globe.GL:', e);
        return;
      }
    }

    this._globeActive = true;
    this._toggleBtn.classList.add('active');
    this._toggleBtn.textContent = '🗺️';
    this._toggleBtn.title = '切换地图';
    // Hide only the Leaflet container — NOT #map-container, which also
    // hosts the globe canvas and the pill/stat overlays.
    const mapEl = this._map ? this._map.getContainer() : null;
    if (mapEl) mapEl.style.visibility = 'hidden';
    this._globeEl.classList.add('active');

    // Build globe
    const locations = store.getAll();
    const points = locations.map(loc => ({
      lat: loc.lat,
      lng: loc.lng,
      name: loc.name,
      size: 0.25,
      color: '#4ade80',
    }));

    try {
      this._globe = Globe()(this._globeEl)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg')
        .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
        .pointsData(points)
        .pointColor('color')
        .pointAltitude('size')
        .pointRadius(0.4)
        .pointLabel(d => d.name)
        .pointResolution(12)
        .onPointClick(d => {
          const loc = locations.find(l => l.name === d.name || l.lat === d.lat);
          if (loc) {
            this.notify('globe:markerClick', { id: loc.id, location: loc });
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
    this._toggleBtn.textContent = '🌍';
    this._toggleBtn.title = '3D 地球';
    const mapEl = this._map ? this._map.getContainer() : null;
    if (mapEl) mapEl.style.visibility = '';

    if (this._globeEl) {
      this._globeEl.classList.remove('active');
      this._globeEl.innerHTML = '';
      this._globe = null;
    }

    if (this._map) {
      setTimeout(() => this._map.invalidateSize(), 100);
    }
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
    this._showMap();
    if (this._toggleBtn) { this._toggleBtn.remove(); this._toggleBtn = null; }
    if (this._globeEl) { this._globeEl.remove(); this._globeEl = null; }
    super.destroy();
  }
}

export default GlobeView;
