// ==========================================================================
// Timeline — Bottom scrubber bar with play/pause animation
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import store from '../utils/DataStore.js';
import { createElement } from '../utils/helpers.js';

class Timeline extends BasePlugin {
  constructor(options = {}) {
    super(options);
    /** @type {HTMLElement|null} */
    this._el = null;
    /** @type {HTMLElement|null} */
    this._track = null;
    /** @type {HTMLElement|null} */
    this._thumb = null;
    /** @type {HTMLElement|null} */
    this._progress = null;
    /** @type {HTMLElement|null} */
    this._label = null;
    /** @type {HTMLElement|null} */
    this._playBtn = null;

    /** @type {Array} sorted locations by date */
    this._locations = [];
    /** @type {number} */
    this._stepIndex = -1;
    /** @type {boolean} */
    this._playing = false;
    /** @type {number|null} */
    this._timer = null;

    this._onTrackClick = this._onTrackClick.bind(this);
  }

  init() {
    this._locations = store.getAll().sort((a, b) => a.date.localeCompare(b.date));
    if (this._locations.length < 2) return this;

    this._buildUI();
    this._el.classList.add('visible');
    return this;
  }

  _buildUI() {
    this._el = createElement('div', { id: 'timeline' });

    // Play button
    this._playBtn = createElement('button', {
      className: 'timeline-play',
      onClick: () => this._togglePlay(),
      'aria-label': '播放时间线',
    }, '▶');
    this._el.appendChild(this._playBtn);

    // Track
    this._track = createElement('div', {
      className: 'timeline-track',
      onClick: this._onTrackClick,
    });

    const rail = createElement('div', { className: 'timeline-rail' });
    this._track.appendChild(rail);

    this._progress = createElement('div', { className: 'timeline-progress' });
    this._track.appendChild(this._progress);

    // Dots
    this._locations.forEach((loc, i) => {
      const dot = createElement('div', {
        className: 'timeline-dot',
        'data-index': i,
        style: `left: ${(i / (this._locations.length - 1)) * 100}%`,
        title: loc.name,
      });
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        this._goToStep(i);
      });
      this._track.appendChild(dot);
    });

    this._thumb = createElement('div', {
      className: 'timeline-thumb',
      style: 'left: 0%',
    });
    this._track.appendChild(this._thumb);

    this._el.appendChild(this._track);

    // Date label
    this._label = createElement('span', { className: 'timeline-label' }, '');
    this._el.appendChild(this._label);

    document.getElementById('map-container').appendChild(this._el);
  }

  _onTrackClick(e) {
    if (this._playing) return;
    const rect = this._track.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(pct * (this._locations.length - 1));
    this._goToStep(Math.max(0, Math.min(idx, this._locations.length - 1)));
  }

  _goToStep(index) {
    if (index === this._stepIndex) return;
    this._stepIndex = index;
    const loc = this._locations[index];
    const pct = index / (this._locations.length - 1) * 100;

    // Update UI
    this._thumb.style.left = `${pct}%`;
    this._progress.style.width = `${pct}%`;
    this._label.textContent = loc.date;

    // Update dots
    this._track.querySelectorAll('.timeline-dot').forEach((dot, i) => {
      dot.classList.remove('visited', 'active');
      if (i < index) dot.classList.add('visited');
      if (i === index) dot.classList.add('active');
    });

    // Notify — will trigger sidebar + marker
    this.notify('timeline:step', { id: loc.id, location: loc, index });
  }

  _togglePlay() {
    if (this._playing) {
      this._pause();
    } else {
      this._play();
    }
  }

  _play() {
    // Start from beginning if at end
    if (this._stepIndex >= this._locations.length - 1) {
      this._stepIndex = -1;
      this._track.querySelectorAll('.timeline-dot').forEach(d => d.classList.remove('visited', 'active'));
      this._progress.style.width = '0%';
    }

    this._playing = true;
    this._playBtn.textContent = '⏸';
    this._playBtn.classList.add('playing');
    this._advance();
  }

  _pause() {
    this._playing = false;
    this._playBtn.textContent = '▶';
    this._playBtn.classList.remove('playing');
    clearTimeout(this._timer);
  }

  _advance() {
    if (!this._playing) return;
    this._stepIndex++;
    if (this._stepIndex >= this._locations.length) {
      this._pause();
      return;
    }
    this._goToStep(this._stepIndex);
    this._timer = setTimeout(() => this._advance(), 1800);
  }

  destroy() {
    this._pause();
    if (this._el) {
      this._el.remove();
      this._el = null;
    }
    super.destroy();
  }
}

export default Timeline;
