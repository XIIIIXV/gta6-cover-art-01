// ============================================================================
// Coastline Cover Studio — cover painter, fourth draft.
//
// The painter is a pipeline now, not a class. A cover is painted by a list
// of small steps, each one a plain function that takes the same "paint"
// bundle and does one job: lay the base, paint the photos, wash them,
// label the panels, draw the title, the subtitle, the badges, the
// tagline, and finally the frame. Nothing is stored on `this`; the bundle
// is built fresh for every paint by makePaint(), so the preview canvas and
// the PNG export run the exact same steps and always agree.
//
// Why a pipeline: the two earlier drafts organised the same poster as one
// big module of free functions, then as a CoverRenderer class. Both drew
// identical pixels. This draft keeps the pixels and changes the shape
// again — the data is compact (panels are number tuples, photos are
// triples, grades are one-liners) and the drawing is a sequence of named
// steps instead of methods. If you change a step, the preview and the
// export change together, because there is only one path.
//
// The visual result is identical to the approved "Vice" cover: the same
// hero on the left, the same mosaic on the right, the same title block
// centre-bottom, the same tagline strip. Only the code changed.
//
// Photos: the bundled samples are crops of the two GTA VI fanmade covers
// the user supplied and explicitly cleared for this entry (2026-11-20).
// Every crop was checked to leave out Rockstar marks: no GTA logo, no R*
// badge, no FANMADE stamp, no reference seal. The cover's own title,
// subtitle and studio line replace the reference wording, and the fonts are
// SIL Open Font License files shipped under app/fonts. Nothing here is
// Rockstar artwork, a Rockstar logo, or a Rockstar font.
// ============================================================================

// ---------------------------------------------------------------------------
// Photo catalogue
// ---------------------------------------------------------------------------
//
// One row per sample: [id, file under app/, blurb for the editor strip].
// The id is the key the editor and the shot scenes use to pick a photo.
export const PHOTO_LIBRARY = [
  ['vi-hero', 'samples/vi-hero.jpg', 'Woman with gun'], // the hero shot, big left panel
  ['vi-cap', 'samples/vi-cap.jpg', 'Man with cap'],
  ['vi-coast', 'samples/vi-coast.jpg', 'Coast road'],
  ['vi-redcar', 'samples/vi-redcar.jpg', 'Red car chase'],
  ['vi-masked', 'samples/vi-masked.jpg', 'Masked man'],
  ['vi-airboat', 'samples/vi-airboat.jpg', 'Airboat'],
  ['vi-bike', 'samples/vi-bike.jpg', 'Night rider'],
  ['vi-heli', 'samples/vi-heli.jpg', 'Helicopter'],
  ['vi-sunset', 'samples/vi-sunset.jpg', 'Woman at sunset'],
  ['vi-muscle', 'samples/vi-muscle.jpg', 'Muscle car'],
  ['vi-floral', 'samples/vi-floral.jpg', 'Floral shirt'],
  ['vi-swamp', 'samples/vi-swamp.jpg', 'Swamp run'],
];

// ---------------------------------------------------------------------------
// Colour grades
// ---------------------------------------------------------------------------
//
// A grade is a look: the canvas filter the photos are painted through, the
// warm wash laid over them (bright at the top, deep at the foot), the ramp
// the title is filled with, and whether the panels get the halftone dot
// treatment. `swatch` is the CSS gradient the editor shows on the button.
// One line per grade: id, name, swatch, filter, top wash, foot wash,
// title ramp, halftone flag.
export const COLOR_GRADES = [
  { id: 'sunset', name: 'Sunset', swatch: 'linear-gradient(135deg,#ffd94d,#ff7a1a 55%,#ff2e88)', filter: 'saturate(1.45) contrast(1.12) brightness(1.04) sepia(0.18)', topWash: 'rgba(255,120,60,0.05)', footWash: 'rgba(255,40,110,0.30)', titleStops: ['#ffffff', '#ffe9a3', '#ffb347', '#ff7a1a', '#ff2e88'], halftone: false },
  { id: 'neon', name: 'Neon', swatch: 'linear-gradient(135deg,#22e6ff,#ff2e88 60%,#b537ff)', filter: 'saturate(1.7) contrast(1.2) brightness(0.98) hue-rotate(-15deg)', topWash: 'rgba(40,220,255,0.10)', footWash: 'rgba(255,20,140,0.32)', titleStops: ['#ffffff', '#b8f6ff', '#22e6ff', '#ff2e88', '#b537ff'], halftone: false },
  { id: 'heatwave', name: 'Heatwave', swatch: 'linear-gradient(135deg,#fff3a3,#ff5a1a 55%,#d21f3c)', filter: 'saturate(1.6) contrast(1.25) brightness(1.08) sepia(0.35)', topWash: 'rgba(255,160,40,0.12)', footWash: 'rgba(210,20,40,0.34)', titleStops: ['#ffffff', '#fff3a3', '#ffb347', '#ff5a1a', '#d21f3c'], halftone: false },
  { id: 'golden', name: 'Golden', swatch: 'linear-gradient(135deg,#fff8d6,#ffd94d 55%,#ff9e2e)', filter: 'saturate(1.3) contrast(1.05) brightness(1.1) sepia(0.3)', topWash: 'rgba(255,210,90,0.14)', footWash: 'rgba(255,140,30,0.26)', titleStops: ['#ffffff', '#fff8d6', '#ffd94d', '#ff9e2e', '#ff7a1a'], halftone: false },
  { id: 'dusk', name: 'Dusk', swatch: 'linear-gradient(135deg,#c9b8ff,#7a5cff 55%,#ff5da2)', filter: 'saturate(1.2) contrast(1.1) brightness(0.92) hue-rotate(15deg)', topWash: 'rgba(120,90,255,0.16)', footWash: 'rgba(40,10,80,0.34)', titleStops: ['#ffffff', '#e6dcff', '#c9b8ff', '#7a5cff', '#ff5da2'], halftone: false },
  { id: 'halftone', name: 'Halftone', swatch: 'linear-gradient(135deg,#fff,#ff5da2 55%,#1a0b2e)', filter: 'saturate(1.5) contrast(1.3) brightness(1.02)', topWash: 'rgba(255,90,160,0.08)', footWash: 'rgba(40,0,60,0.28)', titleStops: ['#ffffff', '#ffe9a3', '#ffb347', '#ff5da2', '#d21f3c'], halftone: true },
  { id: 'vice', name: 'Vice', swatch: 'linear-gradient(135deg,#22e6ff,#ff2e88 55%,#ffd94d)', filter: 'saturate(1.6) contrast(1.15) hue-rotate(-25deg)', topWash: 'rgba(34,230,255,0.12)', footWash: 'rgba(255,46,136,0.30)', titleStops: ['#ffffff', '#b8f6ff', '#22e6ff', '#ff2e88', '#ffd94d'], halftone: false },
];

