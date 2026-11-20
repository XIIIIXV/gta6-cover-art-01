// Coastline Cover Studio — cover painter, second draft.
//
// This module turns a cover state (which layout, which colour grade, which
// photos, which words) into pixels on a 2D canvas. One entry point paints
// the whole poster; the same painter feeds the live preview in the editor
// and the PNG files the app exports, so the preview and the export agree.
//
// The bundled photos are crops of the two GTA VI fanmade covers the user
// supplied and explicitly cleared for this entry (2026-11-20). Each crop was
// checked to leave out every Rockstar mark: no GTA logo, no R* badge, no
// FANMADE stamp, no reference seal. The cover's own title, subtitle and
// studio line replace the reference wording, and the fonts are SIL Open
// Font License files shipped under app/fonts. Nothing here is Rockstar
// artwork, a Rockstar logo, or a Rockstar font.

// Every photo the app ships with: a stable key, the file under app/, and a
// short note so the editor's photo strip can name it.
export const PHOTO_LIBRARY = [
  { key: 'vi-hero', path: 'samples/vi-hero.jpg', note: 'Woman with gun' },
  { key: 'vi-cap', path: 'samples/vi-cap.jpg', note: 'Man with cap' },
  { key: 'vi-coast', path: 'samples/vi-coast.jpg', note: 'Coast road' },
  { key: 'vi-redcar', path: 'samples/vi-redcar.jpg', note: 'Red car chase' },
  { key: 'vi-masked', path: 'samples/vi-masked.jpg', note: 'Masked man' },
  { key: 'vi-airboat', path: 'samples/vi-airboat.jpg', note: 'Airboat' },
  { key: 'vi-bike', path: 'samples/vi-bike.jpg', note: 'Night rider' },
  { key: 'vi-heli', path: 'samples/vi-heli.jpg', note: 'Helicopter' },
  { key: 'vi-sunset', path: 'samples/vi-sunset.jpg', note: 'Woman at sunset' },
  { key: 'vi-muscle', path: 'samples/vi-muscle.jpg', note: 'Muscle car' },
  { key: 'vi-floral', path: 'samples/vi-floral.jpg', note: 'Floral shirt' },
  { key: 'vi-swamp', path: 'samples/vi-swamp.jpg', note: 'Swamp run' },
];

// A colour grade: the canvas filter the photos are painted through, the
// warm tint washed over them, the ramp the title is filled with, and
// whether the panels get the halftone dot treatment.
export const COLOR_GRADES = [
  {
    id: 'sunset',
    name: 'Sunset',
    swatch: 'linear-gradient(135deg,#ffd94d,#ff7a1a 55%,#ff2e88)',
    photoFilter: 'saturate(1.45) contrast(1.12) brightness(1.04) sepia(0.18)',
    tintHi: 'rgba(255,120,60,0.05)',
    tintLo: 'rgba(255,40,110,0.30)',
    titleRamp: ['#ffffff', '#ffe9a3', '#ffb347', '#ff7a1a', '#ff2e88'],
    dotted: false,
  },
  {
    id: 'neon',
    name: 'Neon',
    swatch: 'linear-gradient(135deg,#22e6ff,#ff2e88 60%,#b537ff)',
    photoFilter: 'saturate(1.7) contrast(1.2) brightness(0.98) hue-rotate(-15deg)',
    tintHi: 'rgba(40,220,255,0.10)',
    tintLo: 'rgba(255,20,140,0.32)',
    titleRamp: ['#ffffff', '#b8f6ff', '#22e6ff', '#ff2e88', '#b537ff'],
    dotted: false,
  },
  {
    id: 'heatwave',
    name: 'Heatwave',
    swatch: 'linear-gradient(135deg,#fff3a3,#ff5a1a 55%,#d21f3c)',
    photoFilter: 'saturate(1.6) contrast(1.25) brightness(1.08) sepia(0.35)',
    tintHi: 'rgba(255,160,40,0.12)',
    tintLo: 'rgba(210,20,40,0.34)',
    titleRamp: ['#ffffff', '#fff3a3', '#ffb347', '#ff5a1a', '#d21f3c'],
    dotted: false,
  },
  {
    id: 'golden',
    name: 'Golden',
    swatch: 'linear-gradient(135deg,#fff8d6,#ffd94d 55%,#ff9e2e)',
    photoFilter: 'saturate(1.3) contrast(1.05) brightness(1.1) sepia(0.3)',
    tintHi: 'rgba(255,210,90,0.14)',
    tintLo: 'rgba(255,140,30,0.26)',
    titleRamp: ['#ffffff', '#fff8d6', '#ffd94d', '#ff9e2e', '#ff7a1a'],
    dotted: false,
  },
  {
    id: 'dusk',
    name: 'Dusk',
    swatch: 'linear-gradient(135deg,#c9b8ff,#7a5cff 55%,#ff5da2)',
    photoFilter: 'saturate(1.2) contrast(1.1) brightness(0.92) hue-rotate(15deg)',
    tintHi: 'rgba(120,90,255,0.16)',
    tintLo: 'rgba(40,10,80,0.34)',
    titleRamp: ['#ffffff', '#e6dcff', '#c9b8ff', '#7a5cff', '#ff5da2'],
    dotted: false,
  },
  {
    id: 'halftone',
    name: 'Halftone',
    swatch: 'linear-gradient(135deg,#fff,#ff5da2 55%,#1a0b2e)',
    photoFilter: 'saturate(1.5) contrast(1.3) brightness(1.02)',
    tintHi: 'rgba(255,90,160,0.08)',
    tintLo: 'rgba(40,0,60,0.28)',
    titleRamp: ['#ffffff', '#ffe9a3', '#ffb347', '#ff5da2', '#d21f3c'],
    dotted: true,
  },
  {
    id: 'vice',
    name: 'Vice',
    swatch: 'linear-gradient(135deg,#22e6ff,#ff2e88 55%,#ffd94d)',
    photoFilter: 'saturate(1.6) contrast(1.15) hue-rotate(-25deg)',
    tintHi: 'rgba(34,230,255,0.12)',
    tintLo: 'rgba(255,46,136,0.30)',
    titleRamp: ['#ffffff', '#b8f6ff', '#22e6ff', '#ff2e88', '#ffd94d'],
    dotted: false,
  },
];

