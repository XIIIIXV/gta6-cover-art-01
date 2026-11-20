// ============================================================================
// Coastline Cover Studio — the editor, fourth draft.
//
// The editor is a plain object now, built by a factory, with the behaviour
// as small functions that close over it. The previous draft kept the same
// state in a CoverEditor class and every behaviour as a method on it; the
// draft before that kept it in module-level variables with free functions.
// This draft is the middle path: one state object, made by createEditor(),
// and a set of functions that take that object and do one job each —
// paint the preview, rebuild the buttons, sync the panel form, wire the
// canvas drag. Nothing is stored on `this` anywhere.
//
// What it does, unchanged from the approved build: pick photos (upload
// your own or use the bundled samples), choose a layout and a colour
// grade, edit the title and the panel labels, drag a panel's photo to
// crop it, then export the cover as a PNG in the common post sizes. A
// `?shot=` query sets up a fixed scene for a screenshot instead (see
// shots.js).
// ============================================================================

import { PHOTO_LIBRARY, COVER_LAYOUTS, COLOR_GRADES, POST_SIZES, sizeByKey, buildCoverState, paintCanvas, exportPng, coverRects, panelAt } from './cover.js';
import { playShot } from './shots.js';

// An element by id. Every control on the page is found through this one.
const byId = (id) => document.getElementById(id);

// Loads an image from a URL, resolving to the image once it can be drawn.
const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = url;
});

// ---------------------------------------------------------------------------
// Editor state
// ---------------------------------------------------------------------------
//
// createEditor() builds the whole editor state as one plain object:
//
//   canvas      the preview <canvas>
//   status      the status line under the export buttons
//   photos      HTMLImageElement per photo slot, samples first then uploads
//   names       the display name for each photo slot
//   state       the cover state (layout, grade, words, badges, panels)
//   panel       the selected panel index
//   size        the preview/export size ({ key, label, w, h })
//   drag        the crop drag in flight ({ x, y, dx, dy }) or null
function createEditor() {
  return {
    canvas: byId('cover'),
    status: byId('status'),
    photos: [],
    names: [],
    state: buildCoverState('vice', 'sunset'),
    panel: 0,
    size: sizeByKey('wide'),
    drag: null,
  };
}

// -- painting ----------------------------------------------------------------

// The preview canvas follows the export size's aspect, at a handy resolution.
const sizePreview = (ed) => {
  const maxSide = 960;
  const scale = Math.min(1, maxSide / Math.max(ed.size.w, ed.size.h));
  ed.canvas.width = Math.round(ed.size.w * scale);
  ed.canvas.height = Math.round(ed.size.h * scale);
};

