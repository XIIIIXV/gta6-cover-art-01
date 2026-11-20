// Coastline Cover Studio — the editor.
//
// Wires the page: pick photos (upload your own or use the bundled samples),
// choose a layout and a colour grade, edit the title and the panel captions,
// drag a panel's photo to crop it, then export the cover as a PNG in the
// common post sizes. A `?shot=` query sets up a fixed scene for a screenshot
// instead (see shots.js).

import { SAMPLE_PHOTOS, LAYOUTS, GRADES, EXPORT_SIZES, defaultState, drawCover, exportCoverPng, panelRectsFor, hitPanel } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const statusEl = $('status');

let photos = []; // HTMLImageElement per photo slot, in SAMPLE_PHOTOS order then uploads
let photoNames = [];
let state = defaultState('vice', 'sunset');
let selectedPanel = 0;
let exportSize = EXPORT_SIZES[2]; // 1920 x 1080
let dragging = null;

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** The preview canvas follows the export size's aspect, at a handy resolution. */
function fitPreviewCanvas() {
  const maxSide = 960;
  const scale = Math.min(1, maxSide / Math.max(exportSize.w, exportSize.h));
  canvas.width = Math.round(exportSize.w * scale);
  canvas.height = Math.round(exportSize.h * scale);
}

function redraw() {
  fitPreviewCanvas();
  drawCover(canvas, state, photos);
  drawSelectionOutline();
  syncPanelForm();
}

/** A dashed outline around the selected panel, so the editor shows the pick. */
function drawSelectionOutline() {
  if (document.body.classList.contains('shot-cover')) return;
  const rects = panelRectsFor(state.layout, canvas.width, canvas.height);
  const rect = rects[selectedPanel];
  if (!rect) return;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
  ctx.setLineDash([]);
  ctx.fillStyle = '#ff2e88';
  ctx.font = `700 ${Math.max(11, canvas.height * 0.02)}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  const label = `PANEL ${selectedPanel + 1}`;
  ctx.fillText(label, rect.x + rect.w - 8, rect.y + 20);
  ctx.restore();
}

function setStatus(text) {
  statusEl.textContent = text;
}

/** Rebuilds the layout buttons, one per layout, with a tiny grid preview. */
function buildLayoutPicker() {
  const box = $('layouts');
  box.innerHTML = '';
  LAYOUTS.forEach((layout) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layout-btn' + (layout.id === state.layout ? ' active' : '');
    btn.title = layout.desc;
    const mini = document.createElement('span');
    mini.className = 'layout-mini';
    layout.panels.forEach(([fx, fy, fw, fh]) => {
      const cell = document.createElement('i');
      cell.style.left = `${fx * 100}%`;
      cell.style.top = `${fy * 100}%`;
      cell.style.width = `${fw * 100}%`;
      cell.style.height = `${fh * 100}%`;
      mini.appendChild(cell);
    });
    btn.appendChild(mini);
    const label = document.createElement('span');
    label.textContent = layout.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      state = defaultState(layout.id, state.grade);
      state.title = $('title').value;
      state.subtitle = $('subtitle').value;
      state.tagline = $('tagline').value;
      selectedPanel = 0;
      buildLayoutPicker();
      syncBadgeBoxes();
      redraw();
    });
    box.appendChild(btn);
  });
}

/** Rebuilds the grade buttons, one per grade, with a colour swatch. */
function buildGradePicker() {
  const box = $('grades');
  box.innerHTML = '';
  GRADES.forEach((grade) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grade-btn' + (grade.id === state.grade ? ' active' : '');
    const sw = document.createElement('span');
    sw.className = 'grade-swatch';
    sw.style.background = grade.swatch;
    btn.appendChild(sw);
    const label = document.createElement('span');
    label.textContent = grade.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      state.grade = grade.id;
      buildGradePicker();
      redraw();
    });
    box.appendChild(btn);
  });
}

/** Rebuilds the photo strip: samples first, then uploads. */
function buildPhotoStrip() {
  const box = $('photos');
  box.innerHTML = '';
  photos.forEach((photo, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo-btn';
    btn.title = photoNames[i] || `Photo ${i + 1}`;
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photoNames[i] || `Photo ${i + 1}`;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      state.panels[selectedPanel].photo = i;
      redraw();
      setStatus(`Panel ${selectedPanel + 1} now shows ${photoNames[i] || `photo ${i + 1}`}.`);
    });
    box.appendChild(btn);
  });
}

/** The selected panel's caption, sub-caption, style, zoom and photo. */
function syncPanelForm() {
  const panel = state.panels[selectedPanel];
  if (!panel) return;
  $('panel-label').textContent = `Panel ${selectedPanel + 1} of ${state.panels.length}`;
  $('panel-caption').value = panel.caption || '';
  $('panel-sub').value = panel.sub || '';
  $('panel-style').value = panel.capStyle || 'place';
  $('panel-zoom').value = String(panel.zoom || 1);
  $('panel-zoom-out').textContent = `${Math.round((panel.zoom || 1) * 100)}%`;
}

function bindPanelForm() {
  $('panel-caption').addEventListener('input', (e) => {
    state.panels[selectedPanel].caption = e.target.value;
    redraw();
  });
  $('panel-sub').addEventListener('input', (e) => {
    state.panels[selectedPanel].sub = e.target.value;
    redraw();
  });
  $('panel-style').addEventListener('change', (e) => {
    state.panels[selectedPanel].capStyle = e.target.value;
    redraw();
  });
  $('panel-zoom').addEventListener('input', (e) => {
    state.panels[selectedPanel].zoom = Number(e.target.value);
    redraw();
  });
  $('panel-fill-all').addEventListener('click', () => {
    const photo = state.panels[selectedPanel].photo;
    state.panels.forEach((p) => { p.photo = photo; });
    redraw();
    setStatus('Every panel now shows the same photo — pick different crops per panel.');
  });
  $('panel-reset-crop').addEventListener('click', () => {
    const panel = state.panels[selectedPanel];
    panel.zoom = 1;
    panel.dx = 0;
    panel.dy = 0;
    redraw();
  });
}

/** Makes the badge checkboxes match the current state's badges. */
function syncBadgeBoxes() {
  document.querySelectorAll('input[data-badge]').forEach((box) => {
    box.checked = !!state.badges[box.dataset.badge];
  });
}

function bindTextForm() {
  $('title').addEventListener('input', (e) => {
    state.title = e.target.value;
    redraw();
  });
  $('subtitle').addEventListener('input', (e) => {
    state.subtitle = e.target.value;
    redraw();
  });
  $('tagline').addEventListener('input', (e) => {
    state.tagline = e.target.value;
    redraw();
  });
  document.querySelectorAll('input[data-badge]').forEach((box) => {
    box.addEventListener('change', () => {
      state.badges[box.dataset.badge] = box.checked;
      redraw();
    });
  });
}

function bindExport() {
  document.querySelectorAll('[data-export]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const size = EXPORT_SIZES.find((s) => s.id === btn.dataset.export);
      if (!size) return;
      setStatus(`Exporting ${size.label}…`);
      const blob = await exportCoverPng(state, photos, size);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `cover-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setStatus(`Saved cover-${size.w}x${size.h}.png`);
    });
  });
  document.querySelectorAll('[data-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      exportSize = EXPORT_SIZES.find((s) => s.id === btn.dataset.size) ?? EXPORT_SIZES[2];
      document.querySelectorAll('[data-size]').forEach((b) => b.classList.toggle('active', b === btn));
      redraw();
      setStatus(`Preview is now ${exportSize.label}.`);
    });
  });
}

