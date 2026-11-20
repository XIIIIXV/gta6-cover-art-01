// Fixed scenes for screenshots: ?shot=cover shows the cover alone at a
// landscape size, ?shot=square and ?shot=portrait the other post sizes, and
// ?shot=editor shows the page with a sample photo loaded. `photo` picks the
// sample (hero, neon, coast, pier), `layout` and `grade` pick the look, and
// `title` the words. window.__shotReady is set once painted.

import { PHOTO_LIBRARY, COVER_LAYOUTS, COLOR_GRADES, buildCoverState, paintCanvas } from './cover.js';

const canvas = document.getElementById('cover');

/** Applies the shot's query params onto the cover state. */
function applyQueryToState(state, query) {
  const layoutId = query.get('layout');
  if (layoutId && COVER_LAYOUTS.some((l) => l.id === layoutId)) {
    const words = { title: state.title, subtitle: state.subtitle, tagline: state.tagline };
    const flags = state.badges;
    Object.assign(state, buildCoverState(layoutId, state.grade), words, { badges: flags });
  }
  const gradeId = query.get('grade');
  if (gradeId && COLOR_GRADES.some((g) => g.id === gradeId)) state.grade = gradeId;
  const title = query.get('title');
  if (title) state.title = title;
  const subtitle = query.get('subtitle');
  if (subtitle) state.subtitle = subtitle;
  const tagline = query.get('tagline');
  if (tagline) state.tagline = tagline;
  return state;
}

/** Picks the sample photo the shot asks for (hero by default). */
function shotPhotoSlot(query) {
  const key = query.get('photo') ?? 'hero';
  const i = PHOTO_LIBRARY.findIndex((s) => s.key === key);
  return i < 0 ? 0 : i;
}

/** Paints the cover alone, filling the viewport, and signals readiness. */
function paintAlone(state, photos, query) {
  document.body.classList.add('shot-cover');
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  applyQueryToState(state, query);
  // The asked photo leads the hero panel; the other panels keep the layout's
  // own assignment, so the cover shows several different photos.
  state.panels[0].photo = shotPhotoSlot(query);
  paintCanvas(canvas, state, photos);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}

/** Sets up a shot scene and signals readiness once painted. */
export async function playShot(shot, query, state, photos, repaint) {
  await document.fonts.ready;
  if (shot === 'cover' || shot === 'square' || shot === 'portrait') {
    paintAlone(state, photos, query);
    return;
  }
  // Editor: a sample photo in the hero panel, controls and canvas visible.
  applyQueryToState(state, query);
  state.panels[0].photo = shotPhotoSlot(query);
  repaint();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