// The post sizes the app exports to.
export const POST_SIZES = [
  { key: 'square', name: '1080 × 1080', w: 1080, h: 1080 },
  { key: 'portrait', name: '1080 × 1350', w: 1080, h: 1350 },
  { key: 'wide', name: '1920 × 1080', w: 1920, h: 1080 },
];

// Fallback panel labels for layouts that do not carry their own: a place
// line and a time line, cycled through by panel index.
export const FALLBACK_LABELS = [
  { main: 'OCEAN DRIVE', sub: '6:42 PM · LOOKING FOR TROUBLE' },
  { main: 'MARINA DEL SOL', sub: '7:40 PM · NO WITNESSES' },
  { main: 'TOWER 2', sub: '6:10 PM · LAST SWIM' },
  { main: 'PALM BOULEVARD', sub: '9:15 PM · LIGHTS OUT' },
  { main: 'INTERSTATE 6', sub: '11:59 PM · FULL THROTTLE' },
  { main: 'PIER 26', sub: '5:30 AM · GONE FISHING' },
  { main: 'SUNSET HEIGHTS', sub: '8:30 PM · BIG MONEY' },
  { main: 'BOARDWALK', sub: '10:05 PM · LAST CALL' },
];

// The one-photo layout shows the hero photo five ways: whole, then four
// zoomed corners. Each row is [photo slot, zoom, pan x, pan y].
const HERO_CROPS = [
  [0, 1.0, 0, 0],
  [0, 1.9, -0.18, -0.05],
  [0, 1.9, 0.22, -0.12],
  [0, 1.9, -0.28, 0.14],
  [0, 1.9, 0.28, 0.1],
];

// Photo slots per layout, as indexes into the photo list. (0 hero, 1 cap,
// 2 coast, 3 red car, 4 masked, 5 airboat, 6 bike, 7 helicopter, 8 sunset,
// 9 muscle, 10 floral, 11 swamp.)
function photosForLayout(layoutId) {
  switch (layoutId) {
    case 'vice': return [0, 1, 2, 3, 4, 5, 6];
    case 'collage': return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    case 'hero-left': return [0, 1, 2, 3, 1];
    case 'neon-grid': return [0, 1, 3, 2, 1, 0, 2];
    case 'halftone-hero': return [0, 2, 1, 3, 0, 1, 2, 3];
    case 'cast': return [1, 0, 8, 4, 10];
    case 'sun-run': return [0, 1, 2, 3];
    case 'one-photo': return [0, 0, 0, 0, 0];
    case 'numbered': return [0, 3, 1, 2];
    default: return [];
  }
}

