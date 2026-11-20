# Coastline Cover Studio — a GTA-style poster maker

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01) [![rank](https://make.fun/badge/gta6-cover-art-01/XIIIIXV/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01) [![reward](https://make.fun/badge/gta6-cover-art-01/XIIIIXV/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

Make a poster that looks like it belongs on a game box — in the browser,
with no account, no upload, and no network. This is my entry for the
make.fun bounty **gta6-cover-art-01** ("Make GTA 6 Cover Art").

## Run it

```sh
# Needs Node 22. Serves the app on http://localhost:8080:
node serve.ts
```

You can also open `app/index.html` straight from disk in desktop Chrome.
Everything it needs (photos, fonts, code) is already in the repo, so it
works fully offline.

## Making a cover

The editor is six steps down the left column, and the poster updates
live on the right:

1. **Photos** — bring your own pictures, or use the twelve samples that
   ship with the app.
2. **Layout** — nine ways to arrange the panels. Vice is the big-hero
   mosaic modelled on the GTA VI cover; Collage is a ten-panel grid;
   there is also a cast grid, a neon grid, and a single-photo set.
3. **Colour grade** — seven looks (Sunset, Neon, Heatwave, Golden,
   Dusk, Halftone, Vice). Each one re-filters every photo and re-tints
   the title gradient.
4. **Words** — the title, the tilted script subtitle, the tagline along
   the bottom, and which badges to show.
5. **Selected panel** — change the caption, pick a caption style, zoom
   and re-crop the photo. Click any panel on the poster to select it,
   drag it to move the photo, scroll to zoom.
6. **Export** — save the finished poster as a PNG in 1080 × 1080,
   1080 × 1350, or 1920 × 1080.

## What the poster looks like

The default cover is **SUNSET CHASE**: a big hero photo on the left, a
mosaic of smaller scenes on the right, a huge stacked two-word title in
a sunset gradient with a dark outline, a pink script subtitle
("Golden Hour Getaway") tilted across it, and a tagline strip along the
bottom ("ONE COAST · NO RULES · COMING SOON"). Toggleable badges add a
NEW SUMMER 2026 starburst, a VOL. 06 pill, and an ORIGINAL seal. Every
panel wears a place caption such as "OCEAN DRIVE · 6:42 PM" — edit,
restyle, or hide any of them.

## Inside the code

```
app/
  index.html            the page
  style.css             page styles
  fonts/                Archivo Black, Bebas Neue, Pacifico (SIL OFL)
  samples/              the twelve bundled photos (vi-*.jpg)
  src/
    cover.js            the cover painter
    main.js             the editor
    shots.js            the screenshot scenes
main.ts                 the entrypoint (Node 22)
serve.ts                local static server
shots.json              the four screenshot definitions
tools/shots.mjs         screenshot capture with headless Chromium
vendor/makefun-app.ts   the kit's vendored library (unchanged)
screenshots/            the four screenshots below
```

The painter (`app/src/cover.js`) is a pipeline, not a class: the cover
is data (photo list, colour grades, nine layout records with panel
rectangles, title anchors and badge sets) plus a list of small drawing
steps that run in a fixed order — base, photos, labels, title band,
masthead, title, subtitle, badges, tagline, frame. The preview canvas
and the PNG export run the same steps, so what you see is what you get.

The editor (`app/src/main.js`) builds one state object with a factory
and wires the page with small functions that close over it. The shot
scenes (`app/src/shots.js`) read the `?shot=` query (cover, square,
portrait, editor), paint that scene, and set `window.__shotReady` when
the paint is done.

`main.ts` hands the entry in: it copies `app/` and `screenshots/` into
the output directory and writes `dossier.json` with the vendored make.fun
library. `serve.ts` is the tiny static server for local testing, and
`tools/shots.mjs` captures the four screenshots in `shots.json` with
headless Chromium.

## Screenshots

| File | What it shows |
| --- | --- |
| `screenshots/1-cover.jpg` | SUNSET CHASE, 1280 × 720 |
| `screenshots/2-editor.jpg` | The editor with a photo loaded, 1280 × 720 |
| `screenshots/3-cover-square.jpg` | NEON COAST, 1080 × 1080 |
| `screenshots/4-cover-portrait.jpg` | SUN HEIST, 960 × 1200 |

## Where the photos come from

The twelve sample photos are panels cropped from the user's own GTA VI
fanmade covers, which he supplied and explicitly cleared for this entry.
Every crop was checked to leave out Rockstar branding: no GTA logo, no R*
badge, no FANMADE stamp, no reference seal. The cover's own title,
subtitle and studio line replace the reference wording. The fonts are SIL
Open Font License files shipped under `app/fonts/`. No Rockstar logo,
artwork or font is in this repository.

## Licence

MIT — see `LICENSE`.