function bindUpload() {
  $('upload').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(file);
      try {
        const img = await loadImage(url);
        img.src = url;
        photos.push(img);
        photoNames.push(file.name);
      } catch {
        setStatus(`Could not read ${file.name}.`);
      }
    }
    buildPhotoStrip();
    redraw();
    if (files.length) setStatus(`${files.length} photo${files.length > 1 ? 's' : ''} added — click one to put it in the selected panel.`);
    e.target.value = '';
  });
}

/** Click a panel to select it; drag it to move its photo; scroll to zoom it. */
function bindCanvas() {
  const toCanvas = (e) => {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * canvas.width,
      y: ((e.clientY - r.top) / r.height) * canvas.height,
    };
  };
  canvas.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    const i = hitPanel(state.layout, canvas.width, canvas.height, p.x, p.y);
    if (i < 0) return;
    selectedPanel = i;
    dragging = { x: p.x, y: p.y, dx: state.panels[i].dx || 0, dy: state.panels[i].dy || 0 };
    canvas.setPointerCapture(e.pointerId);
    redraw();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const p = toCanvas(e);
    const rects = panelRectsFor(state.layout, canvas.width, canvas.height);
    const rect = rects[selectedPanel];
    if (!rect) return;
    const panel = state.panels[selectedPanel];
    panel.dx = dragging.dx + (p.x - dragging.x) / rect.w;
    panel.dy = dragging.dy + (p.y - dragging.y) / rect.h;
    panel.dx = Math.max(-1, Math.min(1, panel.dx));
    panel.dy = Math.max(-1, Math.min(1, panel.dy));
    redraw();
  });
  canvas.addEventListener('pointerup', () => { dragging = null; });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = state.panels[selectedPanel];
    const next = (panel.zoom || 1) * (e.deltaY < 0 ? 1.08 : 0.92);
    panel.zoom = Math.max(1, Math.min(3, next));
    redraw();
  }, { passive: false });
}

/** Loads the bundled sample photos, then hands over to the editor or a shot. */
async function boot() {
  await document.fonts.ready;
  for (const sample of SAMPLE_PHOTOS) {
    try {
      const img = await loadImage(sample.src);
      photos.push(img);
      photoNames.push(sample.label);
    } catch {
      // A missing sample leaves an empty slot; the editor still works.
    }
  }
  buildLayoutPicker();
  buildGradePicker();
  buildPhotoStrip();
  bindPanelForm();
  bindTextForm();
  syncBadgeBoxes();
  bindExport();
  bindUpload();
  bindCanvas();
  const shot = new URLSearchParams(location.search).get('shot');
  if (shot) {
    await runShot(shot, new URLSearchParams(location.search), state, photos, redraw);
  } else {
    redraw();
  }
}

boot();