// ---------------------------------------------------------------------------
// Export sizes
// ---------------------------------------------------------------------------
//
// The post sizes the app exports to. One row per size: [key, label, w, h].
// `key` is the short id the editor and the shot list use.
export const POST_SIZES = [
  ['square', '1080 × 1080', 1080, 1080],
  ['portrait', '1080 × 1350', 1080, 1350],
  ['wide', '1920 × 1080', 1920, 1080],
];

// Looks a size up by key and hands back a plain { key, label, w, h } object;
// unknown keys fall back to the wide size, which is the editor default.
export const sizeByKey = (key) => {
  const row = POST_SIZES.find((s) => s[0] === key) ?? POST_SIZES[2];
  return { key: row[0], label: row[1], w: row[2], h: row[3] };
};

// ---------------------------------------------------------------------------
// Fallback labels
// ---------------------------------------------------------------------------
//
// Fallback panel labels for layouts that do not carry their own: a place
// line and a time line, cycled through by panel index. One row per label:
// [headline, tagline].
export const FALLBACK_LABELS = [
  ['OCEAN DRIVE', '6:42 PM · LOOKING FOR TROUBLE'],
  ['MARINA DEL SOL', '7:40 PM · NO WITNESSES'],
  ['TOWER 2', '6:10 PM · LAST SWIM'],
  ['PALM BOULEVARD', '9:15 PM · LIGHTS OUT'],
  ['INTERSTATE 6', '11:59 PM · FULL THROTTLE'],
  ['PIER 26', '5:30 AM · GONE FISHING'],
  ['SUNSET HEIGHTS', '8:30 PM · BIG MONEY'],
  ['BOARDWALK', '10:05 PM · LAST CALL'],
];

// ---------------------------------------------------------------------------
// Hero crops
// ---------------------------------------------------------------------------
//
// The one-photo layout shows the hero photo five ways: whole, then four
// zoomed corners. One row per panel: [photo slot, zoom, pan x, pan y].
const HERO_CROPS = [
  [0, 1, 0, 0], // whole hero
  [0, 1.9, -0.18, -0.05], // zoomed top-left
  [0, 1.9, 0.22, -0.12], // zoomed top-right
  [0, 1.9, -0.28, 0.14], // zoomed bottom-left
  [0, 1.9, 0.28, 0.1], // zoomed bottom-right
];

// ---------------------------------------------------------------------------
// Photo slots per layout
// ---------------------------------------------------------------------------
//
// Which photo each panel starts with, as indexes into the photo list
// (0 hero, 1 cap, 2 coast, 3 red car, 4 masked, 5 airboat, 6 bike,
// 7 helicopter, 8 sunset, 9 muscle, 10 floral, 11 swamp). One row per
// layout: [layout key, slot indexes].
const LAYOUT_SLOTS = [
  ['vice', [0, 1, 2, 3, 4, 5, 6]],
  ['collage', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],
  ['hero-left', [0, 1, 2, 3, 1]],
  ['neon-grid', [0, 1, 3, 2, 1, 0, 2]],
  ['halftone-hero', [0, 2, 1, 3, 0, 1, 2, 3]],
  ['cast', [1, 0, 8, 4, 10]],
  ['sun-run', [0, 1, 2, 3]],
  ['one-photo', [0, 0, 0, 0, 0]],
  ['numbered', [0, 3, 1, 2]],
];

const slotsForLayout = (layoutKey) => LAYOUT_SLOTS.find((row) => row[0] === layoutKey)?.[1] ?? [];