// A layout: panel rectangles as fractions of the cover, where the title and
// subtitle anchor, which badges show, and which labels the panels wear.
// Panels tile the whole cover; the title and the tagline strip are painted
// over the lower part of it.
export const COVER_LAYOUTS = [
  {
    id: 'vice',
    name: 'Vice',
    desc: 'GTA VI cover: big hero, title block, seven panels',
    // Geometry follows the user's GTA VI wide reference: a tall hero on the
    // left, a mosaic on the right, and a dark title block centre-bottom
    // holding the stacked title and the script subtitle. The tagline strip
    // runs along the very bottom. Panels stop at y 0.958; the tagline takes
    // the last 0.042.
    panels: [
      { x: 0.017, y: 0.087, w: 0.549, h: 0.513 },
      { x: 0.571, y: 0.03, w: 0.166, h: 0.285 },
      { x: 0.742, y: 0.03, w: 0.24, h: 0.285 },
      { x: 0.571, y: 0.323, w: 0.411, h: 0.252 },
      { x: 0.017, y: 0.61, w: 0.256, h: 0.348 },
      { x: 0.576, y: 0.583, w: 0.156, h: 0.375 },
      { x: 0.737, y: 0.583, w: 0.245, h: 0.375 },
    ],
    // Stacked two-line title ("SUNSET" over "CHASE") sized to the longest
    // word, filling the narrow title block the way the reference logo does.
    titleSpot: { centerX: 0.422, baseY: 0.82, maxWidth: 0.27 },
    stacked: true,
    subtitleSpot: { centerX: 0.422, baseY: 0.91, slant: -5, place: 'below' },
    subtitleShrink: 0.8,
    masthead: { label: 'COASTLINE COVER STUDIO • COMING SOON' },
    titleBand: null,
    showNumbers: false,
    // The ORIGINAL seal sits on the hero / red-car seam, as in the reference.
    sealSpot: { x: 0.56, y: 0.46 },
    sealSize: 0.055,
    badgeFlags: { stars: false, est2026: false, wanted: false, vol: true, coast: false, burst: true, seal: true },
    labelsBelow: true,
    // The hero, masked and airboat labels sit at the TOP of their panels:
    // the title block and the script subtitle would otherwise cover the
    // hero's foot, and the subtitle brushes the masked/airboat feet.
    labelsAbove: [0, 4, 5],
    // The NEW burst parks on the hero's lower-left, clear of its top label
    // and of the woman's face.
    burstSpot: { x: 0.08, y: 0.52 },
    labels: [
      { main: 'NEON DRIVE • 11:47 PM • NO WITNESSES', sub: '' },
      { main: 'OCEAN DRIVE • 6:42 PM', sub: '' },
      { main: 'COAST ROAD • 5:15 PM • LAST LIGHT', sub: '' },
      { main: 'PALM BOULEVARD • 9:15 PM • FULL THROTTLE', sub: '' },
      { main: 'BACK ALLEY • 2:00 AM • NO TALKING', sub: '' },
      { main: 'EVERGLADES • LAST SWIM', sub: '' },
      { main: 'HOTEL ROW • 1:15 AM • PURSUIT', sub: '' },
    ],
  },
  {
    id: 'collage',
    name: 'Collage',
    desc: 'Ten-panel GTA collage, title over the seams',
    panels: [
      { x: 0.01563, y: 0.02778, w: 0.36719, h: 0.72222 },
      { x: 0.39063, y: 0.02778, w: 0.28125, h: 0.22222 },
      { x: 0.67969, y: 0.02778, w: 0.30469, h: 0.22222 },
      { x: 0.39063, y: 0.26389, w: 0.28125, h: 0.23611 },
      { x: 0.67969, y: 0.26389, w: 0.30469, h: 0.23611 },
      { x: 0.39063, y: 0.51389, w: 0.28125, h: 0.23611 },
      { x: 0.67969, y: 0.51389, w: 0.30469, h: 0.23611 },
      { x: 0.01563, y: 0.76389, w: 0.17578, h: 0.19444 },
      { x: 0.19922, y: 0.76389, w: 0.18359, h: 0.19444 },
      { x: 0.39063, y: 0.76389, w: 0.28125, h: 0.18056 },
    ],
    titleSpot: { centerX: 0.5, baseY: 0.84, maxWidth: 0.94 },
    subtitleSpot: { centerX: 0.73, baseY: 0.88, slant: -5, place: 'below' },
    titleBand: null,
    showNumbers: false,
    // Sunset-chase title ramp (orange to red to purple) and the ORIGINAL
    // seal parked over the hero's sky, clear of every label.
    titleRamp: ['#ff9a3e', '#ff6b6b', '#8e44ad'],
    sealSpot: { x: 0.328, y: 0.153 },
    sealSize: 0.062,
    badgeFlags: { stars: false, est2026: true, wanted: false, vol: true, coast: false, burst: true, seal: true },
    // The full-size title (baseY 0.84) sits over the foot of the middle row,
    // so the hero and the two middle-row panels wear their labels at the
    // TOP instead of the bottom — otherwise the title hides them. The bottom
    // row keeps bottom labels: the title ends above them.
    // (Fix 2026-11-19: P1/P6/P7 bottom labels were unreadable behind the
    // title — P6 "GAS STATION • 2:00 AM • NEON GLOW" and P7 "MOTORCYCLE RUN
    // • 1:15 AM • PURSUIT" fully hidden, P1 partly covered.)
    labelsBelow: true,
    labelsAbove: [0, 5, 6],
    // The NEW burst sits lower on the hero's left edge than the default
    // spot, so it does not cover the hero's top label.
    burstSpot: { x: 0.065, y: 0.30 },
    labels: [
      { main: 'OCEAN DRIVE • 6:42 PM • LOOKING FOR TROUBLE', sub: '' },
      { main: 'MARINA DEL SOL • 7:40 PM • NO WITNESSES', sub: '' },
      { main: 'TOWER 2 • 6:10 PM • LAST SWIM', sub: '' },
      { main: 'PALM BOULEVARD • 9:15 PM • LIGHTS OUT', sub: '' },
      { main: 'INTERSTATE 6 • 11:59 PM • FULL THROTTLE', sub: '' },
      { main: 'GAS STATION • 2:00 AM • NEON GLOW', sub: '' },
      { main: 'MOTORCYCLE RUN • 1:15 AM • PURSUIT', sub: '' },
      { main: 'CHROME • SUNSET REFLECTION', sub: '' },
      { main: 'JET SKI • GOLDEN WAKE', sub: '' },
      { main: 'AERIAL • PALM ROW', sub: '' },
    ],
  },
  {
    id: 'hero-left',
    name: 'Hero Left',
    desc: 'One big hero panel, four small ones',
    panels: [
      { x: 0.0, y: 0.0, w: 0.52, h: 0.8 },
      { x: 0.53, y: 0.0, w: 0.235, h: 0.395 },
      { x: 0.775, y: 0.0, w: 0.225, h: 0.395 },
      { x: 0.53, y: 0.405, w: 0.235, h: 0.395 },
      { x: 0.775, y: 0.405, w: 0.225, h: 0.395 },
    ],
    titleSpot: { centerX: 0.5, baseY: 0.9, maxWidth: 0.94 },
    subtitleSpot: { centerX: 0.7, baseY: 0.925, slant: -5, place: 'below' },
    titleBand: null,
    showNumbers: false,
  },
  {
    id: 'neon-grid',
    name: 'Neon Grid',
    desc: 'Tall hero, six panels, title band',
    panels: [
      { x: 0.0, y: 0.0, w: 0.3, h: 0.78 },
      { x: 0.31, y: 0.0, w: 0.35, h: 0.385 },
      { x: 0.67, y: 0.0, w: 0.33, h: 0.385 },
      { x: 0.31, y: 0.395, w: 0.17, h: 0.385 },
      { x: 0.49, y: 0.395, w: 0.17, h: 0.385 },
      { x: 0.67, y: 0.395, w: 0.16, h: 0.385 },
      { x: 0.84, y: 0.395, w: 0.16, h: 0.385 },
    ],
    titleSpot: { centerX: 0.55, baseY: 0.9, maxWidth: 0.9 },
    subtitleSpot: { centerX: 0.62, baseY: 0.94, slant: -3, place: 'below' },
    titleBand: { x: 0, y: 0.78, w: 1, h: 0.18 },
    showNumbers: false,
  },
  {
    id: 'halftone-hero',
    name: 'Halftone Hero',
    desc: 'Big hero, filmstrip, title block',
    panels: [
      { x: 0.0, y: 0.0, w: 0.42, h: 0.6 },
      { x: 0.43, y: 0.0, w: 0.2, h: 0.29 },
      { x: 0.64, y: 0.0, w: 0.36, h: 0.6 },
      { x: 0.43, y: 0.3, w: 0.2, h: 0.3 },
      { x: 0.0, y: 0.61, w: 0.105, h: 0.35 },
      { x: 0.115, y: 0.61, w: 0.105, h: 0.35 },
      { x: 0.23, y: 0.61, w: 0.105, h: 0.35 },
      { x: 0.345, y: 0.61, w: 0.105, h: 0.35 },
    ],
    titleSpot: { centerX: 0.73, baseY: 0.85, maxWidth: 0.5 },
    subtitleSpot: { centerX: 0.73, baseY: 0.92, slant: -4, place: 'below' },
    titleBand: { x: 0.46, y: 0.61, w: 0.54, h: 0.35 },
    showNumbers: false,
  },
  {
    id: 'cast',
    name: 'Cast',
    desc: 'Five portraits, role labels',
    panels: [
      { x: 0.0, y: 0.0, w: 0.24, h: 0.46 },
      { x: 0.25, y: 0.0, w: 0.4, h: 0.6 },
      { x: 0.66, y: 0.0, w: 0.34, h: 0.46 },
      { x: 0.0, y: 0.47, w: 0.24, h: 0.49 },
      { x: 0.66, y: 0.47, w: 0.34, h: 0.49 },
    ],
    titleSpot: { centerX: 0.5, baseY: 0.9, maxWidth: 0.94 },
    subtitleSpot: { centerX: 0.62, baseY: 0.925, slant: -4, place: 'below' },
    titleBand: null,
    showNumbers: false,
  },
  {
    id: 'sun-run',
    name: 'Sun Run',
    desc: 'Hero left, three wide panels',
    panels: [
      { x: 0.0, y: 0.0, w: 0.38, h: 0.78 },
      { x: 0.39, y: 0.0, w: 0.24, h: 0.385 },
      { x: 0.64, y: 0.0, w: 0.36, h: 0.385 },
      { x: 0.39, y: 0.395, w: 0.61, h: 0.385 },
    ],
    titleSpot: { centerX: 0.5, baseY: 0.9, maxWidth: 0.94 },
    subtitleSpot: { centerX: 0.62, baseY: 0.925, slant: -4, place: 'below' },
    titleBand: null,
    showNumbers: false,
  },
  {
    id: 'one-photo',
    name: 'One Photo',
    desc: 'One photo, five different crops',
    panels: [
      { x: 0.28, y: 0.0, w: 0.44, h: 0.78 },
      { x: 0.0, y: 0.0, w: 0.27, h: 0.385 },
      { x: 0.73, y: 0.0, w: 0.27, h: 0.385 },
      { x: 0.0, y: 0.395, w: 0.27, h: 0.385 },
      { x: 0.73, y: 0.395, w: 0.27, h: 0.385 },
    ],
    titleSpot: { centerX: 0.5, baseY: 0.9, maxWidth: 0.94 },
    subtitleSpot: { centerX: 0.62, baseY: 0.925, slant: -4, place: 'below' },
    titleBand: null,
    showNumbers: false,
  },
  {
    id: 'numbered',
    name: 'Numbered',
    desc: 'Hero left, three numbered scenes',
    panels: [
      { x: 0.0, y: 0.0, w: 0.52, h: 0.78 },
      { x: 0.53, y: 0.0, w: 0.47, h: 0.25 },
      { x: 0.53, y: 0.26, w: 0.47, h: 0.25 },
      { x: 0.53, y: 0.52, w: 0.47, h: 0.26 },
    ],
    titleSpot: { centerX: 0.3, baseY: 0.92, maxWidth: 0.56 },
    subtitleSpot: { centerX: 0.3, baseY: 0.84, slant: -4, place: 'above' },
    titleBand: null,
    showNumbers: true,
  },
];

