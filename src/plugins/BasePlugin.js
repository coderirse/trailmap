// ==========================================================================
// BasePlugin — Plugin interface template
//
// All UI components and future plugins should extend this class.
// This ensures a consistent lifecycle: init() → onEvent() → destroy().
//
// Usage:
//   class MyPlugin extends BasePlugin {
//     init() { ... }
//     destroy() { ... }
//   }
// ==========================================================================

import eventBus from '../utils/EventBus.js';

class BasePlugin {
  /**
   * @param {Object} [options={}]
   */
  constructor(options = {}) {
    this.options = options;
    this._eventBus = eventBus;
    /** @type {Array<{event: string, handler: Function}>} */
    this._boundListeners = [];
  }

  /**
   * Initialize the plugin. Override in subclass.
   * Must return `this` for chaining.
   * @returns {BasePlugin}
   */
  init() {
    return this;
  }

  /**
   * Subscribe to an event and track it for automatic cleanup.
   * @param {string} event
   * @param {Function} handler
   */
  listen(event, handler) {
    const bound = handler.bind(this);
    this._boundListeners.push({ event, handler: bound });
    this._eventBus.on(event, bound);
  }

  /**
   * Emit an event through the shared EventBus.
   * @param {string} event
   * @param {*} data
   */
  notify(event, data) {
    this._eventBus.emit(event, data);
  }

  /**
   * Handle incoming events. Override in subclass if needed.
   * @param {string} event
   * @param {*} data
   */
  onEvent(event, data) {
    // Override in subclass
  }

  /**
   * Clean up the plugin. Override in subclass, but call super.destroy().
   */
  destroy() {
    // Unsubscribe all tracked listeners
    this._boundListeners.forEach(({ event, handler }) => {
      this._eventBus.off(event, handler);
    });
    this._boundListeners = [];
  }
}

export default BasePlugin;