// ---------------------------------------------------------------------------
// Cover layouts
// ---------------------------------------------------------------------------
//
// A layout is a data record, not code. Fields:
//
//   key       the layout id the editor and the shot scenes use
//   name      the button label in the editor
//   desc      the tooltip on the layout button
//   panels    panel rectangles as [left, top, width, height] fractions of
//             the cover (0..1); panels tile the whole cover
//   title     the title anchor [centerX, baseY, maxWidth] as fractions
//   stacked   true when the title is stacked word-per-line ("SUNSET" over
//             "CHASE"); absent means one line
//   sub       the subtitle anchor [centerX, baseY, slant, place], where
//             place is 'below' (under the title) or 'above' (over it)
//   subScale  subtitle size multiplier (1 when absent)
//   masthead  the studio bar label, or null when the layout has no bar
//   band      a solid band behind the title as [x, y, w, h] fractions, or
//             null when the layout has none
//   numbered  true when panels after the first wear a number badge
//   seal      the ORIGINAL seal spot [x, y, scale] as fractions, or null
//             for the default spot (centre, 0.42, scale 0.05)
//   burst     the NEW burst spot [x, y] as fractions, or null for the
//             default spot (0.065, 0.075)
//   badges    which badges this layout shows; absent means the fallback set
//   foot      true when labels sit at the panel foot by default
//   head      panel indexes whose labels sit at the TOP instead of the foot
//   labels    panel labels as [headline, tagline] pairs; absent means the
//             fallback labels are cycled through
//
// Geometry follows the user's GTA VI wide reference for the Vice layout:
// a tall hero on the left, a mosaic on the right, and a dark title block
// centre-bottom holding the stacked title and the script subtitle. The
// tagline strip runs along the very bottom; panels stop at y 0.958 and
// the tagline takes the last 0.042.
export const COVER_LAYOUTS = [
  {
    key: 'vice', name: 'Vice', desc: 'GTA VI cover: big hero, title block, seven panels',
    panels: [
      [0.017, 0.087, 0.549, 0.513],
      [0.571, 0.03, 0.166, 0.285],
      [0.742, 0.03, 0.24, 0.285],
      [0.571, 0.323, 0.411, 0.252],
      [0.017, 0.61, 0.256, 0.348],
      [0.576, 0.583, 0.156, 0.375],
      [0.737, 0.583, 0.245, 0.375],
    ],
    title: [0.422, 0.82, 0.27], stacked: true,
    sub: [0.422, 0.91, -5, 'below'], subScale: 0.8,
    masthead: 'COASTLINE COVER STUDIO • COMING SOON',
    band: null, numbered: false,
    seal: [0.56, 0.46, 0.055], burst: [0.08, 0.52],
    badges: { burst: true, seal: true, vol: true, stars: false, est2026: false, wanted: false, coast: false },
    foot: true, head: [0, 4, 5],
    // The hero, masked and airboat labels sit at the TOP of their panels:
    // the title block and the script subtitle would otherwise cover the
    // hero's foot, and the subtitle brushes the masked/airboat feet.
    // The NEW burst parks on the hero's lower-left, clear of its top label
    // and of the woman's face.
    labels: [
      ['NEON DRIVE • 11:47 PM • NO WITNESSES', ''],
      ['OCEAN DRIVE • 6:42 PM', ''],
      ['COAST ROAD • 5:15 PM • LAST LIGHT', ''],
      ['PALM BOULEVARD • 9:15 PM • FULL THROTTLE', ''],
      ['BACK ALLEY • 2:00 AM • NO TALKING', ''],
      ['EVERGLADES • LAST SWIM', ''],
      ['HOTEL ROW • 1:15 AM • PURSUIT', ''],
    ],
  },
  {
    key: 'collage', name: 'Collage', desc: 'Ten-panel GTA collage, title over the seams',
    panels: [
      [0.01563, 0.02778, 0.36719, 0.72222],
      [0.39063, 0.02778, 0.28125, 0.22222],
      [0.67969, 0.02778, 0.30469, 0.22222],
      [0.39063, 0.26389, 0.28125, 0.23611],
      [0.67969, 0.26389, 0.30469, 0.23611],
      [0.39063, 0.51389, 0.28125, 0.23611],
      [0.67969, 0.51389, 0.30469, 0.23611],
      [0.01563, 0.76389, 0.17578, 0.19444],
      [0.19922, 0.76389, 0.18359, 0.19444],
      [0.39063, 0.76389, 0.28125, 0.18056],
    ],
    title: [0.5, 0.84, 0.94],
    sub: [0.73, 0.88, -5, 'below'],
    masthead: null, band: null, numbered: false,
    // Sunset-chase title ramp (orange to red to purple) and the ORIGINAL
    // seal parked over the hero's sky, clear of every label.
    titleStops: ['#ff9a3e', '#ff6b6b', '#8e44ad'],
    seal: [0.328, 0.153, 0.062], burst: [0.065, 0.30],
    badges: { burst: true, seal: true, vol: true, est2026: true, stars: false, wanted: false, coast: false },
    foot: true, head: [0, 5, 6],
    // The full-size title (baseY 0.84) sits over the foot of the middle
    // row, so the hero and the two middle-row panels wear their labels
    // at the TOP instead of the bottom — otherwise the title hides them.
    // The bottom row keeps bottom labels: the title ends above them.
    // (Fix 2026-11-19: P1/P6/P7 bottom labels were unreadable behind the
    // title — P6 "GAS STATION • 2:00 AM • NEON GLOW" and P7 "MOTORCYCLE
    // RUN • 1:15 AM • PURSUIT" fully hidden, P1 partly covered.)
    labels: [
      ['OCEAN DRIVE • 6:42 PM • LOOKING FOR TROUBLE', ''],
      ['MARINA DEL SOL • 7:40 PM • NO WITNESSES', ''],
      ['TOWER 2 • 6:10 PM • LAST SWIM', ''],
      ['PALM BOULEVARD • 9:15 PM • LIGHTS OUT', ''],
      ['INTERSTATE 6 • 11:59 PM • FULL THROTTLE', ''],
      ['GAS STATION • 2:00 AM • NEON GLOW', ''],
      ['MOTORCYCLE RUN • 1:15 AM • PURSUIT', ''],
      ['CHROME • SUNSET REFLECTION', ''],
      ['JET SKI • GOLDEN WAKE', ''],
      ['AERIAL • PALM ROW', ''],
    ],
  },
  {
    key: 'hero-left', name: 'Hero Left', desc: 'One big hero panel, four small ones',
    panels: [
      [0, 0, 0.52, 0.8],
      [0.53, 0, 0.235, 0.395],
      [0.775, 0, 0.225, 0.395],
      [0.53, 0.405, 0.235, 0.395],
      [0.775, 0.405, 0.225, 0.395],
    ],
    title: [0.5, 0.9, 0.94],
    sub: [0.7, 0.925, -5, 'below'],
    masthead: null, band: null, numbered: false,
    seal: null, burst: null,
  },
  {
    key: 'neon-grid', name: 'Neon Grid', desc: 'Tall hero, six panels, title band',
    panels: [
      [0, 0, 0.3, 0.78],
      [0.31, 0, 0.35, 0.385],
      [0.67, 0, 0.33, 0.385],
      [0.31, 0.395, 0.17, 0.385],
      [0.49, 0.395, 0.17, 0.385],
      [0.67, 0.395, 0.16, 0.385],
      [0.84, 0.395, 0.16, 0.385],
    ],
    title: [0.55, 0.9, 0.9],
    sub: [0.62, 0.94, -3, 'below'],
    masthead: null, band: [0, 0.78, 1, 0.18], numbered: false,
    seal: null, burst: null,
  },
  {
    key: 'halftone-hero', name: 'Halftone Hero', desc: 'Big hero, filmstrip, title block',
    panels: [
      [0, 0, 0.42, 0.6],
      [0.43, 0, 0.2, 0.29],
      [0.64, 0, 0.36, 0.6],
      [0.43, 0.3, 0.2, 0.3],
      [0, 0.61, 0.105, 0.35],
      [0.115, 0.61, 0.105, 0.35],
      [0.23, 0.61, 0.105, 0.35],
      [0.345, 0.61, 0.105, 0.35],
    ],
    title: [0.73, 0.85, 0.5],
    sub: [0.73, 0.92, -4, 'below'],
    masthead: null, band: [0.46, 0.61, 0.54, 0.35], numbered: false,
    seal: null, burst: null,
  },
  {
    key: 'cast', name: 'Cast', desc: 'Five portraits, role labels',
    panels: [
      [0, 0, 0.24, 0.46],
      [0.25, 0, 0.4, 0.6],
      [0.66, 0, 0.34, 0.46],
      [0, 0.47, 0.24, 0.49],
      [0.66, 0.47, 0.34, 0.49],
    ],
    title: [0.5, 0.9, 0.94],
    sub: [0.62, 0.925, -4, 'below'],
    masthead: null, band: null, numbered: false,
    seal: null, burst: null,
  },
  {
    key: 'sun-run', name: 'Sun Run', desc: 'Hero left, three wide panels',
    panels: [
      [0, 0, 0.38, 0.78],
      [0.39, 0, 0.24, 0.385],
      [0.64, 0, 0.36, 0.385],
      [0.39, 0.395, 0.61, 0.385],
    ],
    title: [0.5, 0.9, 0.94],
    sub: [0.62, 0.925, -4, 'below'],
    masthead: null, band: null, numbered: false,
    seal: null, burst: null,
  },
  {
    key: 'one-photo', name: 'One Photo', desc: 'One photo, five different crops',
    panels: [
      [0.28, 0, 0.44, 0.78],
      [0, 0, 0.27, 0.385],
      [0.73, 0, 0.27, 0.385],
      [0, 0.395, 0.27, 0.385],
      [0.73, 0.395, 0.27, 0.385],
    ],
    title: [0.5, 0.9, 0.94],
    sub: [0.62, 0.925, -4, 'below'],
    masthead: null, band: null, numbered: false,
    seal: null, burst: null,
  },
  {
    key: 'numbered', name: 'Numbered', desc: 'Hero left, three numbered scenes',
    panels: [
      [0, 0, 0.52, 0.78],
      [0.53, 0, 0.47, 0.25],
      [0.53, 0.26, 0.47, 0.25],
      [0.53, 0.52, 0.47, 0.26],
    ],
    title: [0.3, 0.92, 0.56],
    sub: [0.3, 0.84, -4, 'above'],
    masthead: null, band: null, numbered: true,
    seal: null, burst: null,
  },
];