// A dashed outline around the selected panel, so the editor shows the pick.
const paintSelection = (ed) => {
  if (document.body.classList.contains('shot-cover')) return;
  const rects = coverRects(ed.state.layout, ed.canvas.width, ed.canvas.height);
  const rect = rects[ed.panel];
  if (!rect) return;
  const ctx = ed.canvas.getContext('2d');
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
  ctx.setLineDash([]);
  ctx.fillStyle = '#ff2e88';
  ctx.font = `700 ${Math.max(11, ed.canvas.height * 0.02)}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`PANEL ${ed.panel + 1}`, rect.x + rect.w - 8, rect.y + 20);
  ctx.restore();
};

const repaint = (ed) => {
  sizePreview(ed);
  paintCanvas(ed.canvas, ed.state, ed.photos);
  paintSelection(ed);
  syncPanelForm(ed);
};

const showStatus = (ed, text) => {
  ed.status.textContent = text;
};

// -- layout and grade ---------------------------------------------------------

// Switches to a layout, keeping the words the user typed.
const applyLayout = (ed, layoutKey) => {
  const words = { title: byId('title').value, subtitle: byId('subtitle').value, tagline: byId('tagline').value };
  ed.state = buildCoverState(layoutKey, ed.state.grade);
  ed.state.title = words.title;
  ed.state.subtitle = words.subtitle;
  ed.state.tagline = words.tagline;
  ed.panel = 0;
  renderLayouts(ed);
  syncBadgeBoxes(ed);
  repaint(ed);
};

// Rebuilds the layout buttons, one per layout, with a tiny grid preview.
const renderLayouts = (ed) => {
  const box = byId('layouts');
  box.innerHTML = '';
  COVER_LAYOUTS.forEach((layout) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layout-btn' + (layout.key === ed.state.layout ? ' active' : '');
    btn.title = layout.desc;
    const mini = document.createElement('span');
    mini.className = 'layout-mini';
    layout.panels.forEach(([l, t, pw, ph]) => {
      const cell = document.createElement('i');
      cell.style.left = `${l * 100}%`;
      cell.style.top = `${t * 100}%`;
      cell.style.width = `${pw * 100}%`;
      cell.style.height = `${ph * 100}%`;
      mini.appendChild(cell);
    });
    btn.appendChild(mini);
    const label = document.createElement('span');
    label.textContent = layout.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => applyLayout(ed, layout.key));
    box.appendChild(btn);
  });
};

// Rebuilds the grade buttons, one per grade, with a colour swatch.
const renderGrades = (ed) => {
  const box = byId('grades');
  box.innerHTML = '';
  COLOR_GRADES.forEach((grade) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'grade-btn' + (grade.id === ed.state.grade ? ' active' : '');
    const sw = document.createElement('span');
    sw.className = 'grade-swatch';
    sw.style.background = grade.swatch;
    btn.appendChild(sw);
    const label = document.createElement('span');
    label.textContent = grade.name;
    btn.appendChild(label);
    btn.addEventListener('click', () => {
      ed.state.grade = grade.id;
      renderGrades(ed);
      repaint(ed);
    });
    box.appendChild(btn);
  });
};

// Rebuilds the photo strip: samples first, then uploads.
const renderPhotos = (ed) => {
  const box = byId('photos');
  box.innerHTML = '';
  ed.photos.forEach((photo, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo-btn';
    btn.title = ed.names[i] || `Photo ${i + 1}`;
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = ed.names[i] || `Photo ${i + 1}`;
    btn.appendChild(img);
    btn.addEventListener('click', () => {
      ed.state.panels[ed.panel].photo = i;
      repaint(ed);
      showStatus(ed, `Panel ${ed.panel + 1} now shows ${ed.names[i] || `photo ${i + 1}`}.`);
    });
    box.appendChild(btn);
  });
};

// -- panel form ----------------------------------------------------------------

// The selected panel's label, sub-label, style, zoom and photo.
const syncPanelForm = (ed) => {
  const panel = ed.state.panels[ed.panel];
  if (!panel) return;
  byId('panel-label').textContent = `Panel ${ed.panel + 1} of ${ed.state.panels.length}`;
  byId('panel-caption').value = panel.caption || '';
  byId('panel-sub').value = panel.sub || '';
  byId('panel-style').value = panel.capStyle || 'place';
  byId('panel-zoom').value = String(panel.zoom || 1);
  byId('panel-zoom-out').textContent = `${Math.round((panel.zoom || 1) * 100)}%`;
};

const wirePanelForm = (ed) => {
  byId('panel-caption').addEventListener('input', (e) => {
    ed.state.panels[ed.panel].caption = e.target.value;
    repaint(ed);
  });
  byId('panel-sub').addEventListener('input', (e) => {
    ed.state.panels[ed.panel].sub = e.target.value;
    repaint(ed);
  });
  byId('panel-style').addEventListener('change', (e) => {
    ed.state.panels[ed.panel].capStyle = e.target.value;
    repaint(ed);
  });
  byId('panel-zoom').addEventListener('input', (e) => {
    ed.state.panels[ed.panel].zoom = Number(e.target.value);
    repaint(ed);
  });
  byId('panel-fill-all').addEventListener('click', () => {
    const photo = ed.state.panels[ed.panel].photo;
    ed.state.panels.forEach((p) => { p.photo = photo; });
    repaint(ed);
    showStatus(ed, 'Every panel now shows the same photo — pick different crops per panel.');
  });
  byId('panel-reset-crop').addEventListener('click', () => {
    const panel = ed.state.panels[ed.panel];
    panel.zoom = 1;
    panel.dx = 0;
    panel.dy = 0;
    repaint(ed);
  });
};

// Makes the badge checkboxes match the current state's badges.
const syncBadgeBoxes = (ed) => {
  document.querySelectorAll('input[data-badge]').forEach((box) => {
    box.checked = !!ed.state.badges[box.dataset.badge];
  });
};

const wireText = (ed) => {
  byId('title').addEventListener('input', (e) => {
    ed.state.title = e.target.value;
    repaint(ed);
  });
  byId('subtitle').addEventListener('input', (e) => {
    ed.state.subtitle = e.target.value;
    repaint(ed);
  });
  byId('tagline').addEventListener('input', (e) => {
    ed.state.tagline = e.target.value;
    repaint(ed);
  });
  document.querySelectorAll('input[data-badge]').forEach((box) => {
    box.addEventListener('change', () => {
      ed.state.badges[box.dataset.badge] = box.checked;
      repaint(ed);
    });
  });
};

const wireExports = (ed) => {
  document.querySelectorAll('[data-export]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.export;
      if (!POST_SIZES.some((s) => s[0] === key)) return;
      const size = sizeByKey(key);
      showStatus(ed, `Exporting ${size.label}…`);
      const blob = await exportPng(ed.state, ed.photos, size);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `cover-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      showStatus(ed, `Saved cover-${size.w}x${size.h}.png`);
    });
  });
  document.querySelectorAll('[data-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.size;
      if (!POST_SIZES.some((s) => s[0] === key)) return;
      ed.size = sizeByKey(key);
      document.querySelectorAll('[data-size]').forEach((b) => b.classList.toggle('active', b === btn));
      repaint(ed);
      showStatus(ed, `Preview is now ${ed.size.label}.`);
    });
  });
};

