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
| `--color-bg` | `#050505` | Main background |
| `--color-surface` | `#0a0a0a` | Elevated panels |
| `--color-elevated` | `#0f0f0f` | Hover states |
| `--color-text` | `rgba(255,255,255,0.88)` | Headlines |
| `--color-text-body` | `rgba(255,255,255,0.52)` | Body copy |
| `--color-text-muted` | `rgba(255,255,255,0.25)` | Labels, disabled |
| `--color-accent` | `#4ade80` | Active / travel (green only) |
| `--color-accent-coral` | `#fb7185` | Active marker highlight |
| `--color-accent-amber` | `#d4a853` | Nature tag |
| `--color-accent-warm` | `#e7e5e4` | City tag |

### Typography

| Role | Font | Weight | Sample |
|---|---|---|---|
| Titles | `Noto Serif SC` (serif) | 400 | `.nav-title`, `.location-name` |
| Body | System `-apple-system` sans-serif | 400 | `.location-description` |
| Numbers / Code | `JetBrains Mono` (mono) | 400 | `.nav-stat-value`, `.nav-item-index` |
| Labels | System sans + uppercase + wide letter-spacing | 400 | `.nav-stat-label`, `.tag` |

### Hard Rules

- **No glassmorphism** — zero `backdrop-filter: blur()`
- **No heavy shadows** — only `box-shadow: 0 0 0 1px rgba(...)` hairline borders
- **No gradients** on backgrounds or text (except the map title gradient is allowed)
- **No blue or purple** accents — green `#4ade80` and warm white `#e7e5e4` only
- **Max border-radius: 4px** — except `--radius-pill: 9999px` for filter chips and playback buttons
- **Borders only as `1px solid rgba(255,255,255,0.06)`**
- **Map tiles must stay dark & desaturated** — tiles are CARTO Voyager (light) dark-themed via CSS `filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.05) saturate(0.12)` on `.leaflet-tile-pane`. Do NOT use an already-dark tile set (Dark Matter + brightness filter = unreadable black map)
- **Dot grid texture** — `body::before` with `radial-gradient` at 20px spacing, opacity 0.04

---

## Architecture

### Layout Structure

```
┌──────────────────────────────────────────────────────┐
│ #sidebar (nav)   │ #map-container                    │
│                  │                                   │
│ .nav-header      │   .map-header (floating title)    │
│   "足迹地图"     │                                   │
│                  │   #tag-filter (top-center)        │
│ #nav-locations   │   #stats-panel (top-right)        │
│   01 BEIJING     │                                   │
│   02 SHANGHAI    │   #map (Leaflet)                  │
│   03 HANGZHOU    │     - markers                     │
│                  │     - route lines                 │
│ .nav-footer      │                                   │
│   03 城市        │   #style-switcher (bottom-left)   │
│   2191 KM        │   #globe-toggle (bottom-left)     │
│   06 标签        │   #timeline (bottom)              │
│                  │                                   │
│   (fixed 300px)  │   (flex: 1, full height)          │
├──────────────────┤                                   │
│ #detail-panel    │ ← slides open to right of nav     │
│   (380px, shows │   when location is selected       │
│    location     │                                    │
│    detail)      │                                    │
└──────────────────────────────────────────────────────┘
```

### Component Tree

```
main.js
 ├─ MapComponent        ← Leaflet map + markers (DivIcon, flyTo, dimming)
 ├─ Sidebar             ← Left nav list + stats footer + detail panel
 │   └─ PhotoGallery    ← 2-column photo grid (emits gallery:photoClick)
 ├─ Lightbox            ← Full-screen photo viewer (← → Esc)
 ├─ Timeline            ← Bottom scrubber bar with play/pause
 ├─ RouteLines          ← Animated dashed lines between locations
 ├─ TagFilter           ← Pill filter chips (top-center of map)
 ├─ StatsPanel          ← Floating stats overlay (top-right of map)
 ├─ StyleSwitcher       ← Tile layer switcher (bottom-left of map)
 └─ GlobeView           ← 3D globe toggle (Globe.GL, bottom-left of map)
```

---

## Event System

All components communicate via `EventBus` (`src/utils/EventBus.js`). Never call component methods directly.

| Event | Payload | Direction |
|---|---|---|
| `map:markerClick` | `{ id, location }` | Map → Sidebar |
| `nav:locationSelect` | `{ id, location }` | Sidebar nav click → main.js → Map |
| `sidebar:open` | `{ id }` | Sidebar → (notify open) |
| `sidebar:close` | — | Sidebar → (notify close) |
| `gallery:photoClick` | `{ photos, index }` | PhotoGallery → Lightbox |
| `lightbox:open` | `{ index }` | Lightbox → (notify open) |
| `lightbox:close` | — | Lightbox → (notify close) |
| `timeline:step` | `{ id, location, index }` | Timeline → main.js → Map |
| `tagfilter:change` | `{ tags, locations }` | TagFilter → Map (show/hide markers) |
| `globe:markerClick` | `{ id, location }` | GlobeView → main.js → Sidebar |
| `style:change` | `{ style }` | StyleSwitcher → (notify change) |

