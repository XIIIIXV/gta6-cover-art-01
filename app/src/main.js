// ============================================================================
// Coastline Cover Studio — the editor, third draft (class-based).
//
// This is a from-scratch rewrite of the editor. The previous draft kept its
// state in module-level variables and wired the page with free functions;
// this one puts everything in a CoverEditor class so the state (the loaded
// photos, the cover state, the selected panel, the preview size, the drag)
// lives in one object and every behaviour is a method on it.
//
// What it does, unchanged from the approved build:
// pick photos (upload your own or use the bundled samples), choose a layout
// and a colour grade, edit the title and the panel labels, drag a panel's
// photo to crop it, then export the cover as a PNG in the common post
// sizes. A `?shot=` query sets up a fixed scene for a screenshot instead
// (see shots.js).
// ============================================================================

import { PHOTO_LIBRARY, COVER_LAYOUTS, COLOR_GRADES, POST_SIZES, buildCoverState, paintCanvas, exportPng, coverRects, panelAt } from './cover.js';
import { playShot } from './shots.js';

// Small helper: an element by id. Kept module-level because both the class
// and the boot code below need it.
const el = (id) => document.getElementById(id);

// ============================================================================
// CoverEditor
// ============================================================================
//
// Owns the page: the canvas, the status line, the loaded photos, the cover
// state, which panel is selected, the preview size and any drag in flight.
// `start()` loads the bundled samples, builds the controls, wires every
// listener, and either paints the editor or hands over to a shot scene.
class CoverEditor {
  constructor() {
    this.previewCanvas = el('cover');
    this.statusLine = el('status');
    // HTMLImageElement per photo slot, in PHOTO_LIBRARY order then uploads.
    this.loadedPhotos = [];
    this.loadedNames = [];
    this.coverState = buildCoverState('vice', 'sunset');
    this.activePanel = 0;
    this.previewSize = POST_SIZES[2]; // 1920 x 1080
    this.dragState = null;
  }

  // -- images ----------------------------------------------------------------

  /** Loads an image from a URL, resolving to the image once it can be drawn. */
  static fetchImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  // -- painting ---------------------------------------------------------------

  /** The preview canvas follows the export size's aspect, at a handy resolution. */
  sizePreviewCanvas() {
    const maxSide = 960;
    const scale = Math.min(1, maxSide / Math.max(this.previewSize.w, this.previewSize.h));
    this.previewCanvas.width = Math.round(this.previewSize.w * scale);
    this.previewCanvas.height = Math.round(this.previewSize.h * scale);
  }

  repaint() {
    this.sizePreviewCanvas();
    paintCanvas(this.previewCanvas, this.coverState, this.loadedPhotos);
    this.paintSelection();
    this.syncPanelInputs();
  }

  /** A dashed outline around the selected panel, so the editor shows the pick. */
  paintSelection() {
    if (document.body.classList.contains('shot-cover')) return;
    const rects = coverRects(this.coverState.layout, this.previewCanvas.width, this.previewCanvas.height);
    const rect = rects[this.activePanel];
    if (!rect) return;
    const ctx = this.previewCanvas.getContext('2d');
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff2e88';
    ctx.font = `700 ${Math.max(11, this.previewCanvas.height * 0.02)}px system-ui, sans-serif`;
    ctx.textAlign = 'right';
    const label = `PANEL ${this.activePanel + 1}`;
    ctx.fillText(label, rect.x + rect.w - 8, rect.y + 20);
    ctx.restore();
  }

  showStatus(text) {
    this.statusLine.textContent = text;
  }

  // -- layout and grade --------------------------------------------------------

  /** Switches to a layout, keeping the words the user typed. */
  applyLayout(layoutId) {
    const words = { title: el('title').value, subtitle: el('subtitle').value, tagline: el('tagline').value };
    this.coverState = buildCoverState(layoutId, this.coverState.grade);
    this.coverState.title = words.title;
    this.coverState.subtitle = words.subtitle;
    this.coverState.tagline = words.tagline;
    this.activePanel = 0;
    this.renderLayoutButtons();
    this.syncBadges();
    this.repaint();
  }