// The badges a layout gets when it does not name its own.
const FALLBACK_BADGES = {
  stars: true,
  est2026: true,
  wanted: false,
  vol: true,
  coast: false,
  burst: true,
  seal: false,
};

function layoutOf(state) {
  return COVER_LAYOUTS.find((l) => l.id === state.layout) ?? COVER_LAYOUTS[0];
}

function gradeOf(state) {
  return COLOR_GRADES.find((g) => g.id === state.grade) ?? COLOR_GRADES[0];
}

/** Fresh cover state for a layout: its photos, its labels, the default words. */
export function buildCoverState(layoutId = 'vice', gradeId = 'sunset') {
  const layout = COVER_LAYOUTS.find((l) => l.id === layoutId) ?? COVER_LAYOUTS[0];
  const slots = photosForLayout(layout.id);
  const panels = layout.panels.map((_, i) => {
    let slot;
    if (layout.id === 'one-photo') {
      const [photo, zoom, dx, dy] = HERO_CROPS[i];
      slot = { photo, zoom, dx, dy };
    } else {
      slot = { photo: slots[i] ?? (i % PHOTO_LIBRARY.length), zoom: 1, dx: 0, dy: 0 };
    }
    const label = layout.labels
      ? (layout.labels[i] ?? { main: '', sub: '' })
      : FALLBACK_LABELS[i % FALLBACK_LABELS.length];
    return { ...slot, caption: label.main, sub: label.sub, capStyle: 'place' };
  });
  return {
    layout: layout.id,
    grade: gradeId,
    title: 'SUNSET CHASE',
    subtitle: 'Golden Hour Getaway',
    tagline: 'ONE COAST · NO RULES · COMING SOON',
    badges: layout.badgeFlags ?? FALLBACK_BADGES,
    panels,
  };
}

