// Coastline Cover Studio — the editor, second draft.
//
// Wires the page: pick photos (upload your own or use the bundled samples),
// choose a layout and a colour grade, edit the title and the panel labels,
// drag a panel's photo to crop it, then export the cover as a PNG in the
// common post sizes. A `?shot=` query sets up a fixed scene for a screenshot
// instead (see shots.js).

import { PHOTO_LIBRARY, COVER_LAYOUTS, COLOR_GRADES, POST_SIZES, buildCoverState, paintCanvas, exportPng, coverRects, panelAt } from './cover.js';
import { playShot } from './shots.js';

const el = (id) => document.getElementById(id);
const previewCanvas = el('cover');
const statusLine = el('status');

let loadedPhotos = []; // HTMLImageElement per photo slot, in PHOTO_LIBRARY order then uploads
let loadedNames = [];
let coverState = buildCoverState('vice', 'sunset');
let activePanel = 0;
let previewSize = POST_SIZES[2]; // 1920 x 1080
let dragState = null;

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** The preview canvas follows the export size's aspect, at a handy resolution. */
function sizePreviewCanvas() {
  const maxSide = 960;
  const scale = Math.min(1, maxSide / Math.max(previewSize.w, previewSize.h));
  previewCanvas.width = Math.round(previewSize.w * scale);
  previewCanvas.height = Math.round(previewSize.h * scale);
}

function repaint() {
  sizePreviewCanvas();
  paintCanvas(previewCanvas, coverState, loadedPhotos);
  paintSelection();
  syncPanelInputs();
}

/** A dashed outline around the selected panel, so the editor shows the pick. */
function paintSelection() {
  if (document.body.classList.contains('shot-cover')) return;
  const rects = coverRects(coverState.layout, previewCanvas.width, previewCanvas.height);
  const rect = rects[activePanel];
  if (!rect) return;
  const ctx = previewCanvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
  ctx.setLineDash([]);
  ctx.fillStyle = '#ff2e88';
  ctx.font = `700 ${Math.max(11, previewCanvas.height * 0.02)}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  const label = `PANEL ${activePanel + 1}`;
  ctx.fillText(label, rect.x + rect.w - 8, rect.y + 20);
  ctx.restore();
}

function showStatus(text) {
  statusLine.textContent = text;
}

/** Switches to a layout, keeping the words the user typed. */
function applyLayout(layoutId) {
  const words = { title: el('title').value, subtitle: el('subtitle').value, tagline: el('tagline').value };
  coverState = buildCoverState(layoutId, coverState.grade);
  coverState.title = words.title;
  coverState.subtitle = words.subtitle;
  coverState.tagline = words.tagline;
  activePanel = 0;
  renderLayoutButtons();
  syncBadges();
  repaint();
}

/** Rebuilds the layout buttons, one per layout, with a tiny grid preview. */
function renderLayoutButtons() {
  const box = el('layouts');
  box.innerHTML = '';
  COVER_LAYOUTS.forEach((layout) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layout-btn' + (layout.id === coverState.layout ? ' active' : '');
    btn.title = layout.desc;
    const mini = document.createElement('span');
    mini.className = 'layout-mini';
    layout.panels.forEach((p) => {
      const cell = document.createElement('i');
      cell.style.left = `${p.x * 100}%`;
      cell.style.top = `${p.y * 100}%`;
      cell.style.width = `${p.w * 100}%`;
      cell.style.height = `${p.h * 100}%`;
      mini.appendChild(cell);
    });
    btn.appendChild(mini);
    const label = document.createElement('span');
    label.textContent = layout.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => applyLayout(layout.id));
    box.appendChild(btn);
  });
}

/** Rebuilds the grade buttons, one per grade, with a colour swatch. */
function renderGradeButtons() {
  const box = el('grades');
  box.innerHTML = '';
  COLOR_GRADES.forEach((grade) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grade-btn' + (grade.id === coverState.grade ? ' active' : '');
    const sw = document.createElement('span');
    sw.className = 'grade-swatch';
    sw.style.background = grade.swatch;
    btn.appendChild(sw);
    const label = document.createElement('span');
    label.textContent = grade.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      coverState.grade = grade.id;
      renderGradeButtons();
      repaint();
    });
    box.appendChild(btn);
  });
}

/** Rebuilds the photo strip: samples first, then uploads. */
function renderPhotoStrip() {
  const box = el('photos');
  box.innerHTML = '';
  loadedPhotos.forEach((photo, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo-btn';
    btn.title = loadedNames[i] || `Photo ${i + 1}`;
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = loadedNames[i] || `Photo ${i + 1}`;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      coverState.panels[activePanel].photo = i;
      repaint();
      showStatus(`Panel ${activePanel + 1} now shows ${loadedNames[i] || `photo ${i + 1}`}.`);
    });
    box.appendChild(btn);
  });
}

/** The selected panel's label, sub-label, style, zoom and photo. */
function syncPanelInputs() {
  const panel = coverState.panels[activePanel];
  if (!panel) return;
  el('panel-label').textContent = `Panel ${activePanel + 1} of ${coverState.panels.length}`;
  el('panel-caption').value = panel.caption || '';
  el('panel-sub').value = panel.sub || '';
  el('panel-style').value = panel.capStyle || 'place';
  el('panel-zoom').value = String(panel.zoom || 1);
  el('panel-zoom-out').textContent = `${Math.round((panel.zoom || 1) * 100)}%`;
}

function wirePanelInputs() {
  el('panel-caption').addEventListener('input', (e) => {
    coverState.panels[activePanel].caption = e.target.value;
    repaint();
  });
  el('panel-sub').addEventListener('input', (e) => {
    coverState.panels[activePanel].sub = e.target.value;
    repaint();
  });
  el('panel-style').addEventListener('change', (e) => {
    coverState.panels[activePanel].capStyle = e.target.value;
    repaint();
  });
  el('panel-zoom').addEventListener('input', (e) => {
    coverState.panels[activePanel].zoom = Number(e.target.value);
    repaint();
  });
  el('panel-fill-all').addEventListener('click', () => {
    const photo = coverState.panels[activePanel].photo;
    coverState.panels.forEach((p) => { p.photo = photo; });
    repaint();
    showStatus('Every panel now shows the same photo — pick different crops per panel.');
  });
  el('panel-reset-crop').addEventListener('click', () => {
    const panel = coverState.panels[activePanel];
    panel.zoom = 1;
    panel.dx = 0;
    panel.dy = 0;
    repaint();
  });
}

/** Makes the badge checkboxes match the current state's badges. */
function syncBadges() {
  document.querySelectorAll('input[data-badge]').forEach((box) => {
    box.checked = !!coverState.badges[box.dataset.badge];
  });
}

function wireTextInputs() {
  el('title').addEventListener('input', (e) => {
    coverState.title = e.target.value;
    repaint();
  });
  el('subtitle').addEventListener('input', (e) => {
    coverState.subtitle = e.target.value;
    repaint();
  });
  el('tagline').addEventListener('input', (e) => {
    coverState.tagline = e.target.value;
    repaint();
  });
  document.querySelectorAll('input[data-badge]').forEach((box) => {
    box.addEventListener('change', () => {
      coverState.badges[box.dataset.badge] = box.checked;
      repaint();
    });
  });
}

function wireExportButtons() {
  document.querySelectorAll('[data-export]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const size = POST_SIZES.find((s) => s.key === btn.dataset.export);
      if (!size) return;
      showStatus(`Exporting ${size.name}…`);
      const blob = await exportPng(coverState, loadedPhotos, size);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `cover-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      showStatus(`Saved cover-${size.w}x${size.h}.png`);
    });
  });
  document.querySelectorAll('[data-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      previewSize = POST_SIZES.find((s) => s.key === btn.dataset.size) ?? POST_SIZES[2];
      document.querySelectorAll('[data-size]').forEach((b) => b.classList.toggle('active', b === btn));
      repaint();
      showStatus(`Preview is now ${previewSize.name}.`);
    });
  });
}

