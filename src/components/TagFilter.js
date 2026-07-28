// ==========================================================================
// TagFilter — Glass chip buttons to filter map markers by tag
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import store from '../utils/DataStore.js';
import { createElement } from '../utils/helpers.js';

class TagFilter extends BasePlugin {
  constructor(options = {}) {
    super(options);
    /** @type {HTMLElement|null} */
    this._el = null;
    /** @type {Set<string>} */
    this._activeTags = new Set();
    /** @type {Array<{tag: string, count: number}>} */
    this._tagStats = [];
  }

  init() {
    this._tagStats = store.getTagStats();
    if (this._tagStats.length === 0) return this;

    this._buildUI();
    this._el.classList.add('visible');
    return this;
  }

  _buildUI() {
    this._el = createElement('div', { id: 'tag-filter' });

    // "All" chip
    const allChip = createElement('button', {
      className: 'tag-chip active',
      onClick: () => this._clearFilter(),
    }, `全部 · ${store.getAll().length}`);
    this._el.appendChild(allChip);

    this._tagStats.forEach(({ tag, count }) => {
      const chip = createElement('button', {
        className: 'tag-chip',
        'data-tag': tag,
        onClick: () => this._toggleTag(tag),
      }, `${tag} `);
      const countSpan = createElement('span', { className: 'count' }, String(count));
      chip.appendChild(countSpan);
      this._el.appendChild(chip);
    });

    document.getElementById('map-container').appendChild(this._el);
  }

  _toggleTag(tag) {
    if (this._activeTags.has(tag)) {
      this._activeTags.delete(tag);
    } else {
      this._activeTags.add(tag);
    }

    // Update chip UI
    this._el.querySelectorAll('.tag-chip[data-tag]').forEach(chip => {
      const t = chip.dataset.tag;
      chip.classList.toggle('active', this._activeTags.has(t));
    });
    this._el.querySelector('.tag-chip:first-child').classList.toggle('active', this._activeTags.size === 0);

    if (this._activeTags.size === 0) {
      this.notify('tagfilter:change', { tags: [], locations: store.getAll() });
    } else {
      const filtered = store.getAll().filter(loc =>
        loc.tags && loc.tags.some(t => this._activeTags.has(t))
      );
      this.notify('tagfilter:change', { tags: [...this._activeTags], locations: filtered });
    }
  }

  _clearFilter() {
    this._activeTags.clear();
    this._el.querySelectorAll('.tag-chip').forEach((chip, i) => {
      chip.classList.toggle('active', i === 0);
    });
    this.notify('tagfilter:change', { tags: [], locations: store.getAll() });
  }

  destroy() {
    if (this._el) {
      this._el.remove();
      this._el = null;
    }
    super.destroy();
  }
}

export default TagFilter;
