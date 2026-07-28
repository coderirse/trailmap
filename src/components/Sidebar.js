// ==========================================================================
// Sidebar — Location detail panel
//
// Renders location info (name, date, tags, description) and hosts the
// photo gallery. Communicates via EventBus.
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import PhotoGallery from './PhotoGallery.js';
import { createElement, escapeHtml, setHashRoute } from '../utils/helpers.js';

class Sidebar extends BasePlugin {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container — #sidebar-content DOM node
   * @param {HTMLElement} options.sidebar   — #sidebar DOM node (for open/close classes)
   */
  constructor(options = {}) {
    super(options);
    this.container = options.container;
    this.sidebarEl = options.sidebar;

    // Create photo gallery sub-component
    this.gallery = new PhotoGallery({
      container: this.container,
    });
    this.gallery.init();

    /** Current selected location or null */
    this._currentLocation = null;
  }

  init() {
    // Listen for map marker clicks
    this.listen('map:markerClick', this._onMarkerClick);
    return this;
  }

  /**
   * Open the sidebar with a location's data.
   * @param {Object} location
   */
  open(location) {
    if (!location) return;
    this._currentLocation = location;

    this.container.innerHTML = '';

    // Build the location detail card
    const detail = createElement('div', { className: 'location-detail' });

    // ---- Header ----
    const header = createElement('div', { className: 'location-header' });

    const closeBtn = createElement('button', {
      className: 'close-btn',
      onClick: () => this.close(),
      'aria-label': '关闭',
    }, '×');
    header.appendChild(closeBtn);

    const name = createElement('div', { className: 'location-name' }, escapeHtml(location.name));
    header.appendChild(name);

    const date = createElement('div', { className: 'location-date' }, escapeHtml(location.date));
    header.appendChild(date);

    // Tags
    if (location.tags && location.tags.length) {
      const tagList = createElement('div', { className: 'tag-list' });
      location.tags.forEach((tag) => {
        const span = createElement('span', { className: 'tag' }, escapeHtml(tag));
        tagList.appendChild(span);
      });
      header.appendChild(tagList);
    }

    detail.appendChild(header);

    // ---- Body (description) ----
    const body = createElement('div', { className: 'location-body' });
    const desc = createElement('div', { className: 'location-description' }, location.description || '');
    body.appendChild(desc);
    detail.appendChild(body);

    this.container.appendChild(detail);

    // ---- Photos (rendered below the detail card, after gallery render) ----
    // We insert the photo wrapper at the end of the detail card
    const photoContainer = createElement('div', { className: 'location-photos-wrapper' });
    detail.appendChild(photoContainer);
    this.gallery.container = photoContainer;
    this.gallery.render(location.photos || []);

    // Add open class for mobile
    this.sidebarEl.classList.add('open');

    // Update URL hash
    setHashRoute(location.id);

    // Notify sidebar opened
    this.notify('sidebar:open', { id: location.id });
  }

  /**
   * Close the sidebar and clear content.
   */
  close() {
    this._currentLocation = null;
    this.gallery.clear();
    this.container.innerHTML = `
      <div class="sidebar-placeholder">
        <p>📍 点击地图上的标记查看经历</p>
      </div>
    `;
    this.sidebarEl.classList.remove('open');
    setHashRoute(null);
    this.notify('sidebar:close');
  }

  /**
   * Handle marker click from EventBus.
   * @param {{ location: Object }} data
   */
  _onMarkerClick(data) {
    if (data && data.location) {
      this.open(data.location);
    }
  }

  /**
   * Get the currently displayed location.
   * @returns {Object|null}
   */
  getCurrentLocation() {
    return this._currentLocation;
  }

  destroy() {
    this.gallery.destroy();
    this.close();
    super.destroy();
  }
}

export default Sidebar;
