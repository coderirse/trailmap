// ==========================================================================
// StyleSwitcher — Switch between different map tile layers
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import { createElement } from '../utils/helpers.js';

const TILES = [
  {
    key: 'voyager',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    title: '探索',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    className: 'tile-style-voyager',
  },
  {
    key: 'dark',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"/></svg>',
    title: '暗色',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    className: 'tile-style-dark',
  },
  {
    key: 'osm',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    title: '标准',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: 'tile-style-osm',
  },
  {
    key: 'satellite',
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l-9 4v12l9 4 9-4V6l-9-4zm0 2.18l6.9 3.06L12 10.3 5.1 7.24 12 4.18zM5 8.78l6 2.67v8.67l-6-2.67V8.78zm8 11.34V11.45l6-2.67v8.67l-6 2.67z"/></svg>',
    title: '卫星',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    className: 'tile-style-satellite',
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

    // Adopt the tile layer that Map.js already created instead of removing + re-adding it.
    const existingTileLayer = this._findTileLayer();
    if (existingTileLayer) {
      this._activeLayer = existingTileLayer;
      this._current = this._default;
      this._syncButtons();
    } else {
      this._switchTo(this._default);
    }

    return this;
  }

  _findTileLayer() {
    let found = null;
    this._map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) found = layer;
    });
    return found;
  }

  _syncButtons() {
    if (!this._el) return;
    this._el.querySelectorAll('.style-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.style === this._current);
    });
  }

  _buildUI() {
    this._el = createElement('div', { id: 'style-switcher' });

    TILES.forEach((tile) => {
      const btn = createElement('button', {
        className: `style-btn${tile.key === this._current ? ' active' : ''}`,
        'data-style': tile.key,
        title: tile.title,
        onClick: () => this._switchTo(tile.key),
      });
      btn.innerHTML = tile.icon;
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
      className: tile.className,
    }).addTo(this._map);

    this._current = key;

    this._syncButtons();

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