const wireUpload = (ed) => {
  byId('upload').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(file);
      try {
        const img = await loadImage(url);
        img.src = url;
        ed.photos.push(img);
        ed.names.push(file.name);
      } catch {
        showStatus(ed, `Could not read ${file.name}.`);
      }
    }
    renderPhotos(ed);
    repaint(ed);
    if (files.length) showStatus(ed, `${files.length} photo${files.length > 1 ? 's' : ''} added — click one to put it in the selected panel.`);
    e.target.value = '';
  });
};

// Click a panel to select it; drag it to move its photo; scroll to zoom it.
const wireCanvas = (ed) => {
  const toCanvas = (e) => {
    const r = ed.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * ed.canvas.width,
      y: ((e.clientY - r.top) / r.height) * ed.canvas.height,
    };
  };
  ed.canvas.addEventListener('pointerdown', (e) => {
    const p = toCanvas(e);
    const i = panelAt(ed.state.layout, ed.canvas.width, ed.canvas.height, p.x, p.y);
    if (i < 0) return;
    ed.panel = i;
    ed.drag = { x: p.x, y: p.y, dx: ed.state.panels[i].dx || 0, dy: ed.state.panels[i].dy || 0 };
    ed.canvas.setPointerCapture(e.pointerId);
    repaint(ed);
  });
  ed.canvas.addEventListener('pointermove', (e) => {
    if (!ed.drag) return;
    const p = toCanvas(e);
    const rects = coverRects(ed.state.layout, ed.canvas.width, ed.canvas.height);
    const rect = rects[ed.panel];
    if (!rect) return;
    const panel = ed.state.panels[ed.panel];
    panel.dx = ed.drag.dx + (p.x - ed.drag.x) / rect.w;
    panel.dy = ed.drag.dy + (p.y - ed.drag.y) / rect.h;
    panel.dx = Math.max(-1, Math.min(1, panel.dx));
    panel.dy = Math.max(-1, Math.min(1, panel.dy));
    repaint(ed);
  });
  ed.canvas.addEventListener('pointerup', () => { ed.drag = null; });
  ed.canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const panel = ed.state.panels[ed.panel];
    const next = (panel.zoom || 1) * (e.deltaY < 0 ? 1.08 : 0.92);
    panel.zoom = Math.max(1, Math.min(3, next));
    repaint(ed);
  }, { passive: false });
};

// -- boot ----------------------------------------------------------------------

// Loads the bundled sample photos, then hands over to the editor or a shot.
const startEditor = async (ed) => {
  await document.fonts.ready;
  for (const sample of PHOTO_LIBRARY) {
    try {
      const img = await loadImage(sample[1]);
      ed.photos.push(img);
      ed.names.push(sample[2]);
    } catch {
      // A missing sample leaves an empty slot; the editor still works.
    }
  }
  renderLayouts(ed);
  renderGrades(ed);
  renderPhotos(ed);
  wirePanelForm(ed);
  wireText(ed);
  syncBadgeBoxes(ed);
  wireExports(ed);
  wireUpload(ed);
  wireCanvas(ed);
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    await playShot(shot, params, ed.state, ed.photos, () => repaint(ed));
  } else {
    repaint(ed);
  }
};

// Boot the editor as soon as this module loads.
startEditor(createEditor());
