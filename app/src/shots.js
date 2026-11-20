// Fixed scenes for screenshots: ?shot=cover shows the cover alone at a
// landscape size, ?shot=square and ?shot=portrait the other post sizes, and
// ?shot=editor shows the page with a sample photo loaded. `photo` picks the
// sample (hero, neon, coast, pier), `layout` and `grade` pick the look, and
// `title` the words. window.__shotReady is set once painted.

import { SAMPLE_PHOTOS, LAYOUTS, GRADES, defaultState, drawCover } from './cover.js';

const canvas = document.getElementById('cover');

/** Applies the shot's query params onto the cover state. */
function applyShotQuery(state, query) {
  const layout = query.get('layout');
  if (layout && LAYOUTS.some((l) => l.id === layout)) {
    const keep = { title: state.title, subtitle: state.subtitle, tagline: state.tagline, badges: state.badges };
    Object.assign(state, defaultState(layout, state.grade), keep);
  }
  const grade = query.get('grade');
  if (grade && GRADES.some((g) => g.id === grade)) state.grade = grade;
  const title = query.get('title');
  if (title) state.title = title;
  const subtitle = query.get('subtitle');
  if (subtitle) state.subtitle = subtitle;
  const tagline = query.get('tagline');
  if (tagline) state.tagline = tagline;
  return state;
}

/** Picks the sample photo the shot asks for (hero by default). */
function shotPhotoIndex(query) {
  const id = query.get('photo') ?? 'hero';
  const i = SAMPLE_PHOTOS.findIndex((s) => s.id === id);
  return i < 0 ? 0 : i;
}

/** Paints the cover alone, filling the viewport, and signals readiness. */
function paintCoverAlone(state, photos, query) {
  document.body.classList.add('shot-cover');
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  applyShotQuery(state, query);
  // The asked photo leads the hero panel; the other panels keep the layout's
  // own assignment, so the cover shows several different photos.
  state.panels[0].photo = shotPhotoIndex(query);
  drawCover(canvas, state, photos);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

/** Sets up a shot scene and signals readiness once painted. */
export async function runShot(shot, query, state, photos, redraw) {
  await document.fonts.ready;
  if (shot === 'cover' || shot === 'square' || shot === 'portrait') {
    paintCoverAlone(state, photos, query);
    return;
  }
  // Editor: a sample photo in the hero panel, controls and canvas visible.
  applyShotQuery(state, query);
  state.panels[0].photo = shotPhotoIndex(query);
  redraw();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
