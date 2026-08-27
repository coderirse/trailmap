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

---

## Design System: Griffin Editorial (Dark Fintech)

Reference: griffin.com visual language. **All visual changes must respect these rules.**

### Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0C0C0B` | Main background |
| `--color-surface` | `#111110` | Elevated panels |
| `--color-elevated` | `#161615` | Hover states |
| `--color-text` | `#F9F5EF` | Headlines |
| `--color-text-body` | `#959089` | Body copy |
| `--color-text-muted` | `#6B6760` | Labels, disabled |
| `--color-accent` | `#E6E1D9` | Default marker |
| `--color-accent-warm` | `#D4A853` | Highlights, numbers, route lines |
| `--color-accent-amber` | `#C2856A` | Active marker highlight |
| `--color-accent-coral` | `#E39E7C` | Hover states |

### Typography

| Role | Font | Weight | Sample |
|---|---|---|---|
| Titles | `Noto Serif SC` (serif) | 400 | `.nav-title`, `.location-name` |
| Body | System `-apple-system` sans-serif | 400 | `.location-description` |
| Numbers / Code | `JetBrains Mono` (mono) | 400 | `.nav-stat-value`, `.nav-item-index` |
| Labels | System sans + uppercase + wide letter-spacing | 400 | `.nav-stat-label`, `.tag` |

### Hard Rules

- **No glassmorphism** — zero `backdrop-filter: blur()`
- **No heavy shadows** — only hairline borders (`box-shadow: 0 0 0 1px rgba(...)`) plus the small marker glows in `map.css`
- **No gradients** on backgrounds or text (except the map title gradient is allowed)
- **No blue or purple** accents — warm palette only (`#E6E1D9`, `#D4A853`, `#C2856A`, `#E39E7C`)
- **Max border-radius: 4px** — except `--radius-pill: 9999px` for filter chips and playback buttons
- **Borders only as `1px solid rgba(249,245,239,0.06)`**
- **Dual theme** — `:root` is the dark theme; `:root[data-theme='light']` overrides the tokens with a warm paper palette (see `variables.css`). The toggle lives in `.nav-header` (`ThemeSwitcher.js`) and persists via localStorage key `trailmap-theme`. In light theme the invert filter on the inverted preset MUST be disabled (`filter: none`).
- **Default map tiles must stay dark & desaturated** — Esri World Light Gray (keyless) is dark-themed via the CSS filter on the `.tile-style-inverted` layer class ONLY (`invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.05) saturate(0.12)`). Other presets (dark / osm / satellite) must remain UNFILTERED or their colors become inverted and unreadable. Do not widen the filter back to `.leaflet-tile-pane`. Do NOT switch basemaps back to CARTO (`basemaps.cartocdn.com`) — CARTO now serves keyless requests tiles watermarked "API KEY REQUIRED".
- **Dot grid texture** — `body::before` with `radial-gradient` at 20px spacing, opacity 0.04

---

## Architecture

### Layout Structure

```
+------------------+----------------------------------------------+
| #sidebar (nav)   | #map-container                                |
| .nav-header      |   #tag-filter (top-center)                    |
|   "足迹地图"      |   #stats-panel (top-right)                    |
|   [theme toggle] |                                              |
| #nav-locations   |   #map (Leaflet)                              |
|   01 BEIJING     |     - markers                                |
|   02 SHANGHAI    |     - route lines                             |
|   03 HANGZHOU    |   #style-switcher (bottom-left)               |
| .nav-footer      |   #globe-toggle (bottom-left)                 |
|   03 城市        |   #timeline (bottom)                          |
|   2191 KM        |                                              |
|   06 标签        |                                              |
| (fixed 300px)    | (flex: 1, full height)                        |
+------------------+----------------------------------------------+
| #detail-panel    | slides open to right of nav (380px,           |
|                  | shows location detail when selected)          |
+------------------+----------------------------------------------+
```

### Component Tree

```
main.js
 ├── MapComponent        → Leaflet map + markers (DivIcon, flyTo, dimming)
 ├── Sidebar             → Left nav list + stats footer + detail panel
 │    └── PhotoGallery   → 2-column photo grid (emits gallery:photoClick)
 ├── Lightbox            → Full-screen photo viewer (←/→/Esc)
 ├── Timeline            → Bottom scrubber bar with play/pause
 ├── RouteLines          → Animated dashed lines between locations
 ├── TagFilter           → Pill filter chips (top-center of map)
 ├── StatsPanel          → Floating stats overlay (top-right of map)
 ├── StyleSwitcher       → 4 tile layer presets (grayscale/dark/osm/satellite)
 ├── ThemeSwitcher       → Dark/light theme toggle (nav header, persisted)
 └── GlobeView           → 3D globe toggle (Globe.GL, bottom-left of map)
```

