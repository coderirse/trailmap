// ==========================================================================
// Global Configuration
// ==========================================================================

const config = {
  /** Map settings */
  map: {
    /** Default center (used as fallback if no data) */
    center: { lat: 35.0, lng: 105.0 },
    /** Default zoom level */
    zoom: 5,
    /** Zoom constraints */
    minZoom: 3,
    maxZoom: 18,
    /** Tile layer */
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    /** Attribution (required by OSM) */
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },

  /** UI settings */
  ui: {
    /** Sidebar width on desktop (fraction of flex-basis) */
    sidebarWidth: 0.3,
    /** Marker size in px */
    markerSize: 20,
    /** Animation duration in seconds */
    panDuration: 0.4,
  },

  /** App meta */
  meta: {
    title: '我的足迹地图',
    version: '1.0.0',
  },
};

export default config;
