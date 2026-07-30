// ==========================================================================
// main.js — Bootstrap (Griffin editorial edition)
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

function bootstrap() {
  // DOM refs for the new layout
  const navList       = document.getElementById('nav-locations');
  const navStats      = document.getElementById('nav-stats');
  const detailPanel   = document.getElementById('detail-panel');
  const sidebarContent= document.getElementById('sidebar-content');
  const mapContainer  = document.getElementById('map-container');
  const countEl       = document.getElementById('location-count');

  // Header stat
  if (countEl) countEl.textContent = store.getAll().length;

  // ---- Map ----
  const mapComponent = new MapComponent({ containerId: 'map' });
  mapComponent.init();
  const leafletMap = mapComponent.getMapInstance();

  // ---- Sidebar (left nav + detail panel) ----
  const sidebar = new Sidebar({
    container: sidebarContent,
    navList,
    navStats,
    detailPanel,
  });
  sidebar.init();

  // ---- Lightbox ----
  const lightbox = new Lightbox();
  lightbox.init();

  // ---- Route Lines ----
  const routeLines = new RouteLines({ map: leafletMap });
  routeLines.init();

  // ---- Tag Filter ----
  const tagFilter = new TagFilter();
  tagFilter.init();

  // ---- Stats Panel (map overlay) ----
  const statsPanel = new StatsPanel();
  statsPanel.init();

  // ---- Style Switcher ----
  const styleSwitcher = new StyleSwitcher({ map: leafletMap });
  styleSwitcher.init();

  // ---- Globe Toggle ----
  const globeView = new GlobeView({ map: leafletMap, mapContainer });
  globeView.init();

  // ---- Timeline ----
  const timeline = new Timeline();
  timeline.init();

  // ---- Timeline → map ----
  eventBus.on('timeline:step', (data) => {
    if (data && data.id) mapComponent.selectById(data.id);
  });

  // ---- Globe → sidebar ----
  eventBus.on('globe:markerClick', (data) => {
    if (data && data.location) sidebar.open(data.location);
  });

  // ---- Nav click / timeline → map pan ----
  // (avoid loop: map emits map:markerClick → sidebar opens;
  //  nav emits nav:locationSelect → map selects marker)
  eventBus.on('nav:locationSelect', (data) => {
    if (data && data.id) mapComponent.selectById(data.id);
  });

  // ---- URL hash routing ----
  const initialHash = getHashRoute();
  if (initialHash) {
    const loc = store.getById(initialHash);
    if (loc) {
      leafletMap.whenReady(() => mapComponent.selectById(initialHash));
    }
  }

  window.addEventListener('hashchange', () => {
    const hash = getHashRoute();
    if (hash) {
      const loc = store.getById(hash);
      if (loc) mapComponent.selectById(hash);
    } else {
      sidebar.close();
    }
  });

  // ---- Mobile: drawer handle toggles nav ----
  const drawerHandle = document.getElementById('nav-drawer-handle');
  const navBackdrop = document.getElementById('nav-backdrop');
  const sidebarNav = document.getElementById('sidebar');

  function openMobileNav() {
    document.body.classList.add('nav-open');
    sidebarNav.classList.add('open');
    navBackdrop.classList.add('open');
    drawerHandle.setAttribute('aria-label', '关闭导航');
  }
  function closeMobileNav() {
    document.body.classList.remove('nav-open');
    sidebarNav.classList.remove('open');
    navBackdrop.classList.remove('open');
    drawerHandle.setAttribute('aria-label', '打开导航');
  }

  drawerHandle.addEventListener('click', () => {
    if (sidebarNav.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  navBackdrop.addEventListener('click', closeMobileNav);

  // Selecting a location on mobile auto-closes the nav drawer
  eventBus.on('nav:locationSelect', () => {
    if (window.innerWidth <= 768) closeMobileNav();
  });
  eventBus.on('map:markerClick', () => {
    if (window.innerWidth <= 768) closeMobileNav();
  });

  // ---- Dev ----
  if (import.meta.env.DEV) {
    window.__app = { mapComponent, sidebar, lightbox, timeline, routeLines,
      tagFilter, globeView, statsPanel, styleSwitcher, store, eventBus };
    console.log('TRAIL MAP — Griffin edition');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