/** Panel rectangles in canvas pixels for a layout at cover size w×h. */
export function coverRects(layoutId, w, h) {
  const layout = COVER_LAYOUTS.find((l) => l.id === layoutId) ?? COVER_LAYOUTS[0];
  const gap = Math.max(2, Math.round(w * 0.004));
  return layout.panels.map((p) => ({
    x: p.x * w + gap / 2,
    y: p.y * h + gap / 2,
    w: p.w * w - gap,
    h: p.h * h - gap,
  }));
}

/** Which panel (index) holds canvas point px,py, or -1. */
export function panelAt(layoutId, w, h, px, py) {
  const rects = coverRects(layoutId, w, h);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}

// ---- small canvas helpers -------------------------------------------------

/** Saves the context and clips drawing to a rectangle. */
function clipTo(ctx, rect) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
}

/** The empty-slot look: a dark violet gradient and a centred hint. */
function paintEmptyPanel(ctx, rect) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, '#3a1c4d');
  g.addColorStop(1, '#14091f');
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = `600 ${Math.max(12, rect.h * 0.06)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
}

/** The grade's warm wash over a panel: bright on top, deep at the foot. */
function washTint(ctx, rect, grade) {
  const tint = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  tint.addColorStop(0, grade.tintHi);
  tint.addColorStop(1, grade.tintLo);
  ctx.fillStyle = tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

// ---- panel painting -------------------------------------------------------

/** Paints one photo into a panel rect, cover-fit, with zoom and pan. */
function paintPanel(ctx, photo, rect, panel, grade) {
  clipTo(ctx, rect);
  if (!photo) {
    paintEmptyPanel(ctx, rect);
    ctx.restore();
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
  ctx.filter = grade.photoFilter;
  ctx.drawImage(photo, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.filter = 'none';
  washTint(ctx, rect, grade);
  ctx.restore();
}

/** Posterizes a pixel block to four levels per channel. */
function posterize(data) {
  const steps = [0, 85, 170, 255];
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = steps[Math.round((d[i] / 255) * 3)];
    d[i + 1] = steps[Math.round((d[i + 1] / 255) * 3)];
    d[i + 2] = steps[Math.round((d[i + 2] / 255) * 3)];
  }
}

/** A dot screen over a rectangle: small dark dots on a grid. */
function dotScreen(ctx, rect) {
  const ix = Math.max(0, Math.floor(rect.x));
  const iy = Math.max(0, Math.floor(rect.y));
  const iw = Math.max(1, Math.floor(rect.w));
  const ih = Math.max(1, Math.floor(rect.h));
  const step = Math.max(5, Math.round(rect.w / 90));
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.fillStyle = 'rgba(20,5,30,0.20)';
  for (let y = iy + step / 2; y < iy + ih; y += step) {
    for (let x = ix + step / 2; x < ix + iw; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, step * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Posterizes one panel rect (halftone grade) and overlays a dot screen. */
function applyDots(ctx, rect) {
  const ix = Math.max(0, Math.floor(rect.x));
  const iy = Math.max(0, Math.floor(rect.y));
  const iw = Math.max(1, Math.floor(rect.w));
  const ih = Math.max(1, Math.floor(rect.h));
  let data;
  try {
    data = ctx.getImageData(ix, iy, iw, ih);
  } catch {
    return;
  }
  posterize(data);
  ctx.putImageData(data, ix, iy);
  dotScreen(ctx, rect);
}

// ---- panel labels ---------------------------------------------------------

/** How wide the label box is at a font size: widest line plus padding. */
function labelBoxWidth(ctx, panel, size, pad) {
  ctx.font = `700 ${size}px "Bebas Neue", "Archivo Black", sans-serif`;
  const capW = ctx.measureText(panel.caption.toUpperCase()).width;
  ctx.font = `600 ${size * 0.62}px system-ui, sans-serif`;
  const subW = panel.sub ? ctx.measureText(panel.sub.toUpperCase()).width : 0;
  return Math.max(capW, subW) + pad * 2;
}

/** Whether a panel's label goes at the top instead of the foot. */
function labelGoesTop(layout, index, rect, h) {
  if (layout?.labelsAbove?.includes(index)) return true;
  if (layout?.labelsAbove) return false;
  return !layout?.labelsBelow && index !== 0 && rect.y + rect.h > h * 0.72;
}

/** A dark label at the foot of a panel — or at its head when the title
 *  overlaps the foot (the bottom row of a layout). */
function paintLabel(ctx, rect, panel, index, h, layout) {
  if (!panel.caption || panel.capStyle === 'none') return;
  const pad = Math.max(6, rect.h * 0.045);
  let fs = Math.max(11, Math.min(rect.h * 0.06, rect.w * 0.09, 34));
  // Shrink the label until its box fits inside the panel.
  // Floor is 7, not 10: a narrow-but-tall panel (e.g. P8 in the 960x1200
  // portrait shot) would otherwise bottom out at 10 with its tail —
  // "REFLECTION"'s "ON" — hidden behind the next panel's label bar.
  // The Vice layout's narrow cap/airboat panels need 7 at portrait size
  // when the fallback grotesque (wider than Bebas Neue) is in use.
  while (fs > 7 && labelBoxWidth(ctx, panel, fs, pad) > rect.w - pad) fs -= 1;
  ctx.save();
  ctx.font = `700 ${fs}px "Bebas Neue", "Archivo Black", sans-serif`;
  const capW = ctx.measureText(panel.caption.toUpperCase()).width;
  ctx.font = `600 ${fs * 0.62}px system-ui, sans-serif`;
  const subW = panel.sub ? ctx.measureText(panel.sub.toUpperCase()).width : 0;
  const boxW = Math.max(capW, subW) + pad * 2;
  const boxH = panel.sub ? fs * 2.1 : fs * 1.35;
  const bx = rect.x + pad * 0.7;
  // A layout can pin specific panels' labels to the top (e.g. when the
  // title overlaps the foot of those panels); otherwise the old rule
  // applies — a small bottom-row panel (other than the hero) wears its
  // label at the top, unless the layout says its raised title leaves the
  // foot clear.
  const atTop = labelGoesTop(layout, index, rect, h);
  const by = atTop ? rect.y + pad * 0.7 : rect.y + rect.h - boxH - pad * 0.7;
  if (panel.capStyle === 'role') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.fillStyle = '#14091f';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${fs}px "Bebas Neue", "Archivo Black", sans-serif`;
    ctx.fillText(panel.caption.toUpperCase(), bx + pad, by + boxH / 2);
  } else {
    ctx.fillStyle = 'rgba(10,4,18,0.82)';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `700 ${fs}px "Bebas Neue", "Archivo Black", sans-serif`;
    ctx.fillText(panel.caption.toUpperCase(), bx + pad, by + fs * 0.95);
    if (panel.sub) {
      ctx.fillStyle = '#ffb3d1';
      ctx.font = `600 ${fs * 0.62}px system-ui, sans-serif`;
      ctx.fillText(panel.sub.toUpperCase(), bx + pad, by + fs * 1.8);
    }
  }
  ctx.restore();
}

