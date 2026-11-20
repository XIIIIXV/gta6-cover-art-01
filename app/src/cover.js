// Coastline Cover Studio — the cover renderer.
//
// Draws a multi-panel GTA-style poster cover onto any 2D canvas context at any
// size: photo panels with a sunset/neon grade, bold gradient title lettering,
// a script subtitle, per-panel captions, badges and a tagline strip. The same
// function renders the live preview and the exported PNG, so what you see is
// what you share.
//
// The sample photos are panels cropped from the two GTA VI fanmade covers the
// user supplied and explicitly authorised for this entry (2026-11-20). Every
// crop was measured to exclude Rockstar branding: no GTA logo, no R* mark, no
// FANMADE badge, no reference seal appears in any sample. The app's own
// title, subtitle and studio label replace the reference text, and the fonts
// are SIL Open Font License files bundled under app/fonts. No Rockstar logo,
// artwork or font is used anywhere.

export const SAMPLE_PHOTOS = [
  { id: 'vi-hero', src: 'samples/vi-hero.jpg', label: 'Woman with gun' },
  { id: 'vi-cap', src: 'samples/vi-cap.jpg', label: 'Man with cap' },
  { id: 'vi-coast', src: 'samples/vi-coast.jpg', label: 'Coast road' },
  { id: 'vi-redcar', src: 'samples/vi-redcar.jpg', label: 'Red car chase' },
  { id: 'vi-masked', src: 'samples/vi-masked.jpg', label: 'Masked man' },
  { id: 'vi-airboat', src: 'samples/vi-airboat.jpg', label: 'Airboat' },
  { id: 'vi-bike', src: 'samples/vi-bike.jpg', label: 'Night rider' },
  { id: 'vi-heli', src: 'samples/vi-heli.jpg', label: 'Helicopter' },
  { id: 'vi-sunset', src: 'samples/vi-sunset.jpg', label: 'Woman at sunset' },
  { id: 'vi-muscle', src: 'samples/vi-muscle.jpg', label: 'Muscle car' },
  { id: 'vi-floral', src: 'samples/vi-floral.jpg', label: 'Floral shirt' },
  { id: 'vi-swamp', src: 'samples/vi-swamp.jpg', label: 'Swamp run' },
];

