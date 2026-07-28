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
    return this;
  }

  /**
   * Initialize the Leaflet map instance.
   */
  _initMap() {
    const { center, zoom, minZoom, maxZoom, tileUrl, attribution } = config.map;

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
    }).addTo(this._map);

    // Invalidate size on window resize
    window.addEventListener('resize', () => {
      this._map.invalidateSize();
    });

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
      iconSize: [20, 20],
      iconAnchor: [10, 10],
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

    // Deactivate previous
    this._deselectMarker();

    // Activate this one
    marker.setIcon(this._createIcon(true));
    this._activeMarkerId = id;

    // Pan map with an offset so the marker isn't hidden behind the sidebar
    const targetLatLng = marker.getLatLng();
    // Offset the map center: shift left by ~15% of sidebar width so the point is visible
    const size = this._map.getSize();
    const offsetX = -(size.x * 0.15);
    const panPoint = this._map.project(targetLatLng).add([offsetX, 0]);
    const adjustedLatLng = this._map.unproject(panPoint);

    this._map.panTo(adjustedLatLng, {
      animate: true,
      duration: 0.4,
    });

    // Notify via EventBus
    this.notify('map:markerClick', { id, location });
  }

  /**
   * Deselect the currently active marker.
   */
  _deselectMarker() {
    if (this._activeMarkerId) {
      const prevMarker = this._markers.get(this._activeMarkerId);
      if (prevMarker) {
        prevMarker.setIcon(this._createIcon(false));
      }
      this._activeMarkerId = null;
      this.notify('sidebar:close');
    }
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

  destroy() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    this._markers.clear();
    super.destroy();
  }
}

export default MapComponent;
