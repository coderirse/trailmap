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
    /** Tile — Esri World Light Gray (keyless); dark-themed via invert filter in map.css */
    tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    /** Service tops out at z16 — upscale tiles beyond that */
    tileMaxNativeZoom: 16,
    /** Attribution — required credits for Esri canvas basemaps */
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
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