// The badges a layout gets when it does not name its own.
const FALLBACK_BADGES = { burst: true, seal: false, vol: true, stars: true, est2026: true, wanted: false, coast: false };

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

// Finds a layout by key, or the first one (Vice) when the key is unknown.
export const layoutFor = (key) => COVER_LAYOUTS.find((l) => l.key === key) ?? COVER_LAYOUTS[0];

// Finds a grade by id, or the first one (Sunset) when the id is unknown.
export const gradeFor = (id) => COLOR_GRADES.find((g) => g.id === id) ?? COLOR_GRADES[0];

// Fresh cover state for a layout: its photos, its labels, the default words.
// Panels carry { photo, zoom, dx, dy, caption, sub, capStyle } — the
// editor reads and writes exactly those fields.
export function buildCoverState(layoutId = 'vice', gradeId = 'sunset') {
  const layout = layoutFor(layoutId);
  const slots = slotsForLayout(layout.key);
  const panels = layout.panels.map((_, i) => {
    let slot;
    if (layout.key === 'one-photo') {
      const [photo, zoom, dx, dy] = HERO_CROPS[i];
      slot = { photo, zoom, dx, dy };
    } else {
      slot = { photo: slots[i] ?? (i % PHOTO_LIBRARY.length), zoom: 1, dx: 0, dy: 0 };
    }
    // Layouts with their own labels use them; the rest cycle the fallback
    // list so every panel still wears a place line.
    const pair = layout.labels ? (layout.labels[i] ?? ['', '']) : FALLBACK_LABELS[i % FALLBACK_LABELS.length];
    return { ...slot, caption: pair[0], sub: pair[1], capStyle: 'place' };
  });
  return {
    layout: layout.key,
    grade: gradeId,
    title: 'SUNSET CHASE',
    subtitle: 'Golden Hour Getaway',
    tagline: 'ONE COAST · NO RULES · COMING SOON',
    badges: layout.badges ?? FALLBACK_BADGES,
    panels,
  };
}

// Panel rectangles in canvas pixels for a layout at cover size w×h. A small
// gap (at least 2 px) separates the panels so the dark base shows through
// as hairlines, the way the reference poster does.
export function coverRects(layoutId, w, h) {
  const layout = layoutFor(layoutId);
  const gap = Math.max(2, Math.round(w * 0.004));
  return layout.panels.map(([left, top, pw, ph]) => ({
    x: left * w + gap / 2,
    y: top * h + gap / 2,
    w: pw * w - gap,
    h: ph * h - gap,
  }));
}

// Which panel (index) holds canvas point px,py, or -1 when the point is on
// a gap or outside every panel. Checked topmost-first so overlapping
// panels resolve to the one drawn last.
export function panelAt(layoutId, w, h, px, py) {
  const rects = coverRects(layoutId, w, h);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}

// ============================================================================
// The paint bundle
// ============================================================================
//
// makePaint() gathers everything a drawing step needs into one plain
// object: the 2D context, the cover size, the cover state, the loaded
// photos, the resolved grade and layout, and the panel rectangles in
// pixels. Every step below takes that bundle and nothing else, so a step
// can be read, tested and changed on its own.
const makePaint = (ctx, w, h, state, photos) => ({
  ctx, w, h, state, photos,
  grade: gradeFor(state.grade),
  layout: layoutFor(state.layout),
  rects: coverRects(state.layout, w, h),
});

// The whole poster, painted in a fixed order:
//
//   1. dark base fill
//   2. each panel's photo (grade filter + warm wash), halftone dots where
//      the grade asks for them
//   3. panel labels and number badges
//   4. the title band (layouts that have one)
//   5. masthead, title, subtitle, badges, tagline
//   6. a thin outer frame
//
// The title band goes after the panels and labels but before the masthead
// and title, so the band sits behind the words and never covers them.
// (The entry point itself, renderCover, lives at the bottom of this file
// with the other public functions; the steps it calls are below.)

// -- base and frame ---------------------------------------------------------

const paintBase = (p) => {
  p.ctx.clearRect(0, 0, p.w, p.h);
  p.ctx.fillStyle = '#14091f';
  p.ctx.fillRect(0, 0, p.w, p.h);
};

const paintFrame = (p) => {
  p.ctx.strokeStyle = '#0a0312';
  p.ctx.lineWidth = Math.max(3, p.w * 0.004);
  p.ctx.strokeRect(0, 0, p.w, p.h);
};

// -- photos -----------------------------------------------------------------

// Clips the context to a rectangle, returning nothing; the caller restores.
const clipRect = (p, rect) => {
  p.ctx.save();
  p.ctx.beginPath();
  p.ctx.rect(rect.x, rect.y, rect.w, rect.h);
  p.ctx.clip();
};

// The empty-slot look: a dark violet gradient and a centred hint.
const paintEmpty = (p, rect) => {
  const g = p.ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, '#3a1c4d');
  g.addColorStop(1, '#14091f');
  p.ctx.fillStyle = g;
  p.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  p.ctx.fillStyle = 'rgba(255,255,255,0.65)';
  p.ctx.font = `600 ${Math.max(12, rect.h * 0.06)}px system-ui, sans-serif`;
  p.ctx.textAlign = 'center';
  p.ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
};

