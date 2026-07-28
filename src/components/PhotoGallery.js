// ==========================================================================
// PhotoGallery — Photo grid component with lightbox extension point
// ==========================================================================

import BasePlugin from '../plugins/BasePlugin.js';
import { createElement } from '../utils/helpers.js';

class PhotoGallery extends BasePlugin {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container — DOM node to render into
   */
  constructor(options = {}) {
    super(options);
    this.container = options.container;
    /** @type {Array} */
    this._photos = [];
  }

  /**
   * Render the photo grid.
   * @param {Array} photos — array of { src, caption }
   */
  render(photos) {
    this._photos = photos || [];
    this.container.innerHTML = '';

    if (!this._photos.length) {
      this.container.innerHTML = '';
      return;
    }

    const wrapper = createElement('div', { className: 'location-photos' });

    const heading = createElement('h3', {}, `照片 (${this._photos.length})`);
    wrapper.appendChild(heading);

    const grid = createElement('div', { className: 'photo-grid' });

    this._photos.forEach((photo, index) => {
      const item = createElement('div', {
        className: 'photo-item',
        onClick: () => this._onPhotoClick(index),
      });

      const img = createElement('img', {
        src: photo.src,
        alt: photo.caption || '',
        loading: 'lazy',
      });
      item.appendChild(img);

      if (photo.caption) {
        const caption = createElement('div', { className: 'photo-caption' }, photo.caption);
        item.appendChild(caption);
      }

      grid.appendChild(item);
    });

    wrapper.appendChild(grid);
    this.container.appendChild(wrapper);
  }

  /**
   * Handle photo click — emits gallery:photoClick for lightbox extension.
   * @param {number} index
   */
  _onPhotoClick(index) {
    this.notify('gallery:photoClick', {
      photos: this._photos,
      index,
    });
  }

  /**
   * Clear the gallery.
   */
  clear() {
    this._photos = [];
    this.container.innerHTML = '';
  }

  destroy() {
    this.clear();
    super.destroy();
  }
}

export default PhotoGallery;
