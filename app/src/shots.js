// ============================================================================
// Fixed scenes for screenshots, fourth draft.
//
//   ?shot=cover     shows the cover alone at a landscape size
//   ?shot=square    the square post size
//   ?shot=portrait  the portrait post size
//   ?shot=editor    the page with a sample photo loaded
//
// `photo` picks the sample (hero by default), `layout` and `grade` pick
// the look, and `title` the words. window.__shotReady is set once
// painted.
//
// This draft drops the ShotDirector class entirely: a shot is a short
// pipeline of plain functions — read the query, apply it to the state,
// paint the scene, signal readiness. The scenes themselves are
// unchanged: same query params, same painting, same readiness flag, so
// the screenshots come out identical.
// ============================================================================

import { PHOTO_LIBRARY, COVER_LAYOUTS, COLOR_GRADES, buildCoverState, paintCanvas } from './cover.js';

const canvas = document.getElementById('cover');

// Applies the shot's query params onto the cover state. A new layout
// rebuilds the panels, but the words and the badge toggles the user set
// are kept.
const applyQuery = (query, state) => {
  const layoutKey = query.get('layout');
  if (layoutKey && COVER_LAYOUTS.some((l) => l.key === layoutKey)) {
    const words = { title: state.title, subtitle: state.subtitle, tagline: state.tagline };
    const flags = state.badges;
    Object.assign(state, buildCoverState(layoutKey, state.grade), words, { badges: flags });
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
};

// Picks the sample photo the shot asks for (hero by default). The photo
// library is triples [id, file, blurb], so the id is the first item.
const photoSlot = (query) => {
  const key = query.get('photo') ?? 'hero';
  const i = PHOTO_LIBRARY.findIndex((s) => s[0] === key);
  return i < 0 ? 0 : i;
};

// Signals readiness on the next two animation frames, once painted.
const signalReady = () => {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
};

// Paints the cover alone, filling the viewport, and signals readiness.
// The asked photo leads the hero panel; the other panels keep the
// layout's own assignment, so the cover shows several different photos.
const paintAlone = (query, state, photos) => {
  document.body.classList.add('shot-cover');
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  applyQuery(query, state);
  state.panels[0].photo = photoSlot(query);
  paintCanvas(canvas, state, photos);
  signalReady();
};

// Runs a shot scene: the entry point the editor calls. Cover, square and
// portrait paint the cover alone; anything else is the editor, with a
// sample photo in the hero panel and the controls visible.
export async function playShot(shot, query, state, photos, repaint) {
  await document.fonts.ready;
  if (shot === 'cover' || shot === 'square' || shot === 'portrait') {
    paintAlone(query, state, photos);
    return;
  }
  applyQuery(query, state);
  state.panels[0].photo = photoSlot(query);
  repaint();
  signalReady();
}
