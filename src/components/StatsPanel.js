// ==========================================================================
// StatsPanel — Floating panel with trip statistics
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import store from '../utils/DataStore.js';
import { computeStats } from '../utils/stats.js';
import { createElement } from '../utils/helpers.js';

class StatsPanel extends BasePlugin {
  constructor(options = {}) {
    super(options);
    this._el = null;
  }

  init() {
    const locations = store.getAll();
    if (locations.length === 0) return this;

    this._buildUI(computeStats(locations));
    this._el.classList.add('visible');
    return this;
  }

  _buildUI(stats) {
    this._el = createElement('div', { id: 'stats-panel' });

    const items = [
      { value: stats.cityCount, label: '城市' },
      { value: `${stats.totalDist} km`, label: '总里程' },
      { value: stats.tagCount, label: '标签' },
    ];

    items.forEach(({ value, label }) => {
      const item = createElement('div', { className: 'stat-item' });
      const v = createElement('div', { className: 'stat-value' }, String(value));
      const l = createElement('div', { className: 'stat-label' }, label);
      item.appendChild(v);
      item.appendChild(l);
      this._el.appendChild(item);
    });

    document.getElementById('map-container').appendChild(this._el);
  }

  destroy() {
    if (this._el) {
      this._el.remove();
      this._el = null;
    }
    super.destroy();
  }
}

export default StatsPanel;
