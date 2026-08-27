// ==========================================================================
// Map — Leaflet map initialization and marker management
//
// Wraps Leaflet.js. All marker interactions go through EventBus.
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import config from '../config.js';
import store from '../utils/DataStore.js';

class MapComponent extends BasePlugin {
  /**
   * @param {Object} options
   * @param {string} options.containerId — DOM id of the map container
   */
  constructor(options = {}) {
    super(options);
    this.containerId = options.containerId;
    /** @type {L.Map|null} */
    this._map = null;
    /** @type {Map<string, L.Marker>} id → marker */
    this._markers = new Map();
    /** @type {string|null} currently active marker id */
    this._activeMarkerId = null;
  }

  init() {
    this._initMap();
    this._addMarkers();
    this._fitAllMarkers();

    // Listen for tag filter changes
    this.listen('tagfilter:change', this._onTagFilterChange);

    return this;
  }

  /**
   * Initialize the Leaflet map instance.
   */
  _initMap() {
    const { center, zoom, minZoom, maxZoom, tileUrl, tileMaxNativeZoom, attribution } = config.map;

    this._map = L.map(this.containerId, {
      center: [center.lat, center.lng],
      zoom,
      minZoom,
      maxZoom,
      zoomControl: false,
    });

    // Zoom control at bottom-left so it doesn't collide with the header card
    L.control.zoom({ position: 'bottomleft' }).addTo(this._map);

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom,
      maxNativeZoom: tileMaxNativeZoom,
      className: 'tile-style-inverted',
    }).addTo(this._map);

    // Invalidate size on window resize
    this._resizeHandler = () => {
      if (this._map) this._map.invalidateSize();
    };
    window.addEventListener('resize', this._resizeHandler);

    // On mobile, clicking empty map area closes sidebar
    this._map.on('click', () => {
      // Only if clicking a blank area (not a marker)
      this._deselectMarker();
    });
  }

  /**
   * Create a custom DivIcon for markers.
   * @param {boolean} isActive
   * @returns {L.DivIcon}
   */
  _createIcon(isActive = false) {
    const className = isActive ? 'custom-marker active' : 'custom-marker';
    return L.divIcon({
      className,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -10],
    });
  }

  /**
   * Add all markers from the data store.
   */
  _addMarkers() {
    const locations = store.getAll();
    for (const loc of locations) {
      const marker = L.marker([loc.lat, loc.lng], {
        icon: this._createIcon(false),
      });

      // Bind click handler
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        this._selectMarker(loc.id);
      });

      marker.addTo(this._map);
      this._markers.set(loc.id, marker);
    }
  }

  /**
   * Auto-fit the map to show all markers.
   */
  _fitAllMarkers() {
    const locations = store.getAll();
    if (locations.length === 0) return;

    const bounds = locations.map((loc) => [loc.lat, loc.lng]);
    this._map.fitBounds(bounds, {
      paddingTopLeft: [20, 20],
      paddingBottomRight: [20, 20], // slight padding so markers aren't cut off
    });
  }

  /**
   * Select (activate) a marker and emit event.
   * @param {string} id - location id
   */
  _selectMarker(id) {
    const marker = this._markers.get(id);
    const location = store.getById(id);
    if (!marker || !location) return;

    // Reset previous active marker without emitting events (the new
    // selection below will open/replace the sidebar content anyway)
    this._resetMarkerVisuals();

    // Dim all other markers
    this._dimOthers(id);

    // Activate this one
    marker.setIcon(this._createIcon(true));
    this._activeMarkerId = id;

    // Smooth flyTo (Griffin-style: slow, editorial)
    // Offset target to the right of center so the detail panel doesn't cover it.
    const targetLatLng = marker.getLatLng();
    const size = this._map.getSize();
    const navWidth = window.innerWidth > 768 ? config.ui.navWidth : 0;
    const offsetX = -(navWidth / 2 + size.x * 0.02);
    const panPoint = this._map.project(targetLatLng).add([offsetX, 0]);
    const adjustedLatLng = this._map.unproject(panPoint);

    this._map.flyTo(adjustedLatLng, this._map.getZoom(), {
      animate: true,
      duration: config.ui.flyToDuration,
      easeLinearity: 0.25,
    });

    // Notify via EventBus
    this.notify('map:markerClick', { id, location });
  }

  /**
   * Dim all markers except the active one.
   * @param {string} activeId
   */
  _dimOthers(activeId) {
    this._markers.forEach((m, id) => {
      const el = m.getElement();
      if (el) {
        el.classList.toggle('dimmed', id !== activeId);
      }
    });
  }

  /**
   * Reset all marker visuals (dimmed state + active icon) without emitting
   * events. Used internally when switching the active marker.
   */
  _resetMarkerVisuals() {
    this._markers.forEach((m) => {
      const el = m.getElement();
      if (el) el.classList.remove('dimmed');
    });

    if (this._activeMarkerId) {
      const prevMarker = this._markers.get(this._activeMarkerId);
      if (prevMarker) prevMarker.setIcon(this._createIcon(false));
      this._activeMarkerId = null;
    }
  }

  /**
   * Deselect the currently active marker (blank map click) and ask the
   * sidebar to close.
   */
  _deselectMarker() {
    const hadActive = this._activeMarkerId !== null;
    this._resetMarkerVisuals();
    if (hadActive) this.notify('sidebar:close');
  }

  /**
   * Programmatically select a marker by location id.
   * Used for restoring state from URL hash.
   * @param {string} id
   */
  selectById(id) {
    if (this._markers.has(id)) {
      this._selectMarker(id);
    }
  }

  /**
   * Return the Leaflet map instance (for external use if needed).
   * @returns {L.Map|null}
   */
  getMapInstance() {
    return this._map;
  }

  /**
   * Handle tag filter change — show/hide markers.
   * @param {{ tags: string[], locations: Array }} data
   */
  _onTagFilterChange(data) {
    const filteredIds = new Set((data.locations || []).map(l => l.id));

    this._markers.forEach((marker, id) => {
      if (filteredIds.has(id)) {
        if (!this._map.hasLayer(marker)) marker.addTo(this._map);
      } else {
        if (this._map.hasLayer(marker)) this._map.removeLayer(marker);
      }
    });

    // If the active marker was filtered out, clear its active state and
    // close the detail panel so the UI state stays in sync
    if (this._activeMarkerId && !filteredIds.has(this._activeMarkerId)) {
      this._resetMarkerVisuals();
      this.notify('sidebar:close');
    }
  }

  destroy() {
    if (this._resizeHandler) {
      window.removeEventListener('resize', this._resizeHandler);
      this._resizeHandler = null;
    }
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    this._markers.clear();
    this._activeMarkerId = null;
    super.destroy();
  }
}

export default MapComponent;