---

## Event System

All components communicate via `EventBus` (`src/utils/EventBus.js`). Never call component methods directly.

| Event | Payload | Direction |
|---|---|---|
| `map:markerClick` | `{ id, location }` | Map → Sidebar |
| `nav:locationSelect` | `{ id, location }` | Sidebar nav click → main.js → Map |
| `sidebar:close` | — | Map blank-click → Sidebar (request close) |
| `sidebar:closed` | — | Sidebar → (notify closed) |
| `gallery:photoClick` | `{ photos, index }` | PhotoGallery → Lightbox |
| `lightbox:open` | `{ index }` | Lightbox → (notify open) |
| `lightbox:close` | — | Lightbox → (notify close) |
| `timeline:step` | `{ id, location, index }` | Timeline → main.js → Map |
| `tagfilter:change` | `{ tags, locations }` | TagFilter → Map (show/hide markers) |
| `globe:markerClick` | `{ id, location }` | GlobeView → main.js → Sidebar |
| `style:change` | `{ style }` | StyleSwitcher → (notify change) |

**Critical flow for location selection:**

```
Nav click   → Sidebar emits "nav:locationSelect" → main.js calls map.selectById()
            → Map emits "map:markerClick"        → Sidebar opens detail panel

Map click   → Map emits "map:markerClick"        → Sidebar opens detail panel
```

There is an intentional asymmetry: nav→map uses `nav:locationSelect`, and map→sidebar uses `map:markerClick`, to prevent infinite event loops.

**Never re-emit `sidebar:close` from `Sidebar.close()`** — Sidebar subscribes to that event, so re-emitting causes infinite recursion. `close()` only emits `sidebar:closed` after closing.

**Hash routing guard**: `Sidebar.open()` writes the URL hash itself, which fires `hashchange`. main.js skips re-selection when the sidebar already shows that location (`sidebar.getCurrentLocation()?.id !== hash`).

---

## Data Flow

```
locations.json   → DataStore (src/utils/DataStore.js)
                       ├── getAll()
                       ├── getById(id)
                       └── getTagStats()
                          → main.js / all components
```

- **All data from `src/data/locations.json`** — add a location = edit JSON + add photos
- `DataStore` is the single abstraction — swap to API / localStorage by editing only this class

---

## File Map

```
src/
├── main.js                    # Bootstrap: init all 10 components, wire events + hash routing
├── config.js                  # Map defaults, tile URL, route groups, UI settings
├── data/
│   └── locations.json         # ⭐ All location data — your only edit target
├── components/
│   ├── Map.js                 # Leaflet map, DivIcon markers, flyTo, marker dimming, tag filter response
│   ├── Sidebar.js             # Left nav list + stats footer + detail panel (hosts PhotoGallery)
│   ├── PhotoGallery.js        # 2-column photo grid, lazy loading, click → lightbox
│   ├── Lightbox.js            # Full-screen viewer, keyboard/click nav, caption bar
│   ├── Timeline.js            # Bottom scrubber, play/pause auto-advance (1.8s per step)
│   ├── RouteLines.js          # Dashed polyline flow animation between route locations
│   ├── TagFilter.js           # Pill filter chips, emits filtered location list
│   ├── GlobeView.js           # Globe.GL 3D earth toggle (CDN lazy-loaded)
│   ├── StatsPanel.js          # Floating summary (city count / distance / tags)
│   ├── StyleSwitcher.js       # 4 tile layer presets (grayscale, dark, osm, satellite)
│   └── ThemeSwitcher.js       # Dark/light theme toggle (nav header, persisted)
├── styles/
│   ├── variables.css          # ⭐ Design tokens — colors, fonts, spacing, radii, shadows
│   ├── base.css               # Reset, dot grid texture (body::before), scrollbar, .mono utility
│   ├── map.css                # Map container, inverted tile filter, markers + pulse, zoom controls
│   ├── sidebar.css            # Left nav (300px), nav items with stagger animation, detail panel, mobile drawer
│   ├── lightbox.css           # Minimal overlay, hairline controls, info bar
│   ├── timeline.css           # Play button, scrubber rail with dots, thumb, date label
│   ├── controls.css           # Tag chips, stat numbers, style buttons, globe toggle
│   └── routes.css             # 1px dashed animated lines
├── utils/
│   ├── EventBus.js            # on/off/emit singleton (pub/sub)
│   ├── DataStore.js           # Data access abstraction (singleton)
│   ├── helpers.js             # createElement, escapeHtml, getHashRoute, setHashRoute
│   └── geo.js                 # haversineDistance
└── plugins/
    └── BasePlugin.js          # Plugin base class: init/destroy/listen/notify lifecycle

public/
└── photos/
    └── beijing/
        └── 01.jpg             # Real photo, compressed to 1920px / ~416KB
```

