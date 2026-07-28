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
    /** Tile layer — CARTO Dark Matter (dark basemap for the glass theme) */
    tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    /** Attribution (required by OSM & CARTO) */
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

  /** Route groups — each entry draws a line connecting the listed location ids */
  routes: [
    {
      id: 'east-china',
      name: '江南行',
      locations: ['beijing', 'shanghai', 'hangzhou'],
      color: '#22d3ee',
    },
  ],
};

export default config;
