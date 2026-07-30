// ==========================================================================
// Sidebar — Left nav location list + detail panel (Griffin editorial)
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import PhotoGallery from './PhotoGallery.js';
import store from '../utils/DataStore.js';
import { createElement, escapeHtml, setHashRoute } from '../utils/helpers.js';
import { haversineDistance } from '../utils/geo.js';

class Sidebar extends BasePlugin {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container   — #sidebar-content (detail panel)
   * @param {HTMLElement} options.navList     — #nav-locations container
   * @param {HTMLElement} options.navStats    — #nav-stats container
   * @param {HTMLElement} options.detailPanel — #detail-panel element
   */
  constructor(options = {}) {
    super(options);
    this.container     = options.container;
    this.navList       = options.navList;
    this.navStats      = options.navStats;
    this.detailPanel   = options.detailPanel;

    this.gallery = new PhotoGallery({ container: this.container });
    this.gallery.init();

    this._currentLocation = null;
    this._locations = [];
  }

  init() {
    this._locations = store.getAll();

    // Listen for map marker clicks
    this.listen('map:markerClick', this._onMarkerClick);

    // Listen for timeline steps
    this.listen('timeline:step', this._onMarkerClick);

    // Close detail panel when map blank area is clicked
    this.listen('sidebar:close', this.close);

    // Build nav
    this._buildNav();
    this._buildStats();

    return this;
  }

  /* ========================================================================
     Left navigation list
     ======================================================================== */

  _buildNav() {
    if (!this.navList) return;
    this.navList.innerHTML = '';

    this._locations.forEach((loc, i) => {
      const item = createElement('div', {
        className: 'nav-item',
        'data-id': loc.id,
        style: `--index: ${i}`,
        onClick: () => this._onNavClick(loc.id),
      });

      // Index number
      const index = createElement('span', { className: 'nav-item-index' },
        String(i + 1).padStart(2, '0'));
      item.appendChild(index);

      // Dot
      const dot = createElement('div', { className: 'nav-item-dot' });
      item.appendChild(dot);

      // Name + tag
      const content = createElement('div', { className: 'nav-item-content' });
      const name = createElement('div', { className: 'nav-item-name' }, escapeHtml(loc.name));
      content.appendChild(name);

      if (loc.tags && loc.tags.length) {
        const tag = createElement('div', { className: 'nav-item-tag' }, loc.tags[0].toUpperCase());
        content.appendChild(tag);
      }
      item.appendChild(content);

      this.navList.appendChild(item);
    });
  }

  _onNavClick(id) {
    const location = store.getById(id);
    if (!location) return;

    // Update nav active state immediately
    this.navList.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });

    // Notify → main.js → map.selectById → emits map:markerClick → sidebar opens
    this.notify('nav:locationSelect', { id, location });
  }

  /* ========================================================================
     Stats footer
     ======================================================================== */

  _buildStats() {
    if (!this.navStats) return;

    const locations = store.getAll();
    const count = locations.length;

    // Total distance
    const sorted = [...locations].sort((a, b) => a.date.localeCompare(b.date));
    let dist = 0;
    for (let i = 1; i < sorted.length; i++) {
      dist += haversineDistance(
        sorted[i - 1].lat, sorted[i - 1].lng,
        sorted[i].lat, sorted[i].lng
      );
    }
    const totalKm = Math.round(dist);

    // Tag count
    const tags = new Set();
    locations.forEach(l => l.tags && l.tags.forEach(t => tags.add(t)));

    this.navStats.innerHTML = `
      <div>
        <div class="nav-stat-value">${String(count).padStart(2, '0')}</div>
        <div class="nav-stat-label">城市</div>
      </div>
      <div>
        <div class="nav-stat-value">${totalKm.toLocaleString()}</div>
        <div class="nav-stat-label">KM 总里程</div>
      </div>
      <div>
        <div class="nav-stat-value">${String(tags.size).padStart(2, '0')}</div>
        <div class="nav-stat-label">标签</div>
      </div>
    `;
  }

  /* ========================================================================
     Detail panel
     ======================================================================== */

  open(location) {
    if (!location) return;
    this._currentLocation = location;

    this.container.innerHTML = '';

    const detail = createElement('div', { className: 'location-detail open' });

    // Header
    const header = createElement('div', { className: 'location-header' });

    const closeBtn = createElement('button', {
      className: 'close-btn',
      onClick: () => this.close(),
      'aria-label': '关闭',
    }, '×');
    header.appendChild(closeBtn);

    header.appendChild(createElement('div', { className: 'location-name' }, escapeHtml(location.name)));
    header.appendChild(createElement('div', { className: 'location-date' }, escapeHtml(location.date)));

    if (location.tags && location.tags.length) {
      const tagList = createElement('div', { className: 'tag-list' });
      location.tags.forEach(tag => {
        tagList.appendChild(createElement('span', { className: 'tag' }, escapeHtml(tag)));
      });
      header.appendChild(tagList);
    }

    detail.appendChild(header);

    // Description
    const body = createElement('div', { className: 'location-body' });
    body.appendChild(createElement('div', { className: 'location-description' }, location.description || ''));
    detail.appendChild(body);

    // Photos
    const photoWrapper = createElement('div', { className: 'location-photos-wrapper' });
    detail.appendChild(photoWrapper);
    this.gallery.container = photoWrapper;
    this.gallery.render(location.photos || []);

    this.container.appendChild(detail);

    // Show detail panel
    this.detailPanel.classList.add('open');
    setHashRoute(location.id);
    this.notify('sidebar:open', { id: location.id });
  }

  close() {
    this._currentLocation = null;
    this.gallery.clear();
    // #detail-panel hosts only the fixed-position .location-detail;
    // leaving static content here would leak into the flex layout.
    this.container.innerHTML = '';

    this.detailPanel.classList.remove('open');
    this.navList.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    setHashRoute(null);
    this.notify('sidebar:close');
  }

  _onMarkerClick(data) {
    if (!data || !data.location) return;
    // Update nav active
    this.navList.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === data.location.id);
    });
    this.open(data.location);
  }

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