// A layout is a set of panel rectangles (fractions of the cover), a title
// anchor and a subtitle anchor. Panels tile the whole cover; the title and
// the tagline strip are drawn over the lower part of it.
export const LAYOUTS = [
  {
    id: 'vice',
    name: 'Vice',
    desc: 'GTA VI cover: big hero, title block, seven panels',
    // Geometry follows the user's GTA VI wide reference (gta6-vi-ref-wide.jpg):
    // a tall hero on the left, a right-hand mosaic, and a dark title block in
    // the centre-bottom where the stacked title and subtitle sit. The tagline
    // strip runs along the very bottom. Panels end at y 0.958, the tagline
    // occupies the last 0.042.
    panels: [
      [0.017, 0.087, 0.549, 0.513],
      [0.571, 0.03, 0.166, 0.285],
      [0.742, 0.03, 0.24, 0.285],
      [0.571, 0.323, 0.411, 0.252],
      [0.017, 0.61, 0.256, 0.348],
      [0.576, 0.583, 0.156, 0.375],
      [0.737, 0.583, 0.245, 0.375],
    ],
    // Stacked two-line title ("SUNSET" / "CHASE") in the title block, sized
    // to the block's width; the subtitle sits below it, also in the block.
    title: { cx: 0.422, baseY: 0.82, maxW: 0.27 },
    titleStack: true,
    subtitle: { cx: 0.422, baseY: 0.91, tilt: -5, pos: 'below' },
    subtitleScale: 0.8,
    topBar: { label: 'COASTLINE COVER STUDIO • COMING SOON' },
    band: null,
    numbered: false,
    // The ORIGINAL seal sits on the hero / red-car seam, as in the reference.
    sealPos: { x: 0.56, y: 0.46 },
    sealR: 0.055,
    badges: { stars: false, est2026: false, wanted: false, vol: true, coast: false, starburst: true, seal: true },
    captionsAtBottom: true,
    // The hero, masked and airboat captions sit at the TOP of their panels:
    // the title block and the script subtitle would otherwise cover the
    // hero's foot, and the subtitle brushes the masked/airboat feet.
    captionsAtTop: [0, 4, 5],
    // The NEW starburst parks on the hero's lower-left, clear of its top
    // caption and of the woman's face.
    starburstPos: { x: 0.08, y: 0.52 },
    captions: [
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
    id: 'collage',
    name: 'Collage',
    desc: 'Ten-panel GTA collage, title over the seams',
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
    title: { cx: 0.5, baseY: 0.84, maxW: 0.94 },
    subtitle: { cx: 0.73, baseY: 0.88, tilt: -5, pos: 'below' },
    band: null,
    numbered: false,
    // Sunset-chase title gradient (orange to red to purple) and the pink
    // ORIGINAL seal parked over the hero's sky, clear of every caption.
    titleStops: ['#ff9a3e', '#ff6b6b', '#8e44ad'],
    sealPos: { x: 0.328, y: 0.153 },
    sealR: 0.062,
    badges: { stars: false, est2026: true, wanted: false, vol: true, coast: false, starburst: true, seal: true },
    // The full-size title (baseY 0.84) sits over the foot of the middle row,
    // so the hero and the two middle-row panels wear their captions at the
    // TOP instead of the bottom — otherwise the title hides them. The bottom
    // row keeps bottom captions: the title ends above them.
    // (Fix 2026-11-19: P1/P6/P7 bottom captions were unreadable behind the
    // title — P6 "GAS STATION • 2:00 AM • NEON GLOW" and P7 "MOTORCYCLE RUN
    // • 1:15 AM • PURSUIT" fully hidden, P1 partly covered.)
    captionsAtBottom: true,
    captionsAtTop: [0, 5, 6],
    // The NEW starburst sits lower on the hero's left edge than the default
    // spot, so it does not cover the hero's top caption.
    starburstPos: { x: 0.065, y: 0.30 },
    captions: [
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
    id: 'hero-left',
    name: 'Hero Left',
    desc: 'One big hero panel, four small ones',
    panels: [
      [0.0, 0.0, 0.52, 0.8],
      [0.53, 0.0, 0.235, 0.395],
      [0.775, 0.0, 0.225, 0.395],
      [0.53, 0.405, 0.235, 0.395],
      [0.775, 0.405, 0.225, 0.395],
    ],
    title: { cx: 0.5, baseY: 0.9, maxW: 0.94 },
    subtitle: { cx: 0.7, baseY: 0.925, tilt: -5, pos: 'below' },
    band: null,
    numbered: false,
  },
  {
    id: 'neon-grid',
    name: 'Neon Grid',
    desc: 'Tall hero, six panels, title band',
    panels: [
      [0.0, 0.0, 0.3, 0.78],
      [0.31, 0.0, 0.35, 0.385],
      [0.67, 0.0, 0.33, 0.385],
      [0.31, 0.395, 0.17, 0.385],
      [0.49, 0.395, 0.17, 0.385],
      [0.67, 0.395, 0.16, 0.385],
      [0.84, 0.395, 0.16, 0.385],
    ],
    title: { cx: 0.55, baseY: 0.9, maxW: 0.9 },
    subtitle: { cx: 0.62, baseY: 0.94, tilt: -3, pos: 'below' },
    band: { x: 0, y: 0.78, w: 1, h: 0.18 },
    numbered: false,
  },
  {
    id: 'halftone-hero',
    name: 'Halftone Hero',
    desc: 'Big hero, filmstrip, title block',
    panels: [
      [0.0, 0.0, 0.42, 0.6],
      [0.43, 0.0, 0.2, 0.29],
      [0.64, 0.0, 0.36, 0.6],
      [0.43, 0.3, 0.2, 0.3],
      [0.0, 0.61, 0.105, 0.35],
      [0.115, 0.61, 0.105, 0.35],
      [0.23, 0.61, 0.105, 0.35],
      [0.345, 0.61, 0.105, 0.35],
    ],
    title: { cx: 0.73, baseY: 0.85, maxW: 0.5 },
    subtitle: { cx: 0.73, baseY: 0.92, tilt: -4, pos: 'below' },
    band: { x: 0.46, y: 0.61, w: 0.54, h: 0.35 },
    numbered: false,
  },
  {
    id: 'cast',
    name: 'Cast',
    desc: 'Five portraits, role labels',
    panels: [
      [0.0, 0.0, 0.24, 0.46],
      [0.25, 0.0, 0.4, 0.6],
      [0.66, 0.0, 0.34, 0.46],
      [0.0, 0.47, 0.24, 0.49],
      [0.66, 0.47, 0.34, 0.49],
    ],
    title: { cx: 0.5, baseY: 0.9, maxW: 0.94 },
    subtitle: { cx: 0.62, baseY: 0.925, tilt: -4, pos: 'below' },
    band: null,
    numbered: false,
  },
  {
    id: 'sun-run',
    name: 'Sun Run',
    desc: 'Hero left, three wide panels',
    panels: [
      [0.0, 0.0, 0.38, 0.78],
      [0.39, 0.0, 0.24, 0.385],
      [0.64, 0.0, 0.36, 0.385],
      [0.39, 0.395, 0.61, 0.385],
    ],
    title: { cx: 0.5, baseY: 0.9, maxW: 0.94 },
    subtitle: { cx: 0.62, baseY: 0.925, tilt: -4, pos: 'below' },
    band: null,
    numbered: false,
  },
  {
    id: 'one-photo',
    name: 'One Photo',
    desc: 'One photo, five different crops',
    panels: [
      [0.28, 0.0, 0.44, 0.78],
      [0.0, 0.0, 0.27, 0.385],
      [0.73, 0.0, 0.27, 0.385],
      [0.0, 0.395, 0.27, 0.385],
      [0.73, 0.395, 0.27, 0.385],
    ],
    title: { cx: 0.5, baseY: 0.9, maxW: 0.94 },
    subtitle: { cx: 0.62, baseY: 0.925, tilt: -4, pos: 'below' },
    band: null,
    numbered: false,
  },
  {
    id: 'numbered',
    name: 'Numbered',
    desc: 'Hero left, three numbered scenes',
    panels: [
      [0.0, 0.0, 0.52, 0.78],
      [0.53, 0.0, 0.47, 0.25],
      [0.53, 0.26, 0.47, 0.25],
      [0.53, 0.52, 0.47, 0.26],
    ],
    title: { cx: 0.3, baseY: 0.92, maxW: 0.56 },
    subtitle: { cx: 0.3, baseY: 0.84, tilt: -4, pos: 'above' },
    band: null,
    numbered: true,
  },
];

// A grade is a canvas filter for the photos, a warm tint drawn over them,
// a title gradient (top to bottom) and a flag for the halftone treatment.
export const GRADES = [
  {
    id: 'sunset',
    name: 'Sunset',
    swatch: 'linear-gradient(135deg,#ffd94d,#ff7a1a 55%,#ff2e88)',
    filter: 'saturate(1.45) contrast(1.12) brightness(1.04) sepia(0.18)',
    tintTop: 'rgba(255,120,60,0.05)',
    tintBottom: 'rgba(255,40,110,0.30)',
    titleStops: ['#ffffff', '#ffe9a3', '#ffb347', '#ff7a1a', '#ff2e88'],
    halftone: false,
  },
  {
    id: 'neon',
    name: 'Neon',
    swatch: 'linear-gradient(135deg,#22e6ff,#ff2e88 60%,#b537ff)',
    filter: 'saturate(1.7) contrast(1.2) brightness(0.98) hue-rotate(-15deg)',
    tintTop: 'rgba(40,220,255,0.10)',
    tintBottom: 'rgba(255,20,140,0.32)',
    titleStops: ['#ffffff', '#b8f6ff', '#22e6ff', '#ff2e88', '#b537ff'],
    halftone: false,
  },
  {
    id: 'heatwave',
    name: 'Heatwave',
    swatch: 'linear-gradient(135deg,#fff3a3,#ff5a1a 55%,#d21f3c)',
    filter: 'saturate(1.6) contrast(1.25) brightness(1.08) sepia(0.35)',
    tintTop: 'rgba(255,160,40,0.12)',
    tintBottom: 'rgba(210,20,40,0.34)',
    titleStops: ['#ffffff', '#fff3a3', '#ffb347', '#ff5a1a', '#d21f3c'],
    halftone: false,
  },
  {
    id: 'golden',
    name: 'Golden',
    swatch: 'linear-gradient(135deg,#fff8d6,#ffd94d 55%,#ff9e2e)',
    filter: 'saturate(1.3) contrast(1.05) brightness(1.1) sepia(0.3)',
    tintTop: 'rgba(255,210,90,0.14)',
    tintBottom: 'rgba(255,140,30,0.26)',
    titleStops: ['#ffffff', '#fff8d6', '#ffd94d', '#ff9e2e', '#ff7a1a'],
    halftone: false,
  },
  {
    id: 'dusk',
    name: 'Dusk',
    swatch: 'linear-gradient(135deg,#c9b8ff,#7a5cff 55%,#ff5da2)',
    filter: 'saturate(1.2) contrast(1.1) brightness(0.92) hue-rotate(15deg)',
    tintTop: 'rgba(120,90,255,0.16)',
    tintBottom: 'rgba(40,10,80,0.34)',
    titleStops: ['#ffffff', '#e6dcff', '#c9b8ff', '#7a5cff', '#ff5da2'],
    halftone: false,
  },
  {
    id: 'halftone',
    name: 'Halftone',
    swatch: 'linear-gradient(135deg,#fff,#ff5da2 55%,#1a0b2e)',
    filter: 'saturate(1.5) contrast(1.3) brightness(1.02)',
    tintTop: 'rgba(255,90,160,0.08)',
    tintBottom: 'rgba(40,0,60,0.28)',
    titleStops: ['#ffffff', '#ffe9a3', '#ffb347', '#ff5da2', '#d21f3c'],
    halftone: true,
  },
  {
    id: 'vice',
    name: 'Vice',
    swatch: 'linear-gradient(135deg,#22e6ff,#ff2e88 55%,#ffd94d)',
    filter: 'saturate(1.6) contrast(1.15) hue-rotate(-25deg)',
    tintTop: 'rgba(34,230,255,0.12)',
    tintBottom: 'rgba(255,46,136,0.30)',
    titleStops: ['#ffffff', '#b8f6ff', '#22e6ff', '#ff2e88', '#ffd94d'],
    halftone: false,
  },
];

export const EXPORT_SIZES = [
  { id: 'square', label: '1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: '1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', label: '1920 × 1080', w: 1920, h: 1080 },
];

const DEFAULT_CAPTIONS = [
  ['OCEAN DRIVE', '6:42 PM · LOOKING FOR TROUBLE'],
  ['MARINA DEL SOL', '7:40 PM · NO WITNESSES'],
  ['TOWER 2', '6:10 PM · LAST SWIM'],
  ['PALM BOULEVARD', '9:15 PM · LIGHTS OUT'],
  ['INTERSTATE 6', '11:59 PM · FULL THROTTLE'],
  ['PIER 26', '5:30 AM · GONE FISHING'],
  ['SUNSET HEIGHTS', '8:30 PM · BIG MONEY'],
  ['BOARDWALK', '10:05 PM · LAST CALL'],
];

// One-photo crops: the same hero photo shown five ways.
const ONE_PHOTO_CROPS = [
  { photo: 0, zoom: 1.0, dx: 0, dy: 0 },
  { photo: 0, zoom: 1.9, dx: -0.18, dy: -0.05 },
  { photo: 0, zoom: 1.9, dx: 0.22, dy: -0.12 },
  { photo: 0, zoom: 1.9, dx: -0.28, dy: 0.14 },
  { photo: 0, zoom: 1.9, dx: 0.28, dy: 0.1 },
];

// Default photo assignment per layout (indexes into the photos array).
// Photos: 0 vi-hero, 1 vi-cap, 2 vi-coast, 3 vi-redcar, 4 vi-masked,
// 5 vi-airboat, 6 vi-bike, 7 vi-heli, 8 vi-sunset, 9 vi-muscle,
// 10 vi-floral, 11 vi-swamp.
const LAYOUT_PHOTOS = {
  'vice': [0, 1, 2, 3, 4, 5, 6],
  'collage': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  'hero-left': [0, 1, 2, 3, 1],
  'neon-grid': [0, 1, 3, 2, 1, 0, 2],
  'halftone-hero': [0, 2, 1, 3, 0, 1, 2, 3],
  'cast': [1, 0, 8, 4, 10],
  'sun-run': [0, 1, 2, 3],
  'one-photo': [0, 0, 0, 0, 0],
  'numbered': [0, 3, 1, 2],
};

/** Builds the default cover state for a layout. */
export function defaultState(layoutId = 'vice', gradeId = 'sunset') {
  const layout = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[0];
  const photos = LAYOUT_PHOTOS[layout.id] ?? [];
  const captions = layout.captions ?? null;
  const panels = layout.panels.map((_, i) => {
    const base = { photo: photos[i] ?? (i % SAMPLE_PHOTOS.length), zoom: 1, dx: 0, dy: 0 };
    const crop = layout.id === 'one-photo'
      ? ONE_PHOTO_CROPS[i]
      : { ...base, ...(layout.crops?.[i] ?? {}) };
    const [caption, sub] = captions
      ? (captions[i] ?? ['', ''])
      : DEFAULT_CAPTIONS[i % DEFAULT_CAPTIONS.length];
    return { ...crop, caption, sub, capStyle: 'place' };
  });
  return {
    layout: layout.id,
    grade: gradeId,
    title: 'SUNSET CHASE',
    subtitle: 'Golden Hour Getaway',
    tagline: 'ONE COAST · NO RULES · COMING SOON',
    badges: layout.badges ?? { stars: true, est2026: true, wanted: false, vol: true, coast: false, starburst: true, seal: false },
    panels,
  };
}

/** Panel rectangles in canvas pixels for a layout at cover size w×h. */
export function panelRectsFor(layoutId, w, h) {
  const layout = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[0];
  const gap = Math.max(2, Math.round(w * 0.004));
  return layout.panels.map(([fx, fy, fw, fh]) => ({
    x: fx * w + gap / 2,
    y: fy * h + gap / 2,
    w: fw * w - gap,
    h: fh * h - gap,
  }));
}

/** Which panel (index) contains canvas point px,py, or -1. */
export function hitPanel(layoutId, w, h, px, py) {
  const rects = panelRectsFor(layoutId, w, h);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}

function gradeFor(state) {
  return GRADES.find((g) => g.id === state.grade) ?? GRADES[0];
}

function layoutFor(state) {
  return LAYOUTS.find((l) => l.id === state.layout) ?? LAYOUTS[0];
}

/** Draws one photo into a panel rect, cover-fit, with zoom and pan. */
function drawPanelPhoto(ctx, photo, rect, panel, grade) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  if (!photo) {
    const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
    g.addColorStop(0, '#3a1c4d');
    g.addColorStop(1, '#14091f');
    ctx.fillStyle = g;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = `600 ${Math.max(12, rect.h * 0.06)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.restore();
    return;
  }
  const pw = photo.naturalWidth;
  const ph = photo.naturalHeight;
  const scale = Math.max(rect.w / pw, rect.h / ph) * (panel.zoom || 1);
  const dw = pw * scale;
  const dh = ph * scale;
  const cx = rect.x + rect.w / 2 + (panel.dx || 0) * rect.w;
  const cy = rect.y + rect.h / 2 + (panel.dy || 0) * rect.h;
  ctx.filter = grade.filter;
  ctx.drawImage(photo, cx - dw / 2, cy - dh / 2, dw, dh);
  ctx.filter = 'none';
  const tint = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.h);
  tint.addColorStop(0, grade.tintTop);
  tint.addColorStop(1, grade.tintBottom);
  ctx.fillStyle = tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

/** Posterizes one panel rect (halftone grade) and overlays a dot screen. */
function halftonePanel(ctx, rect) {
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
  const d = data.data;
  const levels = 4;
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      d[i + c] = Math.round((d[i + c] / 255) * (levels - 1)) * (255 / (levels - 1));
    }
  }
  ctx.putImageData(data, ix, iy);
  // Dot screen: small dark dots on a grid, stronger in the shadows.
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

/** A dark caption label at the foot of a panel — or at its head when the
 *  title overlaps the foot (the bottom row of a layout). */
function drawPanelCaption(ctx, rect, panel, index, h, layout) {
  if (!panel.caption || panel.capStyle === 'none') return;
  const pad = Math.max(6, rect.h * 0.045);
  let fs = Math.max(11, Math.min(rect.h * 0.06, rect.w * 0.09, 34));
  // Shrink the caption until its box fits inside the panel.
  const measureBox = (size) => {
    ctx.font = `700 ${size}px "Bebas Neue", "Archivo Black", sans-serif`;
    const cw = ctx.measureText(panel.caption.toUpperCase()).width;
    ctx.font = `600 ${size * 0.62}px system-ui, sans-serif`;
    const sw = panel.sub ? ctx.measureText(panel.sub.toUpperCase()).width : 0;
    return Math.max(cw, sw) + pad * 2;
  };
  // Floor is 7, not 10: a narrow-but-tall panel (e.g. P8 in the 960x1200
  // portrait shot) would otherwise bottom out at 10 with its tail —
  // "REFLECTION"'s "ON" — hidden behind the next panel's caption bar.
  // The Vice layout's narrow cap/airboat panels need 7 at portrait size
  // when the fallback grotesque (wider than Bebas Neue) is in use.
  while (fs > 7 && measureBox(fs) > rect.w - pad) fs -= 1;
  ctx.save();
  ctx.font = `700 ${fs}px "Bebas Neue", "Archivo Black", sans-serif`;
  const capW = ctx.measureText(panel.caption.toUpperCase()).width;
  ctx.font = `600 ${fs * 0.62}px system-ui, sans-serif`;
  const subW = panel.sub ? ctx.measureText(panel.sub.toUpperCase()).width : 0;
  const boxW = Math.max(capW, subW) + pad * 2;
  const boxH = panel.sub ? fs * 2.1 : fs * 1.35;
  const bx = rect.x + pad * 0.7;
  // A layout can pin specific panels' captions to the top (e.g. when the
  // title overlaps the foot of those panels); otherwise the old rule
  // applies — a small bottom-row panel (other than the hero) wears its
  // caption at the top, unless the layout says its raised title leaves the
  // foot clear.
  const atTop = layout?.captionsAtTop?.includes(index)
    ?? (!layout?.captionsAtBottom && index !== 0 && rect.y + rect.h > h * 0.72);
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

/** Fits the title font size so the text spans at most maxW pixels. */
function fitTitleFont(ctx, text, startSize, maxW, family) {
  let size = startSize;
  ctx.font = `${size}px ${family}`;
  while (size > 12 && ctx.measureText(text).width > maxW) {
    size -= 2;
    ctx.font = `${size}px ${family}`;
  }
  return size;
}

/** The huge gradient title with a thick dark outline and a drop shadow. */
function drawTitle(ctx, w, h, state, grade, layout) {
  const text = (state.title || '').trim().toUpperCase();
  if (!text) return;
  const t = layout.title;
  const maxW = t.maxW * w;
  const startSize = Math.round(w * 0.125);
  const stops = layout.titleStops ?? grade.titleStops;
  const gradFor = (top, bottom) => {
    const grad = ctx.createLinearGradient(0, top, 0, bottom);
    stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c));
    return grad;
  };
  // A stacked title ("SUNSET" over "CHASE") fills a narrow title block the
  // way the reference logo does: each word on its own line, sized to the
  // longest word, the block's baseline at baseY.
  if (layout.titleStack) {
    const words = text.split(/\s+/);
    const longest = words.reduce((a, b) => (a.length >= b.length ? a : b));
    let size = startSize;
    ctx.font = `${size}px "Archivo Black", sans-serif`;
    while (size > 12 && ctx.measureText(longest).width > maxW) {
      size -= 2;
      ctx.font = `${size}px "Archivo Black", sans-serif`;
    }
    const lineH = size * 0.98;
    const top = t.baseY * h - lineH * words.length;
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
    const cx = t.cx * w;
    words.forEach((word, i) => {
      ctx.strokeText(word, cx, t.baseY * h - (words.length - 1 - i) * lineH);
    });
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = gradFor(top, t.baseY * h + size * 0.08);
    words.forEach((word, i) => {
      ctx.fillText(word, cx, t.baseY * h - (words.length - 1 - i) * lineH);
    });
    ctx.restore();
    return;
  }
  const size = fitTitleFont(ctx, text, startSize, maxW, '"Archivo Black", sans-serif');
  const cx = t.cx * w;
  const baseY = t.baseY * h;
  const top = baseY - size * 0.82;
  const grad = gradFor(top, baseY + size * 0.08);
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
function drawSubtitle(ctx, w, h, state, layout) {
  const text = (state.subtitle || '').trim();
  if (!text) return;
  const s = layout.subtitle;
  const size = Math.round(w * 0.038 * (layout.subtitleScale ?? 1));
  ctx.save();
  ctx.translate(s.cx * w, s.baseY * h);
  ctx.rotate(((s.tilt ?? -4) * Math.PI) / 180);
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

/** A spiky starburst badge (e.g. NEW SUMMER 2026). */
function drawStarburst(ctx, cx, cy, r, label, sub) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 14;
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.78;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
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
function drawSeal(ctx, cx, cy, r, lines) {
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

/** All toggleable badges, each at its fixed spot on the cover. */
function drawBadges(ctx, w, h, state, layout) {
  const b = state.badges || {};
  const u = Math.min(w, h);
  const sb = layout?.starburstPos ?? { x: 0.065, y: 0.075 };
  if (b.starburst) drawStarburst(ctx, w * sb.x, h * sb.y, u * 0.05, 'NEW', 'SUMMER 2026');
  if (b.est2026) drawSeal(ctx, w * 0.065, h * 0.185, u * 0.04, ['EST.', '2026']);
  if (b.wanted) {
    ctx.save();
    const fs = Math.max(12, u * 0.022);
    ctx.font = `800 ${fs}px "Archivo Black", sans-serif`;
    const label = 'WANTED ★★★★★';
    const tw = ctx.measureText(label).width;
    const bx = w - tw - fs * 2.2;
    const by = h * 0.02;
    ctx.fillStyle = '#14091f';
    ctx.fillRect(bx, by, tw + fs * 1.4, fs * 1.9);
    ctx.fillStyle = '#ffd94d';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + fs * 0.7, by + fs * 0.98);
    ctx.restore();
  }
  if (b.vol) {
    ctx.save();
    const fs = Math.max(12, u * 0.024);
    ctx.font = `800 ${fs}px "Archivo Black", sans-serif`;
    const label = 'VOL. 06';
    const tw = ctx.measureText(label).width;
    const bx = w - tw - fs * 2.4;
    const by = h * 0.09;
    ctx.fillStyle = '#22b8e6';
    ctx.strokeStyle = '#14091f';
    ctx.lineWidth = Math.max(2, fs * 0.12);
    ctx.fillRect(bx, by, tw + fs * 1.4, fs * 1.9);
    ctx.strokeRect(bx, by, tw + fs * 1.4, fs * 1.9);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + fs * 0.7, by + fs * 0.98);
    ctx.restore();
  }
  if (b.coast) {
    ctx.save();
    const fs = Math.max(12, u * 0.022);
    ctx.font = `800 ${fs}px "Archivo Black", sans-serif`;
    const label = 'COAST EDITION';
    const tw = ctx.measureText(label).width;
    const bx = w * 0.02;
    const by = h * 0.02;
    ctx.fillStyle = '#14091f';
    ctx.fillRect(bx, by, tw + fs * 1.4, fs * 1.9);
    ctx.fillStyle = '#ffd94d';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + fs * 0.7, by + fs * 0.98);
    ctx.restore();
  }
  if (b.seal) {
    // The collage parks the seal on the P5/P7 seam; other layouts centre it.
    const sp = layout?.sealPos ?? { x: 0.5, y: 0.42 };
    const sr = layout?.sealR ?? 0.05;
    drawSeal(ctx, w * sp.x, h * sp.y, u * sr, ['★ ★ ★', 'ORIGINAL', 'COVER ART']);
  }
  if (b.stars) {
    // A black pill at the top right, under VOL. 06, clear of the title.
    ctx.save();
    const fs = Math.max(13, u * 0.026);
    ctx.font = `${fs}px sans-serif`;
    const label = '★ ★ ★ ★ ★';
    const tw = ctx.measureText(label).width;
    const bx = w - tw - fs * 2.4;
    const by = h * 0.16;
    ctx.fillStyle = 'rgba(10,4,18,0.88)';
    ctx.fillRect(bx, by, tw + fs * 1.6, fs * 1.8);
    ctx.fillStyle = '#ffd94d';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + fs * 0.8, by + fs * 0.92);
    ctx.restore();
  }
}

/** The studio bar along the top of the hero, as in the reference: gold
 *  stars on the left, the studio label centred. Our own studio name.
 *  The label font is shrunk by measurement until it clears the stars, so
 *  the bar stays readable at every export aspect (the label is long and the
 *  fallback grotesque is much wider than Bebas Neue). */
function drawTopBar(ctx, w, h, layout) {
  const tb = layout.topBar;
  if (!tb) return;
  const x = (tb.x ?? 0.017) * w;
  const y = (tb.y ?? 0.017) * h;
  const bw = (tb.w ?? 0.549) * w;
  const bh = (tb.h ?? 0.07) * h;
  ctx.save();
  ctx.fillStyle = '#0a0312';
  ctx.fillRect(x, y, bw, bh);
  const starFs = bh * 0.42;
  ctx.font = `${starFs}px sans-serif`;
  ctx.fillStyle = '#ff9a3e';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const stars = '★ ★ ★ ★ ★';
  const starsW = ctx.measureText(stars).width;
  const gap = bh * 0.3;
  ctx.fillText(stars, x + bh * 0.25, y + bh * 0.52);
  // Centred label: its left edge must clear the stars, so its max width is
  // the bar minus twice the stars-plus-gaps block.
  const labelMaxW = bw - 2 * (bh * 0.25 + starsW + gap);
  let labelFs = bh * 0.42;
  ctx.font = `700 ${labelFs}px "Bebas Neue", "Archivo Black", sans-serif`;
  while (labelFs > 8 && ctx.measureText(tb.label).width > labelMaxW) {
    labelFs -= 1;
    ctx.font = `700 ${labelFs}px "Bebas Neue", "Archivo Black", sans-serif`;
  }
  ctx.fillStyle = '#ffe9a3';
  ctx.textAlign = 'center';
  ctx.fillText(tb.label, x + bw / 2, y + bh * 0.54);
  ctx.restore();
}

/** The tagline strip along the very bottom of the cover. */
function drawTagline(ctx, w, h, state) {
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

/**
 * Renders the whole cover onto ctx at size w×h.
 * photos is an array of HTMLImageElement (or null) in the state's photo order.
 */
export function drawCoverTo(ctx, w, h, state, photos) {
  const grade = gradeFor(state);
  const layout = layoutFor(state);
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#14091f';
  ctx.fillRect(0, 0, w, h);
  const rects = panelRectsFor(state.layout, w, h);
  state.panels.forEach((panel, i) => {
    const rect = rects[i];
    if (!rect) return;
    const photo = photos[panel.photo] ?? null;
    drawPanelPhoto(ctx, photo, rect, panel, grade);
    if (grade.halftone) halftonePanel(ctx, rect);
  });
  // Panel captions and numbers sit above the photos.
  state.panels.forEach((panel, i) => {
    const rect = rects[i];
    if (!rect) return;
    drawPanelCaption(ctx, rect, panel, i, h, layout);
    if (layout.numbered && i > 0) {
      // Number badge at the panel's top right, clear of a top caption.
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
  });
  // A solid band behind the title, for the layouts that have one.
  if (layout.band) {
    const b = layout.band;
    const g = ctx.createLinearGradient(0, b.y * h, 0, (b.y + b.h) * h);
    g.addColorStop(0, '#2b0a3d');
    g.addColorStop(1, '#12041f');
    ctx.fillStyle = g;
    ctx.fillRect(b.x * w, b.y * h, b.w * w, b.h * h);
    ctx.fillStyle = '#ff2e88';
    ctx.fillRect(b.x * w, b.y * h, b.w * w, Math.max(2, h * 0.006));
  }
  // Selection outlines are the editor's job; the cover itself ends here.
  drawTopBar(ctx, w, h, layout);
  drawTitle(ctx, w, h, state, grade, layout);
  drawSubtitle(ctx, w, h, state, layout);
  drawBadges(ctx, w, h, state, layout);
  drawTagline(ctx, w, h, state);
  // Thin outer frame.
  ctx.strokeStyle = '#0a0312';
  ctx.lineWidth = Math.max(3, w * 0.004);
  ctx.strokeRect(0, 0, w, h);
  ctx.restore();
}

/** Draws the cover onto a canvas element at its own size. */
export function drawCover(canvas, state, photos) {
  const ctx = canvas.getContext('2d');
  drawCoverTo(ctx, canvas.width, canvas.height, state, photos);
}

/** Exports the cover at an export size, resolving to a PNG blob. */
export function exportCoverPng(state, photos, size) {
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas, state, photos);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
