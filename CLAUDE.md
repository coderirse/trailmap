# CLAUDE.md — Project Brief for AI Assistants

## Project: 个人足迹地图 (Personal Travel Map)

A static interactive map website built with **Leaflet.js + Vite** for documenting personal travel experiences. Deployed on GitHub Pages.

- **Repo**: `github.com/coderirse/trailmap`
- **Live**: `https://coderirse.github.io/trailmap/`
- **Stack**: Vite (vanilla JS, no framework) + Leaflet.js (CDN) + CSS Variables
- **Deploy**: GitHub Actions auto-deploys `dist/` to GitHub Pages on push to `master`

## Quick Start

```bash
npm install          # only dependency is Vite
npm run dev          # → http://localhost:3000 (HMR enabled)
npm run build        # → dist/ (ready for static hosting)
```

## Architecture

### Component Tree

```
main.js
 ├─ MapComponent      ← Leaflet map + markers (DivIcon)
 ├─ Sidebar           ← location detail panel (hosts PhotoGallery)
 │   └─ PhotoGallery  ← 2-column photo grid (emits gallery:photoClick)
 └─ Lightbox          ← full-screen photo viewer (listens to gallery:photoClick)
```

### Communication: EventBus (pub/sub, no direct calls)

| Event | Payload | When |
|---|---|---|
| `map:markerClick` | `{ id, location }` | User clicks a map marker |
| `sidebar:open` | `{ id }` | Sidebar opens with a location |
| `sidebar:close` | — | Sidebar closes / marker deselected |
| `gallery:photoClick` | `{ photos, index }` | User clicks a photo thumbnail |
| `lightbox:open` | `{ index }` | Lightbox opens |
| `lightbox:close` | — | Lightbox closes |

### Data Flow

```
locations.json  →  DataStore (src/utils/DataStore.js)
                       ├── getAll()
                       ├── getById(id)
                       ├── getByTag(tag)
                       ├── getByDateRange(start, end)
                       └── getTagStats()
                          ↓
                    main.js / components
```

- **All data comes from `src/data/locations.json`** — add a location, no code changes needed.
- `DataStore` is the single abstraction layer — swap to API / localStorage by editing only this class.

### Plugin System

All UI components extend `BasePlugin` (`src/plugins/BasePlugin.js`) which provides:

- `init()` — setup and subscribe to events
- `destroy()` — auto-unsubscribe all listeners
- `listen(event, handler)` — subscribe with automatic cleanup
- `notify(event, data)` — emit via shared EventBus

### URL Hash Routing

Format: `/#/<location-id>` (e.g. `/#/beijing`)

- Page load reads hash → auto-opens that location
- Back/forward works (listens to `hashchange`)
- Sidebar close clears hash

## File Map

```
src/
├── main.js                    # Bootstrap: init components, wire routing
├── config.js                  # Map defaults, tile URL, metadata
├── data/
│   └── locations.json         # ★ All location data — your only edit target
├── components/
│   ├── Map.js                 # Leaflet wrapper, DivIcon markers, panTo
│   ├── Sidebar.js             # Detail card: name/date/tags/description/photos
│   ├── PhotoGallery.js        # Photo grid, lazy loading, click→EventBus
│   └── Lightbox.js            # Full-screen viewer, keyboard/click nav
├── styles/
│   ├── variables.css          # ★ CSS Variables (light+dark themes defined)
│   ├── base.css               # Reset, #app flex layout
│   ├── map.css                # Map container, .custom-marker styles
│   ├── sidebar.css            # Sidebar layout, photo grid, mobile overlay
│   └── lightbox.css           # Overlay, nav arrows, info bar
├── utils/
│   ├── EventBus.js            # on/off/emit singleton
│   ├── DataStore.js           # Data access abstraction (singleton)
│   ├── helpers.js             # $, $$, createElement, escapeHtml, hash routing
│   └── geo.js                 # Haversine, bounding box, center (reserved)
└── plugins/
    └── BasePlugin.js          # Plugin base class

public/
└── photos/
    └── <location-id>/         # Real photos (e.g. beijing/01.jpg)
```

## Key Patterns

1. **Add a location** — edit only `src/data/locations.json`, put photos in `public/photos/<id>/`
2. **Change theme colors** — edit only `src/styles/variables.css`
3. **Add a new feature** — create a component extending `BasePlugin`, wire it in `main.js`
4. **Replace data source** — edit only `src/utils/DataStore.js`
5. **Custom markers** — `Map.js` `_createIcon()` returns an `L.divIcon`, CSS in `map.css` `.custom-marker`
6. **Mobile sidebar** — CSS class `.open` on `#sidebar` triggers slide-in overlay (<768px)

## Current State

- 3 sample locations: 北京 (real photo), 上海, 杭州 (placeholder images)
- Lightbox: full-featured (prev/next, keyboard ← → Esc, backdrop click to close)
- Light/dark theme variables defined (default: dark "Glass Explorer" glassmorphism theme; light fallback available via `data-theme="light"` on `<html>`)
- Mobile responsive: sidebar becomes slide-in overlay below 768px