**Critical event flow for location selection:**
```
Nav click  →  Sidebar emits "nav:locationSelect"  →  main.js calls map.selectById()
           →  Map emits "map:markerClick"          →  Sidebar opens detail panel

Map click  →  Map emits "map:markerClick"          →  Sidebar opens detail panel
```

There is an intentional asymmetry: nav→map uses `nav:locationSelect`, and map→sidebar uses `map:markerClick`, to prevent infinite event loops.

---

## Data Flow

```
locations.json  →  DataStore (src/utils/DataStore.js)
                       ├── getAll()
                       ├── getById(id)
                       ├── getByTag(tag)
                       ├── getByDateRange(start, end)
                       └── getTagStats()
                          ↓
                    main.js / all components
```

- **All data from `src/data/locations.json`** — add a location = edit JSON + add photos
- `DataStore` is the single abstraction — swap to API / localStorage by editing only this class

---

## File Map

```
src/
├── main.js                    # Bootstrap: init all 9 components, wire events + hash routing
├── config.js                  # Map defaults, tile URL, route groups, marker config
├── data/
│   └── locations.json         # ★ All location data — your only edit target
├── components/
│   ├── Map.js                 # Leaflet map, DivIcon markers, flyTo, marker dimming, tag filter response
│   ├── Sidebar.js             # Left nav list + stats footer + detail panel (hosts PhotoGallery)
│   ├── PhotoGallery.js        # 2-column photo grid, lazy loading, click→Lightbox
│   ├── Lightbox.js            # Full-screen viewer, keyboard/click nav, caption bar
│   ├── Timeline.js            # Bottom scrubber, play/pause auto-advance (1.8s per step)
│   ├── RouteLines.js          # Dashed polyline flow animation between route locations
│   ├── TagFilter.js           # Pill filter chips, emits filtered location list
│   ├── GlobeView.js           # Globe.GL 3D earth toggle (CDN lazy-loaded)
│   ├── StatsPanel.js          # Floating summary (city count / distance / tags)
│   └── StyleSwitcher.js       # 4 tile layer presets (voyager, dark, osm, satellite)
├── styles/
│   ├── variables.css          # ★ Design tokens — colors, fonts, spacing, radii, shadows
│   ├── base.css               # Reset, dot grid texture (body::before), scrollbar, .mono utility
│   ├── map.css                # Map container, desaturation filter, markers + pulse, zoom controls
│   ├── sidebar.css            # Left nav (300px), nav items with stagger animation, detail panel, mobile drawer
│   ├── lightbox.css           # Minimal overlay, hairline controls, info bar
│   ├── timeline.css           # Play button, scrubber rail with dots, thumb, date label
│   ├── controls.css           # Tag chips, stat numbers, style buttons, globe toggle
│   └── routes.css             # 1px dashed animated lines
├── utils/
│   ├── EventBus.js            # on/off/emit singleton (pub/sub)
│   ├── DataStore.js           # Data access abstraction (singleton)
│   ├── helpers.js             # $, $$, createElement, escapeHtml, getHashRoute, setHashRoute
│   └── geo.js                 # haversineDistance, computeBoundingBox, computeCenter
└── plugins/
    └── BasePlugin.js          # Plugin base class: init/destroy/listen/notify lifecycle

public/
└── photos/
    └── beijing/
        └── 01.jpg             # Real photo (5.7MB, user's own)
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
8. **Map overlay z-index** → `#map-container` is its own stacking context (`z-index: 0`), so Leaflet's internal panes (z 200–1000) are contained. Any overlay placed inside `#map-container` (tag filter, stats, timeline, style switcher, globe toggle) MUST use `z-index: var(--z-map-overlay)` (1100) — anything lower renders *under* the tile pane and is invisible. Overlays outside the map (nav, detail panel, lightbox) use the normal `--z-*` scale and always paint above the whole map container.

---

## Current State (as of 2026-07-29)

### Data
- 3 locations: 北京 (real photo), 上海, 杭州 (picsum.photos placeholders)
- 1 route group: 江南行 (北京→上海→杭州)
- 6 unique tags: 旅行, 城市, 历史文化, 现代都市, 自然, 山水

### Design
- Griffin editorial dark theme active (single theme, no light/dark toggle)
- Dot grid texture on body background
- Noto Serif SC + JetBrains Mono loaded from Google Fonts CDN
- All panels: hairline borders only, no glassmorphism, no heavy shadows
- Map tiles: CARTO Voyager (light) + invert/hue-rotate CSS filter → dark near-monochrome
- Markers: 14px green `#4ade80` circles with 2.4s pulse animation; active turns coral `#fb7185`

### Features
- Left nav: numbered location list with stagger animation, stats footer (city count / KM / tags)
- Detail panel: slides in to right of nav when location selected
- Lightbox: full-featured (prev/next arrows, keyboard ← → Esc, backdrop click, caption + counter)
- Timeline player: bottom scrubber, play/pause auto-advance at 1.8s intervals
- Route lines: dashed flowing animation connecting locations in route groups
- Tag filter: pill chips at top-center of map
- 3D globe: Globe.GL toggle (lazy-loads from CDN on first click)
- Stats overlay: floating number cards at top-right of map
- Map style switcher: 4 tile presets (voyager/dark/osm/satellite) at bottom-left
- URL hash routing: shareable links, back/forward support
- Mobile responsive: nav becomes bottom drawer, detail panel overlays full width
