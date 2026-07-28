// ==========================================================================
// main.js — Application entry point
//
// Initializes all components, wires up the EventBus, and handles
// URL hash routing for restoring state on page load.
// ==========================================================================

// ---- Styles ----
import './styles/variables.css';
import './styles/base.css';
import './styles/map.css';
import './styles/sidebar.css';
import './styles/lightbox.css';

// ---- Modules ----
import eventBus from './utils/EventBus.js';
import store from './utils/DataStore.js';
import { getHashRoute } from './utils/helpers.js';

// ---- Components ----
import MapComponent from './components/Map.js';
import Sidebar from './components/Sidebar.js';
import Lightbox from './components/Lightbox.js';

// ==========================================================================
// Application Bootstrap
// ==========================================================================

function bootstrap() {
  // Get DOM references
  const sidebarEl = document.getElementById('sidebar');
  const sidebarContent = document.getElementById('sidebar-content');

  // ---- Fill header stats ----
  const countEl = document.getElementById('location-count');
  if (countEl) countEl.textContent = store.getAll().length;

  // ---- Initialize Map ----
  const mapComponent = new MapComponent({
    containerId: 'map',
  });
  mapComponent.init();

  // ---- Initialize Sidebar ----
  const sidebar = new Sidebar({
    container: sidebarContent,
    sidebar: sidebarEl,
  });
  sidebar.init();

  // ---- Initialize Lightbox ----
  const lightbox = new Lightbox();
  lightbox.init();

  // ---- URL hash routing — restore state on load ----
  const initialHash = getHashRoute();
  if (initialHash) {
    const location = store.getById(initialHash);
    if (location) {
      // Small delay to let the map finish initializing
      setTimeout(() => {
        mapComponent.selectById(initialHash);
      }, 300);
    }
  }

  // Listen for hash changes (browser back/forward)
  window.addEventListener('hashchange', () => {
    const hash = getHashRoute();
    if (hash) {
      const location = store.getById(hash);
      if (location) {
        mapComponent.selectById(hash);
      }
    } else {
      // Hash cleared — close sidebar
      sidebar.close();
    }
  });

  // ---- Debug: expose key APIs to window for development ----
  if (import.meta.env.DEV) {
    window.__app = {
      mapComponent,
      sidebar,
      store,
      eventBus,
    };
    console.log('🚀 MyMap ready. Try window.__app in the console.');
  }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
