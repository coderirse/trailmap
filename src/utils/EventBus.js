// ==========================================================================
// EventBus — Lightweight publish/subscribe for component communication
//
// Usage:
//   import eventBus from './utils/EventBus.js';
//   eventBus.on('map:markerClick', (data) => { ... });
//   eventBus.emit('map:markerClick', { id: 'beijing' });
//   eventBus.off('map:markerClick', handlerRef);
//
// Event naming convention: <source>:<action>
//   map:markerClick    — user clicked a map marker
//   sidebar:open       — sidebar opened with location data
//   sidebar:close      — request to close the sidebar (Map blank click)
//   sidebar:closed     — sidebar finished closing
//   gallery:photoClick — user clicked a photo in the gallery
// ==========================================================================

class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Register an event listener.
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
  }

  /**
   * Remove an event listener.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) this._listeners.delete(event);
    }
  }

  /**
   * Emit an event to all registered listeners.
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    const set = this._listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[EventBus] Error in listener for "${event}":`, err);
        }
      });
    }
  }

  /**
   * Remove all listeners for a given event, or all events if none specified.
   * @param {string} [event]
   */
  clear(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
  }
}

// Singleton instance
const eventBus = new EventBus();
export default eventBus;
