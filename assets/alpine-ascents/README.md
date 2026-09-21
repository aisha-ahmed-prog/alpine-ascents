# Alpine Ascents — Mountaineering & Adventure Portal

A static, single-page mountaineering and adventure information portal built with HTML5, CSS3, Bootstrap 5, vanilla JavaScript, and jQuery. All content is data-driven from local JSON files.

## Tech stack

- HTML5 / CSS3 / Bootstrap 5
- Vanilla JavaScript + jQuery
- JSON for all content data
- Leaflet.js + OpenStreetMap (interactive map, no API key required)
- GLightbox (gallery lightbox)
- Bootstrap Icons, Google Fonts (Montserrat + Inter)

No build step, no Node.js, and no backend are required.

## ⚠️ Running the project — important

This project loads its content from local JSON files (`data/*.json`) using `fetch()`. Browsers block `fetch()` requests to local files when you open `index.html` directly from disk (a `file://` URL). **You must serve the project through a local web server.**

### Option 1 — VS Code Live Server (recommended)
1. Open the `alpine-ascents` folder in VS Code.
2. Install the "Live Server" extension if you don't have it.
3. Right-click `index.html` and choose **Open with Live Server**.

### Option 2 — Python's built-in server
```bash
cd alpine-ascents
python3 -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

### Option 3 — Any static file server
Any tool that serves static files over HTTP (e.g. `npx serve`, PHP's built-in server, WAMP/XAMPP) will work equally well. Node.js is **not** required for the project itself — it is only mentioned here as one possible way to run a local server if you already have it installed.

## Project structure

```
alpine-ascents/
├── index.html
├── css/
│   ├── style.css          → core design tokens, layout, components
│   ├── responsive.css      → breakpoints, mobile layout, reduced-motion
│   └── animations.css      → reveal-on-scroll and hero entrance animation
├── js/
│   ├── utilities.js        → shared helpers (formatting, debounce, escaping)
│   ├── data-loader.js      → cached fetch() wrapper for JSON data
│   ├── navigation.js       → navbar scroll state, active link, scroll progress
│   ├── gallery.js          → gallery filtering + lightbox
│   ├── map.js              → Leaflet map + organization cards
│   ├── filters.js          → records table filters + mountain explorer search
│   ├── search.js           → global search overlay
│   └── app.js              → preloader, theme, ticker, visitor counter, and
│                              rendering for most content sections
├── data/                   → one JSON file per content type (history, styles,
│                              techniques, sheltering, hazards, records,
│                              organizations, stories, gallery, videos,
│                              developments, guidelines, equipment, mountains,
│                              conditions, stats)
└── assets/                 → local image/icon folder (most imagery is loaded
                               from Unsplash via URL; this folder is available
                               for any assets you add locally)
```

## Notable features

- Sticky, transparent-over-hero navbar with active-section highlighting and a mobile hamburger menu.
- Animated statistics counters driven by `data/stats.json`.
- Dynamic, JSON-driven sections for history (timeline), climbing styles, techniques (tabs), sheltering, hazards, records (filterable table), organizations (cards + Leaflet map), expedition stories (modal detail), gallery (filterable + lightbox), videos (modal playback), latest developments (search + filter), guidelines (persistent checklist with print support), essential gear, and a searchable Mountain Explorer.
- Global search overlay indexing mountains, techniques, styles, organizations, records, and stories.
- Dark/light theme toggle persisted via `localStorage`.
- Local, `localStorage`-based visitor counter (clearly not a real global counter).
- Fixed bottom ticker showing live date, time, and browser-geolocation-derived location (falls back to "Location unavailable" if permission is denied).
- Scroll progress bar and back-to-top button.
- Reduced-motion support, semantic HTML, alt text, and keyboard-focusable controls throughout.

## Notes on data and images

- All written content (history, techniques, hazards, guidelines, etc.) is original descriptive copy for this project, not real organizational material.
- Historical dates and named records (e.g. first ascent of Everest, Messner's eight-thousander record) reflect widely documented facts; organizations and expedition stories are demonstration data.
- Images are loaded from Unsplash via external URL for demonstration purposes.
- The video section embeds real public YouTube videos via the standard iframe embed — no video files are downloaded or redistributed.