// The grade's warm wash over a panel: bright on top, deep at the foot.
const washPanel = (p, rect) => {
  const tint = p.ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  tint.addColorStop(0, p.grade.topWash);
  tint.addColorStop(1, p.grade.footWash);
  p.ctx.fillStyle = tint;
  p.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
};

// Paints one photo into a panel rect, cover-fit, with zoom and pan.
const paintPhoto = (p, panel, rect) => {
  clipRect(p, rect);
  const photo = p.photos[panel.photo] ?? null;
  if (!photo) {
    paintEmpty(p, rect);
    p.ctx.restore();
    return;
  }
  const pw = photo.naturalWidth;
  const ph = photo.naturalHeight;
  const fit = Math.max(rect.w / pw, rect.h / ph);
  const zoomed = fit * (panel.zoom || 1);
  const dw = pw * zoomed;
  const dh = ph * zoomed;
  const shiftX = (panel.dx || 0) * rect.w;
  const shiftY = (panel.dy || 0) * rect.h;
  const cx = rect.x + rect.w / 2 + shiftX;
  const cy = rect.y + rect.h / 2 + shiftY;
  p.ctx.filter = p.grade.filter;
  p.ctx.drawImage(photo, cx - dw / 2, cy - dh / 2, dw, dh);
  p.ctx.filter = 'none';
  washPanel(p, rect);
  p.ctx.restore();
};

// Posterizes a pixel block to four levels per channel.
const posterize = (data) => {
  const steps = [0, 85, 170, 255];
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = steps[Math.round((d[i] / 255) * 3)];
    d[i + 1] = steps[Math.round((d[i + 1] / 255) * 3)];
    d[i + 2] = steps[Math.round((d[i + 2] / 255) * 3)];
  }
};

// A dot screen over a rectangle: small dark dots on a grid.
const dotScreen = (p, rect) => {
  const ix = Math.max(0, Math.floor(rect.x));
  const iy = Math.max(0, Math.floor(rect.y));
  const iw = Math.max(1, Math.floor(rect.w));
  const ih = Math.max(1, Math.floor(rect.h));
  const step = Math.max(5, Math.round(rect.w / 90));
  p.ctx.save();
  p.ctx.beginPath();
  p.ctx.rect(rect.x, rect.y, rect.w, rect.h);
  p.ctx.clip();
  p.ctx.fillStyle = 'rgba(20,5,30,0.20)';
  for (let y = iy + step / 2; y < iy + ih; y += step) {
    for (let x = ix + step / 2; x < ix + iw; x += step) {
      p.ctx.beginPath();
      p.ctx.arc(x, y, step * 0.16, 0, Math.PI * 2);
      p.ctx.fill();
    }
  }
  p.ctx.restore();
};

// Posterizes one panel rect (halftone grade) and overlays a dot screen.
const halftonePanel = (p, rect) => {
  const ix = Math.max(0, Math.floor(rect.x));
  const iy = Math.max(0, Math.floor(rect.y));
  const iw = Math.max(1, Math.floor(rect.w));
  const ih = Math.max(1, Math.floor(rect.h));
  let data;
  try {
    data = p.ctx.getImageData(ix, iy, iw, ih);
  } catch {
    return;
  }
  posterize(data);
  p.ctx.putImageData(data, ix, iy);
  dotScreen(p, rect);
};

// Every panel's photo, then the halftone treatment where the grade wants it.
const paintPhotos = (p) => {
  p.state.panels.forEach((panel, i) => {
    const rect = p.rects[i];
    if (!rect) return;
    paintPhoto(p, panel, rect);
    if (p.grade.halftone) halftonePanel(p, rect);
  });
};

// -- panel labels -----------------------------------------------------------

// How wide the label box is at a font size: widest line plus padding.
const labelWidth = (p, panel, size, pad) => {
  p.ctx.font = `700 ${size}px "Bebas Neue", "Archivo Black", sans-serif`;
  const capW = p.ctx.measureText(panel.caption.toUpperCase()).width;
  p.ctx.font = `600 ${size * 0.62}px system-ui, sans-serif`;
  const subW = panel.sub ? p.ctx.measureText(panel.sub.toUpperCase()).width : 0;
  return Math.max(capW, subW) + pad * 2;
};

// Whether a panel's label goes at the top instead of the foot. A layout
// can pin specific panels to the top (when the title overlaps their foot);
// otherwise the old rule applies — a small bottom-row panel (other than
// the hero) wears its label at the top, unless the layout says its
// raised title leaves the foot clear.
const labelOnTop = (p, index, rect) => {
  if (p.layout.head?.includes(index)) return true;
  if (p.layout.head) return false;
  return !p.layout.foot && index !== 0 && rect.y + rect.h > p.h * 0.72;
};

// A dark label at the foot of a panel — or at its head when the title
// overlaps the foot (the bottom row of a layout). The font shrinks until
// the box fits inside the panel; the floor is 7, not 10, because a
// narrow-but-tall panel (e.g. P8 in the 960x1200 portrait shot) would
// otherwise bottom out at 10 with its tail — "REFLECTION"'s "ON" —
// hidden behind the next panel's label bar. The Vice layout's narrow
// cap/airboat panels need 7 at portrait size when the fallback grotesque
// (wider than Bebas Neue) is in use.
const paintLabel = (p, panel, rect, index) => {
  if (!panel.caption || panel.capStyle === 'none') return;
  const pad = Math.max(6, rect.h * 0.045);
  let fs = Math.max(11, Math.min(rect.h * 0.06, rect.w * 0.09, 34));
  while (fs > 7 && labelWidth(p, panel, fs, pad) > rect.w - pad) fs -= 1;
  p.ctx.save();
  p.ctx.font = `700 ${fs}px "Bebas Neue", "Archivo Black", sans-serif`;
  const capW = p.ctx.measureText(panel.caption.toUpperCase()).width;
  p.ctx.font = `600 ${fs * 0.62}px system-ui, sans-serif`;
  const subW = panel.sub ? p.ctx.measureText(panel.sub.toUpperCase()).width : 0;
  const boxW = Math.max(capW, subW) + pad * 2;
  const boxH = panel.sub ? fs * 2.1 : fs * 1.35;
  const bx = rect.x + pad * 0.7;
  const atTop = labelOnTop(p, index, rect);
  const by = atTop ? rect.y + pad * 0.7 : rect.y + rect.h - boxH - pad * 0.7;
  if (panel.capStyle === 'role') {
    // Role label: a white box with dark text, centred on the box.
    p.ctx.fillStyle = '#ffffff';
    p.ctx.fillRect(bx, by, boxW, boxH);
    p.ctx.fillStyle = '#14091f';
    p.ctx.textAlign = 'left';
    p.ctx.textBaseline = 'middle';
    p.ctx.font = `700 ${fs}px "Bebas Neue", "Archivo Black", sans-serif`;
    p.ctx.fillText(panel.caption.toUpperCase(), bx + pad, by + boxH / 2);
  } else {
    // Place label: a dark box, white headline, pink sub-line.
    p.ctx.fillStyle = 'rgba(10,4,18,0.82)';
    p.ctx.fillRect(bx, by, boxW, boxH);
    p.ctx.fillStyle = '#ffffff';
    p.ctx.textAlign = 'left';
    p.ctx.textBaseline = 'alphabetic';
    p.ctx.font = `700 ${fs}px "Bebas Neue", "Archivo Black", sans-serif`;
    p.ctx.fillText(panel.caption.toUpperCase(), bx + pad, by + fs * 0.95);
    if (panel.sub) {
      p.ctx.fillStyle = '#ffb3d1';
      p.ctx.font = `600 ${fs * 0.62}px system-ui, sans-serif`;
      p.ctx.fillText(panel.sub.toUpperCase(), bx + pad, by + fs * 1.8);
    }
  }
  p.ctx.restore();
};

