// ==========================================================================
// Lightbox — Full-screen photo viewer
//
// Features: overlay, prev/next navigation, keyboard shortcuts,
//           click-to-close backdrop, caption display.
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import { createElement } from '../utils/helpers.js';

class Lightbox extends BasePlugin {
  constructor(options = {}) {
    super(options);
    /** @type {Array} */
    this._photos = [];
    /** @type {number} */
    this._currentIndex = 0;
    /** @type {HTMLElement|null} */
    this._overlay = null;
    /** @type {HTMLElement|null} */
    this._img = null;

    // Bound handlers for cleanup
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onBackdropClick = this._onBackdropClick.bind(this);
  }

  init() {
    this.listen('gallery:photoClick', this._handlePhotoClick);
    return this;
  }

  /**
   * Handle gallery:photoClick event.
   * @param {{ photos: Array, index: number }} data
   */
  _handlePhotoClick(data) {
    if (!data || !data.photos || data.photos.length === 0) return;
    this._photos = data.photos;
    this._currentIndex = data.index || 0;
    this._render();
    this._show();
  }

  /**
   * Build the lightbox DOM (once) or update it.
   */
  _render() {
    // Create overlay if it doesn't exist yet
    if (!this._overlay) {
      this._overlay = createElement('div', {
        className: 'lightbox-overlay',
        onClick: this._onBackdropClick,
      });

      // Close button
      this._closeBtn = createElement('button', {
        className: 'lightbox-close',
        onClick: () => this._hide(),
        'aria-label': '关闭',
      }, '×');
      this._overlay.appendChild(this._closeBtn);

      // Prev button
      this._prevBtn = createElement('button', {
        className: 'lightbox-nav lightbox-prev',
        onClick: (e) => { e.stopPropagation(); this._navigate(-1); },
        'aria-label': '上一张',
      }, '‹');
      this._overlay.appendChild(this._prevBtn);

      // Next button
      this._nextBtn = createElement('button', {
        className: 'lightbox-nav lightbox-next',
        onClick: (e) => { e.stopPropagation(); this._navigate(1); },
        'aria-label': '下一张',
      }, '›');
      this._overlay.appendChild(this._nextBtn);

      // Image container
      const imgContainer = createElement('div', { className: 'lightbox-img-container' });
      this._img = createElement('img', { className: 'lightbox-img' });
      imgContainer.appendChild(this._img);
      this._overlay.appendChild(imgContainer);

      // Caption + counter at the bottom
      this._infoBar = createElement('div', { className: 'lightbox-info' });
      this._captionEl = createElement('span', { className: 'lightbox-caption' });
      this._counterEl = createElement('span', { className: 'lightbox-counter' });
      this._infoBar.appendChild(this._captionEl);
      this._infoBar.appendChild(this._counterEl);
      this._overlay.appendChild(this._infoBar);

      document.body.appendChild(this._overlay);
    }

    this._updateImage();
    this._updateButtons();
  }

  /**
   * Update the displayed image.
   */
  _updateImage() {
    if (!this._img) return;
    const photo = this._photos[this._currentIndex];
    // Add a subtle fade effect
    this._img.style.opacity = '0';
    setTimeout(() => {
      this._img.src = photo.src;
      this._img.alt = photo.caption || '';
      this._img.style.opacity = '1';
    }, 80);

    // Update caption and counter
    this._captionEl.textContent = photo.caption || '';
    this._counterEl.textContent = `${this._currentIndex + 1} / ${this._photos.length}`;

    // Position: hide prev/next if only one photo
    this._prevBtn.style.visibility = this._photos.length > 1 ? 'visible' : 'hidden';
    this._nextBtn.style.visibility = this._photos.length > 1 ? 'visible' : 'hidden';
  }

  _updateButtons() {
    if (!this._prevBtn || !this._nextBtn) return;
  }

  /**
   * Navigate to the previous or next photo.
   * @param {number} direction - -1 for prev, +1 for next
   */
  _navigate(direction) {
    if (this._photos.length <= 1) return;
    this._currentIndex = (this._currentIndex + direction + this._photos.length) % this._photos.length;
    this._updateImage();
  }

  /**
   * Show the lightbox.
   */
  _show() {
    if (!this._overlay) return;
    this._overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this._onKeyDown);
    this.notify('lightbox:open', { index: this._currentIndex });
  }

  /**
   * Hide the lightbox.
   */
  _hide() {
    if (!this._overlay) return;
    this._overlay.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._onKeyDown);
    this.notify('lightbox:close');
  }

  /**
   * Handle backdrop click — close if clicking outside the image.
   * @param {MouseEvent} e
   */
  _onBackdropClick(e) {
    if (e.target === this._overlay) {
      this._hide();
    }
  }

  /**
   * Keyboard navigation.
   * @param {KeyboardEvent} e
   */
  _onKeyDown(e) {
    switch (e.key) {
      case 'Escape':
        this._hide();
        break;
      case 'ArrowLeft':
        this._navigate(-1);
        break;
      case 'ArrowRight':
        this._navigate(1);
        break;
    }
  }

  destroy() {
    this._hide();
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
    this._photos = [];
    super.destroy();
  }
}

export default Lightbox;
