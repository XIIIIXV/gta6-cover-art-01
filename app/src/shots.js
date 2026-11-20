// ============================================================================
// Fixed scenes for screenshots, third draft (class-based).
//
//   ?shot=cover     shows the cover alone at a landscape size
//   ?shot=square    the square post size
//   ?shot=portrait  the portrait post size
//   ?shot=editor    the page with a sample photo loaded
//
// `photo` picks the sample (hero by default), `layout` and `grade` pick the
// look, and `title` the words. window.__shotReady is set once painted.
//
// This is a from-scratch rewrite of the shot scenes. The previous draft used
// free functions; this one puts the scene logic in a ShotDirector class so
// the canvas, the query handling and the readiness signal live together.
// The scenes themselves are unchanged: same query params, same painting,
// same readiness flag, so the screenshots come out identical.
// ============================================================================

import { PHOTO_LIBRARY, COVER_LAYOUTS, COLOR_GRADES, buildCoverState, paintCanvas } from './cover.js';

const canvas = document.getElementById('cover');

// ============================================================================
// ShotDirector
// ============================================================================
//
// Runs one shot scene: applies the query params to a cover state, paints
// either the cover alone (filling the viewport) or the editor, then signals
// readiness with window.__shotReady so the screenshot tool knows the paint
// is done. Constructed once per page load; `run()` is the entry point.
class ShotDirector {
  constructor(state, photos, repaint) {
    this.state = state;
    this.photos = photos;
    this.repaint = repaint;
  }

  /** Applies the shot's query params onto the cover state. */
  applyQuery(query) {
    const { state } = this;
    const layoutId = query.get('layout');
    if (layoutId && COVER_LAYOUTS.some((l) => l.id === layoutId)) {
      // A new layout rebuilds the panels, but the words and the badge
      // toggles the user set are kept.
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
  photoSlot(query) {
    const key = query.get('photo') ?? 'hero';
    const i = PHOTO_LIBRARY.findIndex((s) => s.id === key);
    return i < 0 ? 0 : i;
  }

  /** Signals readiness on the next two animation frames, once painted. */
  signalReady() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.__shotReady = true;
    }));
  }

  /** Paints the cover alone, filling the viewport, and signals readiness. */
  paintAlone(query) {
    const { state, photos } = this;
    document.body.classList.add('shot-cover');
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    this.applyQuery(query);
    // The asked photo leads the hero panel; the other panels keep the
    // layout's own assignment, so the cover shows several different photos.
    state.panels[0].photo = this.photoSlot(query);
    paintCanvas(canvas, state, photos);
    this.signalReady();
  }

  /** Sets up a shot scene and signals readiness once painted. */
  async run(shot, query) {
    await document.fonts.ready;
    if (shot === 'cover' || shot === 'square' || shot === 'portrait') {
      this.paintAlone(query);
      return;
    }
    // Editor: a sample photo in the hero panel, controls and canvas visible.
    this.applyQuery(query);
    this.state.panels[0].photo = this.photoSlot(query);
    this.repaint();
    this.signalReady();
  }
}

/** Runs a shot scene: the entry point the editor calls. */
export async function playShot(shot, query, state, photos, repaint) {
  await new ShotDirector(state, photos, repaint).run(shot, query);
}