// A number badge at a panel's top right, clear of a top label.
const paintNumber = (p, rect, i) => {
  const r = Math.max(12, Math.min(rect.w, rect.h) * 0.14);
  const cx = rect.x + rect.w - r * 1.1;
  const cy = rect.y + r * 1.1;
  p.ctx.save();
  p.ctx.beginPath();
  p.ctx.arc(cx, cy, r, 0, Math.PI * 2);
  p.ctx.fillStyle = '#14091f';
  p.ctx.fill();
  p.ctx.fillStyle = '#ffffff';
  p.ctx.font = `800 ${r}px "Archivo Black", sans-serif`;
  p.ctx.textAlign = 'center';
  p.ctx.textBaseline = 'middle';
  p.ctx.fillText(String(i).padStart(2, '0'), cx, cy + r * 0.05);
  p.ctx.restore();
};

// Labels and numbers sit above the photos.
const paintLabels = (p) => {
  p.state.panels.forEach((panel, i) => {
    const rect = p.rects[i];
    if (!rect) return;
    paintLabel(p, panel, rect, i);
    if (p.layout.numbered && i > 0) paintNumber(p, rect, i);
  });
};

// -- title and subtitle -----------------------------------------------------

// Shrinks a font until the text fits inside a width.
const fitToWidth = (p, text, start, limit, family) => {
  let size = start;
  p.ctx.font = `${size}px ${family}`;
  while (size > 12 && p.ctx.measureText(text).width > limit) {
    size -= 2;
    p.ctx.font = `${size}px ${family}`;
  }
  return size;
};

// A top-to-bottom gradient from a ramp of colour stops.
const rampFill = (p, ramp, top, bottom) => {
  const grad = p.ctx.createLinearGradient(0, top, 0, bottom);
  ramp.forEach((c, i) => grad.addColorStop(i / (ramp.length - 1), c));
  return grad;
};

// The outline + shadow + gradient fill shared by both title shapes.
const titleChrome = (p, size) => {
  p.ctx.save();
  p.ctx.textAlign = 'center';
  p.ctx.textBaseline = 'alphabetic';
  p.ctx.lineJoin = 'round';
  p.ctx.font = `${size}px "Archivo Black", sans-serif`;
  p.ctx.shadowColor = 'rgba(40,0,70,0.85)';
  p.ctx.shadowBlur = size * 0.12;
  p.ctx.shadowOffsetX = size * 0.03;
  p.ctx.shadowOffsetY = size * 0.05;
  p.ctx.strokeStyle = '#160a24';
  p.ctx.lineWidth = Math.max(4, size * 0.13);
};

// The huge gradient title with a thick dark outline and a drop shadow.
// A stacked title ("SUNSET" over "CHASE") fills a narrow title block the
// way the reference logo does: each word on its own line, sized to the
// longest word, the block's baseline at baseY.
const paintTitle = (p) => {
  const text = (p.state.title || '').trim().toUpperCase();
  if (!text) return;
  const [cxF, baseYF, maxWF] = p.layout.title;
  const maxW = maxWF * p.w;
  const startSize = Math.round(p.w * 0.125);
  const ramp = p.layout.titleStops ?? p.grade.titleStops;
  const cx = cxF * p.w;
  const baseY = baseYF * p.h;
  if (p.layout.stacked) {
    const words = text.split(/\s+/);
    const longest = words.reduce((a, b) => (a.length >= b.length ? a : b));
    const size = fitToWidth(p, longest, startSize, maxW, '"Archivo Black", sans-serif');
    const lineH = size * 0.98;
    const top = baseY - lineH * words.length;
    const grad = rampFill(p, ramp, top, baseY + size * 0.08);
    titleChrome(p, size);
    words.forEach((word, i) => {
      p.ctx.strokeText(word, cx, baseY - (words.length - 1 - i) * lineH);
    });
    p.ctx.shadowColor = 'transparent';
    p.ctx.shadowBlur = 0;
    p.ctx.shadowOffsetX = 0;
    p.ctx.shadowOffsetY = 0;
    p.ctx.fillStyle = grad;
    words.forEach((word, i) => {
      p.ctx.fillText(word, cx, baseY - (words.length - 1 - i) * lineH);
    });
    p.ctx.restore();
    return;
  }
  const size = fitToWidth(p, text, startSize, maxW, '"Archivo Black", sans-serif');
  const top = baseY - size * 0.82;
  const grad = rampFill(p, ramp, top, baseY + size * 0.08);
  titleChrome(p, size);
  p.ctx.strokeText(text, cx, baseY);
  p.ctx.shadowColor = 'transparent';
  p.ctx.shadowBlur = 0;
  p.ctx.shadowOffsetX = 0;
  p.ctx.shadowOffsetY = 0;
  p.ctx.fillStyle = grad;
  p.ctx.fillText(text, cx, baseY);
  p.ctx.restore();
};