---

## Key Patterns

1. **Add a location** → edit `src/data/locations.json`, put photos in `public/photos/<id>/`
2. **Change design tokens** → edit `src/styles/variables.css` (colors, fonts, sizing, borders, everything)
3. **Add a component** → extend `BasePlugin`, wire in `main.js`, add CSS file, import CSS in `main.js`
4. **Replace data source** → edit `src/utils/DataStore.js` (single point of change)
5. **Custom markers** → `Map.js` `_createIcon()` returns `L.divIcon`, styles in `map.css` `.custom-marker`
6. **Add a route line** → edit `config.js` `routes[]` array with `{ id, name, locations: [...], color }`
7. **Routing** → URL hash `/#/<id>` reads on load, updates on select, supports browser back/forward
8. **Map overlay z-index** → `#map-container` is its own stacking context (`z-index: 0`), so Leaflet's internal panes (z 200–700) are contained. Any overlay placed inside `#map-container` (tag filter, stats, timeline, style switcher, globe toggle) MUST use `z-index: var(--z-map-overlay)` (1100) — anything lower renders *under* the tile pane and is invisible. Overlays outside the map (nav, detail panel, lightbox) use the normal `--z-*` scale and always paint above the whole map container.
9. **Tile layer class names** → each StyleSwitcher preset carries its own `className` (`tile-style-inverted`, `tile-style-dark`, ...). The dark filter lives on `.tile-style-inverted` only; never put it back on `.leaflet-tile-pane`.
10. **Event safety** → `sidebar:close` is a request event emitted by Map; `Sidebar.close()` emits `sidebar:closed`. Do not reintroduce the old self-subscribe loop.
11. **Dual theme tokens** → all theme colors live in `variables.css` (`:root` dark + `:root[data-theme='light']`). Component CSS must only use `var(--*)`; never hardcode colors. Add new theme-aware tokens to both blocks.

---

## Current State (as of 2026-08-02)

### Data
- 3 locations: 北京 (real photo), 上海, 杭州 (picsum.photos placeholders)
- 1 route group: 江南行 (北京→上海→杭州)
- 6 unique tags: 旅行, 城市, 历史文化, 现代都市, 自然, 山水

### Design
- Dual theme: Griffin dark (default) + warm-paper light, toggled in the nav header and persisted via localStorage
- Dot grid texture on body background
- Noto Serif SC + JetBrains Mono loaded from Google Fonts CDN
- All panels: hairline borders only, no glassmorphism, no heavy shadows
- Map tiles: Esri World Light Gray (keyless) + invert/hue-rotate CSS filter → dark near-monochrome (grayscale preset only; light theme disables the filter for natural colors). CARTO basemaps dropped — keyless tiles are watermarked "API KEY REQUIRED"
- Markers: 12px warm white `#E6E1D9` circles with 3s pulse animation; active turns terracotta `#C2856A`

### Features
- Left nav: numbered location list with stagger animation, stats footer (city count / KM / tags)
- Detail panel: slides in to right of nav when location selected
- Lightbox: full-featured (prev/next arrows, keyboard ←/→/Esc, backdrop click, caption + counter)
- Timeline player: bottom scrubber, play/pause auto-advance at 1.8s intervals
- Route lines: dashed flowing animation connecting locations in route groups
- Tag filter: pill chips at top-center of map (filtering the active marker closes the detail panel)
- 3D globe: Globe.GL toggle (lazy-loads from CDN on first click)
- Stats overlay: floating number cards at top-right of map
- Map style switcher: 4 tile presets (grayscale/dark/osm/satellite), each rendered without the invert filter
- Theme toggle: dark/light switch (sun/moon icon in nav header), persisted via localStorage
- URL hash routing: shareable links, back/forward support, duplicate-hash guard
- Mobile responsive: nav becomes bottom drawer, detail panel overlays full width
