// ==========================================================================
// ThemeSwitcher — dark / light theme toggle (nav header)
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import { createElement } from '../utils/helpers.js';

const STORAGE_KEY = 'trailmap-theme';

const SUN_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5L7 17M17 7l1.5-1.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const MOON_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

class ThemeSwitcher extends BasePlugin {
  constructor(options = {}) {
    super(options);
    /** @type {HTMLElement|null} */
    this._btn = null;
    /** @type {'dark'|'light'} */
    this._theme = 'dark';
  }

  init() {
    const current = document.documentElement.dataset.theme;
    this._theme = current === 'light' ? 'light' : 'dark';
    this._buildUI();
    return this;
  }

  _buildUI() {
    const header = document.querySelector('.nav-header');
    if (!header) return this;

    this._btn = createElement('button', {
      id: 'theme-toggle',
      className: 'theme-toggle',
      title: this._nextLabel(),
      'aria-label': this._nextLabel(),
      onClick: () => this._toggle(),
    });
    this._syncIcon();
    header.appendChild(this._btn);
    return this;
  }

  _nextLabel() {
    return this._theme === 'dark' ? '切换白昼风格' : '切换暗黑风格';
  }

  _toggle() {
    this._theme = this._theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = this._theme;
    try {
      localStorage.setItem(STORAGE_KEY, this._theme);
    } catch (e) { /* ignore storage errors */ }
    this._syncIcon();
    this._btn.title = this._nextLabel();
    this._btn.setAttribute('aria-label', this._nextLabel());
  }

  _syncIcon() {
    if (!this._btn) return;
    // Show the theme you will switch TO: sun in dark mode, moon in light mode
    this._btn.innerHTML = this._theme === 'dark' ? SUN_ICON : MOON_ICON;
  }

  destroy() {
    if (this._btn) {
      this._btn.remove();
      this._btn = null;
    }
    super.destroy();
  }
}

export default ThemeSwitcher;