// The pink script subtitle, tilted, overlapping the title. Painted twice:
// once in pink with a glow, once in white slightly higher, so the letters
// read as a neon sign with a bright core.
const paintSubtitle = (p) => {
  const text = (p.state.subtitle || '').trim();
  if (!text) return;
  const [cxF, baseYF, slant] = p.layout.sub;
  const size = Math.round(p.w * 0.038 * (p.layout.subScale ?? 1));
  p.ctx.save();
  p.ctx.translate(cxF * p.w, baseYF * p.h);
  p.ctx.rotate(((slant ?? -4) * Math.PI) / 180);
  p.ctx.textAlign = 'center';
  p.ctx.textBaseline = 'alphabetic';
  p.ctx.font = `${size}px "Pacifico", cursive`;
  p.ctx.shadowColor = 'rgba(255,46,136,0.9)';
  p.ctx.shadowBlur = size * 0.45;
  p.ctx.fillStyle = '#ff8fc0';
  p.ctx.fillText(text, 0, 0);
  p.ctx.shadowBlur = 0;
  p.ctx.fillStyle = '#ffffff';
  p.ctx.globalAlpha = 0.9;
  p.ctx.fillText(text, 0, -size * 0.04);
  p.ctx.restore();
};

// -- badges -----------------------------------------------------------------

// A spiky starburst badge (e.g. NEW SUMMER 2026).
const paintBurst = (p, cx, cy, r, label, sub) => {
  p.ctx.save();
  p.ctx.translate(cx, cy);
  const spikes = 14;
  const points = spikes * 2;
  p.ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const rad = i % 2 === 0 ? r : r * 0.78;
    const a = (i / points) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) p.ctx.moveTo(x, y);
    else p.ctx.lineTo(x, y);
  }
  p.ctx.closePath();
  p.ctx.fillStyle = '#ffd94d';
  p.ctx.strokeStyle = '#14091f';
  p.ctx.lineWidth = Math.max(2, r * 0.06);
  p.ctx.fill();
  p.ctx.stroke();
  p.ctx.fillStyle = '#14091f';
  p.ctx.textAlign = 'center';
  p.ctx.textBaseline = 'middle';
  p.ctx.font = `800 ${r * 0.34}px "Archivo Black", sans-serif`;
  p.ctx.fillText(label, 0, -r * 0.12);
  p.ctx.font = `700 ${r * 0.2}px system-ui, sans-serif`;
  p.ctx.fillText(sub, 0, r * 0.28);
  p.ctx.restore();
};

// A round gold seal (e.g. EST. 2026).
const paintSeal = (p, cx, cy, r, lines) => {
  p.ctx.save();
  p.ctx.translate(cx, cy);
  p.ctx.beginPath();
  p.ctx.arc(0, 0, r, 0, Math.PI * 2);
  p.ctx.fillStyle = '#ffd94d';
  p.ctx.strokeStyle = '#14091f';
  p.ctx.lineWidth = Math.max(2, r * 0.07);
  p.ctx.fill();
  p.ctx.stroke();
  p.ctx.beginPath();
  p.ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  p.ctx.setLineDash([r * 0.08, r * 0.08]);
  p.ctx.strokeStyle = '#14091f';
  p.ctx.lineWidth = Math.max(1, r * 0.04);
  p.ctx.stroke();
  p.ctx.setLineDash([]);
  p.ctx.fillStyle = '#14091f';
  p.ctx.textAlign = 'center';
  p.ctx.textBaseline = 'middle';
  p.ctx.font = `800 ${r * 0.3}px "Archivo Black", sans-serif`;
  lines.forEach((line, i) => {
    p.ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * r * 0.36);
  });
  p.ctx.restore();
};

// A small pill badge: a coloured box with centred text at (x, y). padW
// scales the box width past the text, boxH its height, textDx/textDy the
// text offset inside it; outline, when given, is stroked around it.
const drawPill = (p, { label, font, x, y, padW, boxH, textDx, textDy, fill, outline, outlineW, color }) => {
  p.ctx.save();
  p.ctx.font = font;
  const tw = p.ctx.measureText(label).width;
  const bw = tw + padW;
  p.ctx.fillStyle = fill;
  p.ctx.fillRect(x, y, bw, boxH);
  if (outline) {
    p.ctx.strokeStyle = outline;
    p.ctx.lineWidth = outlineW;
    p.ctx.strokeRect(x, y, bw, boxH);
  }
  p.ctx.fillStyle = color;
  p.ctx.textAlign = 'left';
  p.ctx.textBaseline = 'middle';
  p.ctx.fillText(label, x + textDx, y + textDy);
  p.ctx.restore();
  return tw;
};

// Measures a pill label's text width without drawing anything.
const pillWidth = (p, label, font) => {
  p.ctx.save();
  p.ctx.font = font;
  const tw = p.ctx.measureText(label).width;
  p.ctx.restore();
  return tw;
};

// All toggleable badges, each at its fixed spot on the cover.
const paintBadges = (p) => {
  const b = p.state.badges || {};
  const u = Math.min(p.w, p.h);
  const burstAt = p.layout.burst ?? [0.065, 0.075];
  if (b.burst) paintBurst(p, p.w * burstAt[0], p.h * burstAt[1], u * 0.05, 'NEW', 'SUMMER 2026');
  if (b.est2026) paintSeal(p, p.w * 0.065, p.h * 0.185, u * 0.04, ['EST.', '2026']);
  if (b.wanted) {
    const fs = Math.max(12, u * 0.022);
    const label = 'WANTED ★★★★★';
    const font = `800 ${fs}px "Archivo Black", sans-serif`;
    const tw = pillWidth(p, label, font);
    drawPill(p, {
      label, font,
      x: p.w - tw - fs * 2.2,
      y: p.h * 0.02,
      padW: fs * 1.4,
      boxH: fs * 1.9,
      textDx: fs * 0.7,
      textDy: fs * 0.98,
      fill: '#14091f',
      outline: null,
      color: '#ffd94d',
    });
  }
  if (b.vol) {
    const fs = Math.max(12, u * 0.024);
    const label = 'VOL. 06';
    const font = `800 ${fs}px "Archivo Black", sans-serif`;
    const tw = pillWidth(p, label, font);
    drawPill(p, {
      label, font,
      x: p.w - tw - fs * 2.4,
      y: p.h * 0.09,
      padW: fs * 1.4,
      boxH: fs * 1.9,
      textDx: fs * 0.7,
      textDy: fs * 0.98,
      fill: '#22b8e6',
      outline: '#14091f',
      outlineW: Math.max(2, fs * 0.12),
      color: '#ffffff',
    });
  }
  if (b.coast) {
    const fs = Math.max(12, u * 0.022);
    const label = 'COAST EDITION';
    const font = `800 ${fs}px "Archivo Black", sans-serif`;
    const tw = pillWidth(p, label, font);
    drawPill(p, {
      label, font,
      x: p.w * 0.02,
      y: p.h * 0.02,
      padW: fs * 1.4,
      boxH: fs * 1.9,
      textDx: fs * 0.7,
      textDy: fs * 0.98,
      fill: '#14091f',
      outline: null,
      color: '#ffd94d',
    });
  }
  if (b.seal) {
    // The collage parks the seal on the P5/P7 seam; other layouts centre it.
    const spot = p.layout.seal ?? [0.5, 0.42, 0.05];
    paintSeal(p, p.w * spot[0], p.h * spot[1], u * spot[2], ['★ ★ ★', 'ORIGINAL', 'COVER ART']);
  }
  if (b.stars) {
    // A black pill at the top right, under VOL. 06, clear of the title.
    const fs = Math.max(13, u * 0.026);
    const label = '★ ★ ★ ★ ★';
    const font = `${fs}px sans-serif`;
    const tw = pillWidth(p, label, font);
    drawPill(p, {
      label, font,
      x: p.w - tw - fs * 2.4,
      y: p.h * 0.16,
      padW: fs * 1.6,
      boxH: fs * 1.8,
      textDx: fs * 0.8,
      textDy: fs * 0.92,
      fill: 'rgba(10,4,18,0.88)',
      outline: null,
      color: '#ffd94d',
    });
  }
};