// ---- title and subtitle ---------------------------------------------------

/** Shrinks a font until the text fits inside a width. */
function fitFont(ctx, text, start, limit, family) {
  let size = start;
  ctx.font = `${size}px ${family}`;
  while (size > 12 && ctx.measureText(text).width > limit) {
    size -= 2;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

/** A top-to-bottom gradient from a ramp of colour stops. */
function titleGradient(ctx, ramp, top, bottom) {
  const grad = ctx.createLinearGradient(0, top, 0, bottom);
  ramp.forEach((c, i) => grad.addColorStop(i / (ramp.length - 1), c));
  return grad;
}

/** The huge gradient title with a thick dark outline and a drop shadow. */
function paintTitle(ctx, w, h, state, grade, layout) {
  const text = (state.title || '').trim().toUpperCase();
  if (!text) return;
  const spot = layout.titleSpot;
  const maxW = spot.maxWidth * w;
  const startSize = Math.round(w * 0.125);
  const ramp = layout.titleRamp ?? grade.titleRamp;
  const cx = spot.centerX * w;
  const baseY = spot.baseY * h;
  // A stacked title ("SUNSET" over "CHASE") fills a narrow title block the
  // way the reference logo does: each word on its own line, sized to the
  // longest word, the block's baseline at baseY.
  if (layout.stacked) {
    const words = text.split(/\s+/);
    const longest = words.reduce((a, b) => (a.length >= b.length ? a : b));
    const size = fitFont(ctx, longest, startSize, maxW, '"Archivo Black", sans-serif');
    const lineH = size * 0.98;
    const top = baseY - lineH * words.length;
    const grad = titleGradient(ctx, ramp, top, baseY + size * 0.08);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.font = `${size}px "Archivo Black", sans-serif`;
    ctx.shadowColor = 'rgba(40,0,70,0.85)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetX = size * 0.03;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeStyle = '#160a24';
    ctx.lineWidth = Math.max(4, size * 0.13);
    words.forEach((word, i) => {
      ctx.strokeText(word, cx, baseY - (words.length - 1 - i) * lineH);
    });
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = grad;
    words.forEach((word, i) => {
      ctx.fillText(word, cx, baseY - (words.length - 1 - i) * lineH);
    });
    ctx.restore();
    return;
  }
  const size = fitFont(ctx, text, startSize, maxW, '"Archivo Black", sans-serif');
  const top = baseY - size * 0.82;
  const grad = titleGradient(ctx, ramp, top, baseY + size * 0.08);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.font = `${size}px "Archivo Black", sans-serif`;
  ctx.shadowColor = 'rgba(40,0,70,0.85)';
  ctx.shadowBlur = size * 0.12;
  ctx.shadowOffsetX = size * 0.03;
  ctx.shadowOffsetY = size * 0.05;
  ctx.strokeStyle = '#160a24';
  ctx.lineWidth = Math.max(4, size * 0.13);
  ctx.strokeText(text, cx, baseY);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = grad;
  ctx.fillText(text, cx, baseY);
  ctx.restore();
}

/** The pink script subtitle, tilted, overlapping the title. */
function paintSubtitle(ctx, w, h, state, layout) {
  const text = (state.subtitle || '').trim();
  if (!text) return;
  const spot = layout.subtitleSpot;
  const size = Math.round(w * 0.038 * (layout.subtitleShrink ?? 1));
  ctx.save();
  ctx.translate(spot.centerX * w, spot.baseY * h);
  ctx.rotate(((spot.slant ?? -4) * Math.PI) / 180);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${size}px "Pacifico", cursive`;
  ctx.shadowColor = 'rgba(255,46,136,0.9)';
  ctx.shadowBlur = size * 0.45;
  ctx.fillStyle = '#ff8fc0';
  ctx.fillText(text, 0, 0);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.9;
  ctx.fillText(text, 0, -size * 0.04);
  ctx.restore();
}

// ---- badges ---------------------------------------------------------------

/** A spiky starburst badge (e.g. NEW SUMMER 2026). */
function paintBurst(ctx, cx, cy, r, label, sub) {
  ctx.save();
  ctx.translate(cx, cy);
  const spikes = 14;
  const points = spikes * 2;
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const rad = i % 2 === 0 ? r : r * 0.78;
    const a = (i / points) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * rad;
    const y = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd94d';
  ctx.strokeStyle = '#14091f';
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#14091f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${r * 0.34}px "Archivo Black", sans-serif`;
  ctx.fillText(label, 0, -r * 0.12);
  ctx.font = `700 ${r * 0.2}px system-ui, sans-serif`;
  ctx.fillText(sub, 0, r * 0.28);
  ctx.restore();
}

/** A round gold seal (e.g. EST. 2026). */
function paintSeal(ctx, cx, cy, r, lines) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd94d';
  ctx.strokeStyle = '#14091f';
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.setLineDash([r * 0.08, r * 0.08]);
  ctx.strokeStyle = '#14091f';
  ctx.lineWidth = Math.max(1, r * 0.04);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#14091f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${r * 0.3}px "Archivo Black", sans-serif`;
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * r * 0.36);
  });
  ctx.restore();
}