  /** Rebuilds the layout buttons, one per layout, with a tiny grid preview. */
  renderLayoutButtons() {
    const box = el('layouts');
    box.innerHTML = '';
    COVER_LAYOUTS.forEach((layout) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'layout-btn' + (layout.id === this.coverState.layout ? ' active' : '');
      btn.title = layout.desc;
      const mini = document.createElement('span');
      mini.className = 'layout-mini';
      layout.panels.forEach((p) => {
        const cell = document.createElement('i');
        cell.style.left = `${p.left * 100}%`;
        cell.style.top = `${p.top * 100}%`;
        cell.style.width = `${p.width * 100}%`;
        cell.style.height = `${p.height * 100}%`;
        mini.appendChild(cell);
      });
      btn.appendChild(mini);
      const label = document.createElement('span');
      label.textContent = layout.name;
      btn.appendChild(label);
      btn.addEventListener('click', () => this.applyLayout(layout.id));
      box.appendChild(btn);
    });
  }

  /** Rebuilds the grade buttons, one per grade, with a colour swatch. */
  renderGradeButtons() {
    const box = el('grades');
    box.innerHTML = '';
    COLOR_GRADES.forEach((grade) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'grade-btn' + (grade.id === this.coverState.grade ? ' active' : '');
      const sw = document.createElement('span');
      sw.className = 'grade-swatch';
      sw.style.background = grade.swatch;
      btn.appendChild(sw);
      const label = document.createElement('span');
      label.textContent = grade.name;
      btn.appendChild(label);
      btn.addEventListener('click', () => {
        this.coverState.grade = grade.id;
        this.renderGradeButtons();
        this.repaint();
      });
      box.appendChild(btn);
    });
  }

  /** Rebuilds the photo strip: samples first, then uploads. */
  renderPhotoStrip() {
    const box = el('photos');
    box.innerHTML = '';
    this.loadedPhotos.forEach((photo, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'photo-btn';
      btn.title = this.loadedNames[i] || `Photo ${i + 1}`;
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = this.loadedNames[i] || `Photo ${i + 1}`;
      btn.appendChild(img);
      btn.addEventListener('click', () => {
        this.coverState.panels[this.activePanel].photo = i;
        this.repaint();
        this.showStatus(`Panel ${this.activePanel + 1} now shows ${this.loadedNames[i] || `photo ${i + 1}`}.`);
      });
      box.appendChild(btn);
    });
  }

  // -- panel form ---------------------------------------------------------------

  /** The selected panel's label, sub-label, style, zoom and photo. */
  syncPanelInputs() {
    const panel = this.coverState.panels[this.activePanel];
    if (!panel) return;
    el('panel-label').textContent = `Panel ${this.activePanel + 1} of ${this.coverState.panels.length}`;
    el('panel-caption').value = panel.caption || '';
    el('panel-sub').value = panel.sub || '';
    el('panel-style').value = panel.capStyle || 'place';
    el('panel-zoom').value = String(panel.zoom || 1);
    el('panel-zoom-out').textContent = `${Math.round((panel.zoom || 1) * 100)}%`;
  }

  wirePanelInputs() {
    el('panel-caption').addEventListener('input', (e) => {
      this.coverState.panels[this.activePanel].caption = e.target.value;
      this.repaint();
    });
    el('panel-sub').addEventListener('input', (e) => {
      this.coverState.panels[this.activePanel].sub = e.target.value;
      this.repaint();
    });
    el('panel-style').addEventListener('change', (e) => {
      this.coverState.panels[this.activePanel].capStyle = e.target.value;
      this.repaint();
    });
    el('panel-zoom').addEventListener('input', (e) => {
      this.coverState.panels[this.activePanel].zoom = Number(e.target.value);
      this.repaint();
    });
    el('panel-fill-all').addEventListener('click', () => {
      const photo = this.coverState.panels[this.activePanel].photo;
      this.coverState.panels.forEach((p) => { p.photo = photo; });
      this.repaint();
      this.showStatus('Every panel now shows the same photo — pick different crops per panel.');
    });
    el('panel-reset-crop').addEventListener('click', () => {
      const panel = this.coverState.panels[this.activePanel];
      panel.zoom = 1;
      panel.dx = 0;
      panel.dy = 0;
      this.repaint();
    });
  }

  /** Makes the badge checkboxes match the current state's badges. */
  syncBadges() {
    document.querySelectorAll('input[data-badge]').forEach((box) => {
      box.checked = !!this.coverState.badges[box.dataset.badge];
    });
  }

  wireTextInputs() {
    el('title').addEventListener('input', (e) => {
      this.coverState.title = e.target.value;
      this.repaint();
    });
    el('subtitle').addEventListener('input', (e) => {
      this.coverState.subtitle = e.target.value;
      this.repaint();
    });
    el('tagline').addEventListener('input', (e) => {
      this.coverState.tagline = e.target.value;
      this.repaint();
    });
    document.querySelectorAll('input[data-badge]').forEach((box) => {
      box.addEventListener('change', () => {
        this.coverState.badges[box.dataset.badge] = box.checked;
        this.repaint();
      });
    });
  }

  wireExportButtons() {
    document.querySelectorAll('[data-export]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const size = POST_SIZES.find((s) => s.key === btn.dataset.export);
        if (!size) return;
        this.showStatus(`Exporting ${size.label}…`);
        const blob = await exportPng(this.coverState, this.loadedPhotos, size);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `cover-${size.w}x${size.h}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        this.showStatus(`Saved cover-${size.w}x${size.h}.png`);
      });
    });
    document.querySelectorAll('[data-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.previewSize = POST_SIZES.find((s) => s.key === btn.dataset.size) ?? POST_SIZES[2];
        document.querySelectorAll('[data-size]').forEach((b) => b.classList.toggle('active', b === btn));
        this.repaint();
        this.showStatus(`Preview is now ${this.previewSize.label}.`);
      });
    });
  }

  wireUploader() {
    el('upload').addEventListener('change', async (e) => {
      const files = [...e.target.files];
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        const url = URL.createObjectURL(file);
        try {
          const img = await CoverEditor.fetchImage(url);
          img.src = url;
          this.loadedPhotos.push(img);
          this.loadedNames.push(file.name);
        } catch {
          this.showStatus(`Could not read ${file.name}.`);
        }
      }
      this.renderPhotoStrip();
      this.repaint();
      if (files.length) this.showStatus(`${files.length} photo${files.length > 1 ? 's' : ''} added — click one to put it in the selected panel.`);
      e.target.value = '';
    });
  }

  /** Click a panel to select it; drag it to move its photo; scroll to zoom it. */
  wireCanvas() {
    const toCanvas = (e) => {
      const r = this.previewCanvas.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * this.previewCanvas.width,
        y: ((e.clientY - r.top) / r.height) * this.previewCanvas.height,
      };
    };
    this.previewCanvas.addEventListener('pointerdown', (e) => {
      const p = toCanvas(e);
      const i = panelAt(this.coverState.layout, this.previewCanvas.width, this.previewCanvas.height, p.x, p.y);
      if (i < 0) return;
      this.activePanel = i;
      this.dragState = { x: p.x, y: p.y, dx: this.coverState.panels[i].dx || 0, dy: this.coverState.panels[i].dy || 0 };
      this.previewCanvas.setPointerCapture(e.pointerId);
      this.repaint();
    });
    this.previewCanvas.addEventListener('pointermove', (e) => {
      if (!this.dragState) return;
      const p = toCanvas(e);
      const rects = coverRects(this.coverState.layout, this.previewCanvas.width, this.previewCanvas.height);
      const rect = rects[this.activePanel];
      if (!rect) return;
      const panel = this.coverState.panels[this.activePanel];
      panel.dx = this.dragState.dx + (p.x - this.dragState.x) / rect.w;
      panel.dy = this.dragState.dy + (p.y - this.dragState.y) / rect.h;
      panel.dx = Math.max(-1, Math.min(1, panel.dx));
      panel.dy = Math.max(-1, Math.min(1, panel.dy));
      this.repaint();
    });
    this.previewCanvas.addEventListener('pointerup', () => { this.dragState = null; });
    this.previewCanvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const panel = this.coverState.panels[this.activePanel];
      const next = (panel.zoom || 1) * (e.deltaY < 0 ? 1.08 : 0.92);
      panel.zoom = Math.max(1, Math.min(3, next));
      this.repaint();
    }, { passive: false });
  }

  // -- boot ---------------------------------------------------------------------

  /** Loads the bundled sample photos, then hands over to the editor or a shot. */
  async start() {
    await document.fonts.ready;
    for (const sample of PHOTO_LIBRARY) {
      try {
        const img = await CoverEditor.fetchImage(sample.file);
        this.loadedPhotos.push(img);
        this.loadedNames.push(sample.blurb);
      } catch {
        // A missing sample leaves an empty slot; the editor still works.
      }
    }
    this.renderLayoutButtons();
    this.renderGradeButtons();
    this.renderPhotoStrip();
    this.wirePanelInputs();
    this.wireTextInputs();
    this.syncBadges();
    this.wireExportButtons();
    this.wireUploader();
    this.wireCanvas();
    const params = new URLSearchParams(location.search);
    const shot = params.get('shot');
    if (shot) {
      await playShot(shot, params, this.coverState, this.loadedPhotos, () => this.repaint());
    } else {
      this.repaint();
    }
  }
}

// Boot the editor as soon as this module loads.
new CoverEditor().start();