// -- masthead, title band and tagline ---------------------------------------

// The studio bar along the top of the hero, as in the reference: gold
// stars on the left, the studio label centred. Our own studio name.
// The label font is shrunk by measurement until it clears the stars, so
// the bar stays readable at every export aspect (the label is long and
// the fallback grotesque is much wider than Bebas Neue).
const paintMasthead = (p) => {
  const label = p.layout.masthead;
  if (!label) return;
  const x = 0.017 * p.w;
  const y = 0.017 * p.h;
  const bw = 0.549 * p.w;
  const bh = 0.07 * p.h;
  p.ctx.save();
  p.ctx.fillStyle = '#0a0312';
  p.ctx.fillRect(x, y, bw, bh);
  const starSize = bh * 0.42;
  p.ctx.font = `${starSize}px sans-serif`;
  p.ctx.fillStyle = '#ff9a3e';
  p.ctx.textAlign = 'left';
  p.ctx.textBaseline = 'middle';
  const stars = '★ ★ ★ ★ ★';
  const starsW = p.ctx.measureText(stars).width;
  const gap = bh * 0.3;
  p.ctx.fillText(stars, x + bh * 0.25, y + bh * 0.52);
  // Centred label: its left edge must clear the stars, so its max width
  // is the bar minus twice the stars-plus-gaps block.
  const maxLabelW = bw - 2 * (bh * 0.25 + starsW + gap);
  let labelSize = bh * 0.42;
  p.ctx.font = `700 ${labelSize}px "Bebas Neue", "Archivo Black", sans-serif`;
  while (labelSize > 8 && p.ctx.measureText(label).width > maxLabelW) {
    labelSize -= 1;
    p.ctx.font = `700 ${labelSize}px "Bebas Neue", "Archivo Black", sans-serif`;
  }
  p.ctx.fillStyle = '#ffe9a3';
  p.ctx.textAlign = 'center';
  p.ctx.fillText(label, x + bw / 2, y + bh * 0.54);
  p.ctx.restore();
};

// A solid band behind the title, for the layouts that have one.
const paintBand = (p, band) => {
  const [bx, by, bw, bh] = band;
  const g = p.ctx.createLinearGradient(0, by * p.h, 0, (by + bh) * p.h);
  g.addColorStop(0, '#2b0a3d');
  g.addColorStop(1, '#12041f');
  p.ctx.fillStyle = g;
  p.ctx.fillRect(bx * p.w, by * p.h, bw * p.w, bh * p.h);
  p.ctx.fillStyle = '#ff2e88';
  p.ctx.fillRect(bx * p.w, by * p.h, bw * p.w, Math.max(2, p.h * 0.006));
};

// The tagline strip along the very bottom of the cover.
const paintTagline = (p) => {
  const text = (p.state.tagline || '').trim().toUpperCase();
  if (!text) return;
  const stripH = Math.max(18, p.h * 0.042);
  const y = p.h - stripH;
  p.ctx.save();
  const g = p.ctx.createLinearGradient(0, y, 0, p.h);
  g.addColorStop(0, 'rgba(20,5,30,0.92)');
  g.addColorStop(1, 'rgba(60,5,50,0.95)');
  p.ctx.fillStyle = g;
  p.ctx.fillRect(0, y, p.w, stripH);
  p.ctx.fillStyle = '#ff2e88';
  p.ctx.fillRect(0, y, p.w, Math.max(2, stripH * 0.08));
  const fs = stripH * 0.42;
  p.ctx.font = `700 ${fs}px "Bebas Neue", "Archivo Black", sans-serif`;
  p.ctx.textAlign = 'center';
  p.ctx.textBaseline = 'middle';
  p.ctx.fillStyle = '#ffe9f3';
  let label = text.split('').join(' ');
  while (p.ctx.measureText(label).width > p.w * 0.92 && fs > 8) {
    label = text;
    break;
  }
  p.ctx.fillText(label, p.w / 2, y + stripH * 0.55);
  p.ctx.restore();
};

// ---------------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------------

// Renders the whole cover onto ctx at size w×h. photos is an array of
// HTMLImageElement (or null) in the state's photo order.
export function renderCover(ctx, w, h, state, photos) {
  // A paint with no state or no photo list draws nothing: the caller
  // (preview or export) always passes both, so this only guards against
  // a programming error, never against a real cover.
  if (!state || !photos) return;
  const p = makePaint(ctx, w, h, state, photos);
  p.ctx.save();
  paintBase(p);
  paintPhotos(p);
  paintLabels(p);
  if (p.layout.band) paintBand(p, p.layout.band);
  paintMasthead(p);
  paintTitle(p);
  paintSubtitle(p);
  paintBadges(p);
  paintTagline(p);
  paintFrame(p);
  p.ctx.restore();
}

// Draws the cover onto a canvas element at its own size.
export function paintCanvas(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  renderCover(ctx, canvas.width, canvas.height, state, photos);
}

// Exports the cover at an export size, resolving to a PNG blob.
export function exportPng(state, photos, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  paintCanvas(canvas, state, photos);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
