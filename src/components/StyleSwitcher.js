// ==========================================================================
// StyleSwitcher — Switch between different map tile layers
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import { createElement } from '../utils/helpers.js';

const TILES = [
  {
    key: 'voyager',
    label: '🗺',
    title: '探索',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  {
    key: 'dark',
    label: '🌙',
    title: '暗色',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  {
    key: 'osm',
    label: '🗺️',
    title: '标准',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  {
    key: 'satellite',
    label: '🛰',
    title: '卫星',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
];

class StyleSwitcher extends BasePlugin {
  constructor(options = {}) {
    super(options);
    /** @type {L.Map|null} */
    this._map = options.map;
    /** @type {HTMLElement|null} */
    this._el = null;
    /** @type {L.TileLayer|null} */
    this._activeLayer = null;
    /** @type {string} key of the style applied on init */
    this._default = 'voyager';
    /** @type {string|null} currently active style (null until first switch) */
    this._current = null;
  }

  init() {
    if (!this._map) return this;
    this._buildUI();
    this._el.classList.add('visible');

    // Replace default tile layer with current style
    this._switchTo(this._default);

    return this;
  }

  _buildUI() {
    this._el = createElement('div', { id: 'style-switcher' });

    TILES.forEach((tile) => {
      const btn = createElement('button', {
        className: `style-btn${tile.key === this._current ? ' active' : ''}`,
        'data-style': tile.key,
        title: tile.title,
        onClick: () => this._switchTo(tile.key),
      }, tile.label);
      this._el.appendChild(btn);
    });

    document.getElementById('map-container').appendChild(this._el);
  }

  _switchTo(key) {
    const tile = TILES.find(t => t.key === key);
    if (!tile || key === this._current) return;

    // Remove old layer(s)
    this._map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        this._map.removeLayer(layer);
      }
    });

    // Add new layer
    this._activeLayer = L.tileLayer(tile.url, {
      attribution: tile.attribution,
      maxZoom: 18,
    }).addTo(this._map);

    this._current = key;

    // Update button states
    this._el.querySelectorAll('.style-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.style === key);
    });

    this.notify('style:change', { style: key });
  }

  destroy() {
    if (this._el) {
      this._el.remove();
      this._el = null;
    }
    super.destroy();
  }
}

export default StyleSwitcher;
