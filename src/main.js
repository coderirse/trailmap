// ==========================================================================
// main.js — Application entry point
// ==========================================================================

// ---- Styles ----
import './styles/variables.css';
import './styles/base.css';
import './styles/map.css';
import './styles/sidebar.css';
import './styles/lightbox.css';
import './styles/timeline.css';
import './styles/controls.css';
import './styles/routes.css';

// ---- Modules ----
import eventBus from './utils/EventBus.js';
import store from './utils/DataStore.js';
import { getHashRoute } from './utils/helpers.js';

// ---- Components ----
import MapComponent from './components/Map.js';
import Sidebar from './components/Sidebar.js';
import Lightbox from './components/Lightbox.js';
import Timeline from './components/Timeline.js';
import RouteLines from './components/RouteLines.js';
import TagFilter from './components/TagFilter.js';
import GlobeView from './components/GlobeView.js';
import StatsPanel from './components/StatsPanel.js';
import StyleSwitcher from './components/StyleSwitcher.js';

// ==========================================================================
function bootstrap() {
  const sidebarEl = document.getElementById('sidebar');
  const sidebarContent = document.getElementById('sidebar-content');
  const mapContainer = document.getElementById('map-container');

  // ---- Header stats ----
  const countEl = document.getElementById('location-count');
  if (countEl) countEl.textContent = store.getAll().length;

  // ---- Map ----
  const mapComponent = new MapComponent({ containerId: 'map' });
  mapComponent.init();
  const leafletMap = mapComponent.getMapInstance();

  // ---- Sidebar ----
  const sidebar = new Sidebar({
    container: sidebarContent,
    sidebar: sidebarEl,
  });
  sidebar.init();

  // ---- Lightbox ----
  const lightbox = new Lightbox();
  lightbox.init();

  // ---- Route Lines (flowing dash animation) ----
  const routeLines = new RouteLines({ map: leafletMap });
  routeLines.init();

  // ---- Tag Filter (glass chips at top) ----
  const tagFilter = new TagFilter();
  tagFilter.init();

  // ---- Stats Panel (top-right overlay) ----
  const statsPanel = new StatsPanel();
  statsPanel.init();

  // ---- Style Switcher (tile layer buttons) ----
  const styleSwitcher = new StyleSwitcher({ map: leafletMap });
  styleSwitcher.init();

  // ---- Globe Toggle (3D earth) ----
  const globeView = new GlobeView({ map: leafletMap, mapContainer });
  globeView.init();

  // ---- Timeline (bottom scrubber) ----
  const timeline = new Timeline();
  timeline.init();

  // ---- Cross-component event wiring ----

  // Timeline step → select marker + open sidebar
  eventBus.on('timeline:step', (data) => {
    if (data && data.id) {
      mapComponent.selectById(data.id);
    }
  });

  // Globe marker click → open sidebar (same as map marker click)
  eventBus.on('globe:markerClick', (data) => {
    if (data && data.location) {
      sidebar.open(data.location);
    }
  });

  // ---- URL hash routing ----
  const initialHash = getHashRoute();
  if (initialHash) {
    const location = store.getById(initialHash);
    if (location) {
      setTimeout(() => mapComponent.selectById(initialHash), 400);
    }
  }

  window.addEventListener('hashchange', () => {
    const hash = getHashRoute();
    if (hash) {
      const location = store.getById(hash);
      if (location) mapComponent.selectById(hash);
    } else {
      sidebar.close();
    }
  });

  // ---- Dev tools ----
  if (import.meta.env.DEV) {
    window.__app = {
      mapComponent, sidebar, lightbox, timeline, routeLines,
      tagFilter, globeView, statsPanel, styleSwitcher, store, eventBus,
    };
    console.log('🚀 MyMap ready — window.__app');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
