// ==========================================================================
// Helpers — Generic utility functions
// ==========================================================================

/**
 * Create an HTML element with attributes and children.
 * @param {string} tag
 * @param {Object<string, string>} [attrs]
 * @param {...(string|Node)} children
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      el.setAttribute(key, value);
    }
  }
  children.forEach((child) => {
    if (child instanceof Node) {
      el.appendChild(child);
    } else if (child != null) {
      el.appendChild(document.createTextNode(String(child)));
    }
  });
  return el;
}

/**
 * Escape HTML to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Read the current URL hash route (e.g. '#/beijing' → 'beijing').
 * @returns {string|null}
 */
export function getHashRoute() {
  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    return hash.slice(2) || null;
  }
  return null;
}

/**
 * Set the URL hash route.
 * @param {string|null} id — location id, or null to clear
 */
export function setHashRoute(id) {
  if (id) {
    window.location.hash = `#/${id}`;
  } else {
    // Remove hash without triggering hashchange (use replaceState)
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}
