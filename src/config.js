// ==========================================================================
// Global Configuration
// ==========================================================================

const config = {
  /** Map settings */
  map: {
    /** Default center */
    center: { lat: 35.0, lng: 110.0 },
    /** Default zoom */
    zoom: 5,
    /** Zoom constraints */
    minZoom: 3,
    maxZoom: 18,
    /** Tile — CARTO Voyager (light); dark-themed via invert filter in map.css */
    tileUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    /** Attribution — CARTO Voyager requires OSM + CARTO credits */
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },

  /** UI settings */
  ui: {
    /** Nav width in px */
    navWidth: 300,
    /** Fly-to duration in seconds */
    flyToDuration: 1.2,
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
      color: '#D4A853',
    },
  ],
};

export default config;