function wireUploader() {
  el('upload').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(file);
      try {
        const img = await fetchImage(url);
        img.src = url;
        loadedPhotos.push(img);
        loadedNames.push(file.name);
      } catch {
        showStatus(`Could not read ${file.name}.`);
      }
    }
    renderPhotoStrip();
    repaint();
    if (files.length) showStatus(`${files.length} photo${files.length > 1 ? 's' : ''} added — click one to put it in the selected panel.`);
    e.target.value = '';
  });
}

/** Click a panel to select it; drag it to move its photo; scroll to zoom it. */
function wireCanvas() {
  const toCanvas = (e) => {
    const r = previewCanvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * previewCanvas.width,
      y: ((e.clientY - r.top) / r.height) * previewCanvas.height,
    };
  };
  previewCanvas.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    const i = panelAt(coverState.layout, previewCanvas.width, previewCanvas.height, p.x, p.y);
    if (i < 0) return;
    activePanel = i;
    dragState = { x: p.x, y: p.y, dx: coverState.panels[i].dx || 0, dy: coverState.panels[i].dy || 0 };
    previewCanvas.setPointerCapture(e.pointerId);
    repaint();
  });
  previewCanvas.addEventListener('pointermove', (e) => {
    if (!dragState) return;
    const p = toCanvas(e);
    const rects = coverRects(coverState.layout, previewCanvas.width, previewCanvas.height);
    const rect = rects[activePanel];
    if (!rect) return;
    const panel = coverState.panels[activePanel];
    panel.dx = dragState.dx + (p.x - dragState.x) / rect.w;
    panel.dy = dragState.dy + (p.y - dragState.y) / rect.h;
    panel.dx = Math.max(-1, Math.min(1, panel.dx));
    panel.dy = Math.max(-1, Math.min(1, panel.dy));
    repaint();
  });
  previewCanvas.addEventListener('pointerup', () => { dragState = null; });
  previewCanvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = coverState.panels[activePanel];
    const next = (panel.zoom || 1) * (e.deltaY < 0 ? 1.08 : 0.92);
    panel.zoom = Math.max(1, Math.min(3, next));
    repaint();
  }, { passive: false });
}

/** Loads the bundled sample photos, then hands over to the editor or a shot. */
async function start() {
  await document.fonts.ready;
  for (const sample of PHOTO_LIBRARY) {
    try {
      const img = await fetchImage(sample.path);
      loadedPhotos.push(img);
      loadedNames.push(sample.note);
    } catch {
      // A missing sample leaves an empty slot; the editor still works.
    }
  }
  renderLayoutButtons();
  renderGradeButtons();
  renderPhotoStrip();
  wirePanelInputs();
  wireTextInputs();
  syncBadges();
  wireExportButtons();
  wireUploader();
  wireCanvas();
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    await playShot(shot, params, coverState, loadedPhotos, repaint);
  } else {
    repaint();
  }
}

start();