/** A small pill badge: a coloured box with centred text, at (x, y).
 *  padW scales the box width past the text, boxH its height, textDx/textDy
 *  the text offset inside it; outline, when given, is stroked around it. */
function drawPill(ctx, { label, font, x, y, padW, boxH, textDx, textDy, fill, outline, outlineW, color }) {
  ctx.save();
  ctx.font = font;
  const tw = ctx.measureText(label).width;
  const bw = tw + padW;
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, bw, boxH);
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = outlineW;
    ctx.strokeRect(x, y, bw, boxH);
  }
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + textDx, y + textDy);
  ctx.restore();
  return tw;
}

/** All toggleable badges, each at its fixed spot on the cover. */
function paintBadges(ctx, w, h, state, layout) {
  const b = state.badges || {};
  const u = Math.min(w, h);
  const burstAt = layout?.burstSpot ?? { x: 0.065, y: 0.075 };
  if (b.burst) paintBurst(ctx, w * burstAt.x, h * burstAt.y, u * 0.05, 'NEW', 'SUMMER 2026');
  if (b.est2026) paintSeal(ctx, w * 0.065, h * 0.185, u * 0.04, ['EST.', '2026']);
  if (b.wanted) {
    const fs = Math.max(12, u * 0.022);
    const label = 'WANTED ★★★★★';
    ctx.save();
    ctx.font = `800 ${fs}px "Archivo Black", sans-serif`;
    const tw = ctx.measureText(label).width;
    ctx.restore();
    drawPill(ctx, {
      label,
      font: `800 ${fs}px "Archivo Black", sans-serif`,
      x: w - tw - fs * 2.2,
      y: h * 0.02,
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
    ctx.save();
    ctx.font = `800 ${fs}px "Archivo Black", sans-serif`;
    const tw = ctx.measureText(label).width;
    ctx.restore();
    drawPill(ctx, {
      label,
      font: `800 ${fs}px "Archivo Black", sans-serif`,
      x: w - tw - fs * 2.4,
      y: h * 0.09,
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
    ctx.save();
    ctx.font = `800 ${fs}px "Archivo Black", sans-serif`;
    const tw = ctx.measureText(label).width;
    ctx.restore();
    drawPill(ctx, {
      label,
      font: `800 ${fs}px "Archivo Black", sans-serif`,
      x: w * 0.02,
      y: h * 0.02,
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
    const spot = layout?.sealSpot ?? { x: 0.5, y: 0.42 };
    const size = layout?.sealSize ?? 0.05;
    paintSeal(ctx, w * spot.x, h * spot.y, u * size, ['★ ★ ★', 'ORIGINAL', 'COVER ART']);
  }
  if (b.stars) {
    // A black pill at the top right, under VOL. 06, clear of the title.
    const fs = Math.max(13, u * 0.026);
    const label = '★ ★ ★ ★ ★';
    ctx.save();
    ctx.font = `${fs}px sans-serif`;
    const tw = ctx.measureText(label).width;
    ctx.restore();
    drawPill(ctx, {
      label,
      font: `${fs}px sans-serif`,
      x: w - tw - fs * 2.4,
      y: h * 0.16,
      padW: fs * 1.6,
      boxH: fs * 1.8,
      textDx: fs * 0.8,
      textDy: fs * 0.92,
      fill: 'rgba(10,4,18,0.88)',
      outline: null,
      color: '#ffd94d',
    });
  }
}

// ---- masthead and tagline -------------------------------------------------

/** The studio bar along the top of the hero, as in the reference: gold
 *  stars on the left, the studio label centred. Our own studio name.
 *  The label font is shrunk by measurement until it clears the stars, so
 *  the bar stays readable at every export aspect (the label is long and the
 *  fallback grotesque is much wider than Bebas Neue). */
function paintMasthead(ctx, w, h, layout) {
  const bar = layout.masthead;
  if (!bar) return;
  const x = (bar.x ?? 0.017) * w;
  const y = (bar.y ?? 0.017) * h;
  const bw = (bar.w ?? 0.549) * w;
  const bh = (bar.h ?? 0.07) * h;
  ctx.save();
  ctx.fillStyle = '#0a0312';
  ctx.fillRect(x, y, bw, bh);
  const starSize = bh * 0.42;
  ctx.font = `${starSize}px sans-serif`;
  ctx.fillStyle = '#ff9a3e';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const stars = '★ ★ ★ ★ ★';
  const starsW = ctx.measureText(stars).width;
  const gap = bh * 0.3;
  ctx.fillText(stars, x + bh * 0.25, y + bh * 0.52);
  // Centred label: its left edge must clear the stars, so its max width is
  // the bar minus twice the stars-plus-gaps block.
  const maxLabelW = bw - 2 * (bh * 0.25 + starsW + gap);
  let labelSize = bh * 0.42;
  ctx.font = `700 ${labelSize}px "Bebas Neue", "Archivo Black", sans-serif`;
  while (labelSize > 8 && ctx.measureText(bar.label).width > maxLabelW) {
    labelSize -= 1;
    ctx.font = `700 ${labelSize}px "Bebas Neue", "Archivo Black", sans-serif`;
  }
  ctx.fillStyle = '#ffe9a3';
  ctx.textAlign = 'center';
  ctx.fillText(bar.label, x + bw / 2, y + bh * 0.54);
  ctx.restore();
}

/** The tagline strip along the very bottom of the cover. */
function paintTagline(ctx, w, h, state) {
  const text = (state.tagline || '').trim().toUpperCase();
  if (!text) return;
  const stripH = Math.max(18, h * 0.042);
  const y = h - stripH;
  ctx.save();
  const g = ctx.createLinearGradient(0, y, 0, h);
  g.addColorStop(0, 'rgba(20,5,30,0.92)');
  g.addColorStop(1, 'rgba(60,5,50,0.95)');
  ctx.fillStyle = g;
  ctx.fillRect(0, y, w, stripH);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, y, w, Math.max(2, stripH * 0.08));
  const fs = stripH * 0.42;
  ctx.font = `700 ${fs}px "Bebas Neue", "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe9f3';
  let label = text.split('').join(' ');
  while (ctx.measureText(label).width > w * 0.92 && fs > 8) {
    label = text;
    break;
  }
  ctx.fillText(label, w / 2, y + stripH * 0.55);
  ctx.restore();
}

// ---- whole cover ----------------------------------------------------------

/** A number badge at a panel's top right, clear of a top label. */
function paintNumberBadge(ctx, rect, i) {
  const r = Math.max(12, Math.min(rect.w, rect.h) * 0.14);
  const cx = rect.x + rect.w - r * 1.1;
  const cy = rect.y + r * 1.1;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#14091f';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${r}px "Archivo Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(i).padStart(2, '0'), cx, cy + r * 0.05);
  ctx.restore();
}

/**
 * Renders the whole cover onto ctx at size w×h.
 * photos is an array of HTMLImageElement (or null) in the state's photo order.
 */
export function renderCover(ctx, w, h, state, photos) {
  const grade = gradeOf(state);
  const layout = layoutOf(state);
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#14091f';
  ctx.fillRect(0, 0, w, h);
  const rects = coverRects(state.layout, w, h);
  state.panels.forEach((panel, i) => {
    const rect = rects[i];
    if (!rect) return;
    const photo = photos[panel.photo] ?? null;
    paintPanel(ctx, photo, rect, panel, grade);
    if (grade.dotted) applyDots(ctx, rect);
  });
  // Panel labels and numbers sit above the photos.
  state.panels.forEach((panel, i) => {
    const rect = rects[i];
    if (!rect) return;
    paintLabel(ctx, rect, panel, i, h, layout);
    if (layout.showNumbers && i > 0) paintNumberBadge(ctx, rect, i);
  });
  // A solid band behind the title, for the layouts that have one.
  if (layout.titleBand) {
    const band = layout.titleBand;
    const g = ctx.createLinearGradient(0, band.y * h, 0, (band.y + band.h) * h);
    g.addColorStop(0, '#2b0a3d');
    g.addColorStop(1, '#12041f');
    ctx.fillStyle = g;
    ctx.fillRect(band.x * w, band.y * h, band.w * w, band.h * h);
    ctx.fillStyle = '#ff2e88';
    ctx.fillRect(band.x * w, band.y * h, band.w * w, Math.max(2, h * 0.006));
  }
  // Selection outlines are the editor's job; the cover itself ends here.
  paintMasthead(ctx, w, h, layout);
  paintTitle(ctx, w, h, state, grade, layout);
  paintSubtitle(ctx, w, h, state, layout);
  paintBadges(ctx, w, h, state, layout);
  paintTagline(ctx, w, h, state);
  // Thin outer frame.
  ctx.strokeStyle = '#0a0312';
  ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.strokeRect(0, 0, w, h);
  ctx.restore();
}

/** Draws the cover onto a canvas element at its own size. */
export function paintCanvas(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  renderCover(ctx, canvas.width, canvas.height, state, photos);
}

/** Exports the cover at an export size, resolving to a PNG blob. */
export function exportPng(state, photos, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  paintCanvas(canvas, state, photos);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
