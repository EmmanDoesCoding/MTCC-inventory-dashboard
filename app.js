
// ─── Config ───────────────────────────────────────────────────────────────
const JSONBIN_BASE = 'https://api.jsonbin.io/v3';
let MASTER_KEY = localStorage.getItem('mtcc_key') || '$2a$10$6YUxFYON7tl.lHl13unwY.JY7BTEdnDYxnRzbS2pZriMdq5EdLEM2';
let BIN_ID     = localStorage.getItem('mtcc_bin') || '6a03d6a8adc21f119a908818';
let SHEETS_URL   = localStorage.getItem('mtcc_sheets_url') || 'https://script.google.com/macros/s/AKfycbxWoPKmxtRnR72V_oKfUX_QJv5Oq0wXOoQnl5fGylQBvmKhVLzboptV61aLB_2XvVOXwA/exec';  // Apps Script Web App URL

// ─── Schema ───────────────────────────────────────────────────────────────
const CATEGORIES = {
  chemicals: {
    label: 'Chemicals', color: 'green', dot: '#4ade80',
    subs: ['Algubati', 'Urisnap', 'PLGA', 'MTCC', 'Biotech'],
    fields: [
      { key: 'name',        label: 'Item Name',        type: 'text',   required: true },
      { key: 'description', label: 'Description',      type: 'text' },
      { key: 'unit',        label: 'Unit',             type: 'text' },
      { key: 'quantity',    label: 'Quantity',         type: 'number' },
      { key: 'expiration',  label: 'Expiration Date',  type: 'date' },
      { key: 'status',      label: 'Status',           type: 'select', options: ['Available', 'Consumed', 'Damaged', 'Expired'] },
      { key: 'numUsed',     label: 'Number of Used',   type: 'number' },
      { key: 'numSealed',   label: 'Number of Sealed', type: 'number' },
      { key: 'brand',       label: 'Brand',            type: 'text' },
      { key: 'remarks',     label: 'Remarks',          type: 'text' },
    ]
  },
  consumables: {
    label: 'Consumables', color: 'orange', dot: '#fb923c',
    subs: ['Algubati', 'Urisnap', 'PLGA', 'MTCC', 'Biotech'],
    fields: [
      { key: 'name',        label: 'Item Name',        type: 'text',   required: true },
      { key: 'description', label: 'Description',      type: 'text' },
      { key: 'unit',        label: 'Unit',             type: 'text' },
      { key: 'quantity',    label: 'Quantity',         type: 'number' },
      { key: 'status',      label: 'Status',           type: 'select', options: ['Available', 'Consumed', 'Damaged', 'Expired'] },
      { key: 'numUsed',     label: 'Number of Used',   type: 'number' },
      { key: 'numSealed',   label: 'Number of Sealed', type: 'number' },
      { key: 'brand',       label: 'Brand',            type: 'text' },
      { key: 'remarks',     label: 'Remarks',          type: 'text' },
    ]
  },
  equipment: {
    label: 'Equipment', color: 'purple', dot: '#a78bfa',
    subs: ['MTCC'],
    fields: [
      { key: 'name',        label: 'Item Name',           type: 'text',   required: true },
      { key: 'description', label: 'Description',         type: 'text' },
      { key: 'supplier',    label: 'Supplier',            type: 'text' },
      { key: 'brand',       label: 'Brand',               type: 'text' },
      { key: 'model',       label: 'Model',               type: 'text' },
      { key: 'oldPropNum',  label: 'Old Property Number', type: 'text' },
      { key: 'newPropNum',  label: 'New Property Number', type: 'text' },
      { key: 'unitMeasure', label: 'Unit of Measure',     type: 'text' },
      { key: 'unitValue',   label: 'Unit Value (Price)',   type: 'number' },
      { key: 'quantity',    label: 'Quantity',            type: 'number' },
      { key: 'remarks',     label: 'Remarks',             type: 'select', options: ['—', 'For Calibration', 'PMS'] },
    ]
  },
  glassware: {
    label: 'Glassware', color: 'blue', dot: '#60a5fa',
    subs: ['Algubati', 'Urisnap', 'PLGA', 'MTCC', 'Biotech'],
    fields: [
      { key: 'name',        label: 'Item Name',  type: 'text',   required: true },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'quantity',    label: 'Quantity',    type: 'number' },
      { key: 'brand',       label: 'Brand',       type: 'text' },
      { key: 'status',      label: 'Status',      type: 'select', options: ['Available', 'Barrowed', 'Damaged', 'For Replacement'] },
      { key: 'remarks',     label: 'Remarks',     type: 'text' },
    ]
  }
};

// ─── State ────────────────────────────────────────────────────────────────
let state        = {};
let currentCat   = null;
let currentSub   = null;
let editIndex    = null;
let deleteIndex  = null;
let searchQ      = '';

// ─── Default data structure for JsonBIN ───────────────────────────────────
// JsonBIN requires non-empty JSON. This is the initial structure to paste.
function buildEmpty() {
  const s = { _init: true };
  for (const cat of Object.keys(CATEGORIES)) {
    s[cat] = {};
    for (const sub of CATEGORIES[cat].subs) {
      s[cat][sub] = [];
    }
  }
  return s;
}

// ─── JsonBIN helpers ──────────────────────────────────────────────────────
async function loadData() {
  if (!BIN_ID || !MASTER_KEY) {
    state = buildEmpty();
    return;
  }
  try {
    const r = await fetch(`${JSONBIN_BASE}/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY }
    });
    if (!r.ok) throw new Error('Fetch failed: ' + r.status);
    const j = await r.json();
    state = j.record || buildEmpty();
    // Ensure all category/sub keys exist even on older bins
    for (const cat of Object.keys(CATEGORIES)) {
      if (!state[cat]) state[cat] = {};
      for (const sub of CATEGORIES[cat].subs) {
        if (!state[cat][sub]) state[cat][sub] = [];
      }
    }
  } catch (e) {
    showToast('Could not load data from JsonBIN. Check Settings.', 'error');
    state = buildEmpty();
  }
}

async function saveData() {
  // ── 1. Save to JsonBIN ──
  if (!BIN_ID || !MASTER_KEY) {
    showToast('Configure JsonBIN in Settings to persist data.', 'error');
  } else {
    try {
      const r = await fetch(`${JSONBIN_BASE}/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify(state)
      });
      if (!r.ok) throw new Error('Save failed: ' + r.status);
    } catch (e) {
      showToast('Could not save to JsonBIN. Check settings.', 'error');
    }
  }

  // ── 2. Sync to Google Sheets (fire-and-forget) ──
  syncToSheets();
}

// Push entire state to Google Sheets via Apps Script Web App.
// We use a GET request with the payload as a URL parameter — this works
// from any plain HTML/JS site without CORS issues. GAS doGet() receives it fine.
async function syncToSheets() {
  if (!SHEETS_URL) return;
  try {
    const encoded = encodeURIComponent(JSON.stringify(state));
    const url     = `${SHEETS_URL}?action=sync&data=${encoded}`;
    // GET + no-cors: browser sends the request, GAS processes it.
    // We can't read the response body (that's the no-cors trade-off)
    // but the sheet still gets updated reliably.
    await fetch(url, { method: 'GET', mode: 'no-cors' });
    setSheetsIndicator('synced');
  } catch (e) {
    setSheetsIndicator('error');
  }
}

// Small indicator next to the settings button
function setSheetsIndicator(status) {
  const el = document.getElementById('sheetsIndicator');
  if (!el) return;
  if (status === 'synced') {
    el.title   = 'Google Sheets synced ✓';
    el.style.background = 'var(--green)';
  } else {
    el.title   = 'Google Sheets sync failed';
    el.style.background = 'var(--red)';
  }
  el.style.display = 'block';
}

// ─── Nav ──────────────────────────────────────────────────────────────────
function renderNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = '';
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    const isOpen = currentCat === catKey;

    const btn = document.createElement('button');
    btn.className = `cat-btn${isOpen ? ' open active' : ''}`;
    btn.innerHTML = `<span class="cat-dot" style="background:${cat.dot}"></span>${cat.label}<span class="cat-chevron">▶</span>`;
    btn.onclick = () => toggleCat(catKey);
    nav.appendChild(btn);

    const subNav = document.createElement('div');
    subNav.className = `sub-nav${isOpen ? ' open' : ''}`;
    for (const s of cat.subs) {
      const sb = document.createElement('button');
      sb.className = `sub-btn${(currentCat === catKey && currentSub === s) ? ' active' : ''}`;
      sb.textContent = s;
      sb.onclick = () => selectSub(catKey, s);
      subNav.appendChild(sb);
    }
    nav.appendChild(subNav);
  }
}

function toggleCat(catKey) {
  if (currentCat === catKey) {
    currentCat = null;
    currentSub = null;
  } else {
    currentCat = catKey;
    currentSub = null;
  }
  applyCatTheme();
  renderNav();
  renderContent();
}

function selectSub(catKey, sub) {
  currentCat = catKey;
  currentSub = sub;
  searchQ = '';
  applyCatTheme();
  renderNav();
  renderContent();
}

function applyCatTheme() {
  document.body.className = currentCat ? `cat-${currentCat}` : 'cat-chemicals';
}

// ─── Content ──────────────────────────────────────────────────────────────
function renderContent() {
  const content    = document.getElementById('content');
  const addBtn     = document.getElementById('addBtn');
  const breadcrumb = document.getElementById('breadcrumb');

  if (!currentCat || !currentSub) {
    addBtn.style.display = 'none';
    if (!currentCat) {
      breadcrumb.innerHTML = '<span>Select a category</span>';
      content.innerHTML = `
        <div class="welcome">
          <div class="welcome-icon">📦</div>
          <h2>MTCC Inventory Dashboard</h2>
          <p>Select a category and subcategory from the sidebar to view and manage inventory.</p>
        </div>`;
    } else {
      const cat = CATEGORIES[currentCat];
      breadcrumb.innerHTML = `<span>${cat.label}</span>`;
      content.innerHTML = `
        <div class="welcome">
          <div class="welcome-icon">📂</div>
          <h2>${cat.label}</h2>
          <p>Select a subcategory from the sidebar.</p>
        </div>`;
    }
    return;
  }

  const cat    = CATEGORIES[currentCat];
  const fields = cat.fields;
  const items  = (state[currentCat] && state[currentCat][currentSub]) || [];

  breadcrumb.innerHTML = `${cat.label} <span class="breadcrumb-sep">›</span> <span>${currentSub}</span>`;
  addBtn.style.display = 'flex';

  // Stats
  const total     = items.length;
  const available = items.filter(i => (i.status || '').toLowerCase() === 'available').length;
  const totalQty  = fields.find(f => f.key === 'quantity')
    ? items.reduce((a, i) => a + (+(i.quantity) || 0), 0)
    : null;

  const statsBar = `
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-label">Total Items</div>
        <div class="stat-value">${total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Available</div>
        <div class="stat-value" style="color:var(--green)">${available}</div>
      </div>
      ${totalQty !== null ? `<div class="stat-card"><div class="stat-label">Total Qty</div><div class="stat-value">${totalQty}</div></div>` : ''}
    </div>`;

  // Setup banner if no credentials
  const banner = (!BIN_ID || !MASTER_KEY) ? `
    <div class="setup-banner">
      <div class="setup-banner-icon">🔌</div>
      <div>
        <h3>Connect to JsonBIN to persist data</h3>
        <p>Data lives in memory only until you connect. Go to
        <a href="https://jsonbin.io" target="_blank">jsonbin.io</a>, create an account,
        make a new Bin with the initial JSON structure (see Settings), then paste your
        <strong>Master Key</strong> and <strong>Bin ID</strong>.</p>
        <button class="btn btn-primary" onclick="openSettings()" style="margin-top:12px">⚙ Open Settings</button>
      </div>
    </div>` : '';

  // Filter
  const filtered = searchQ
    ? items.filter(i => fields.some(f =>
        (i[f.key] || '').toString().toLowerCase().includes(searchQ.toLowerCase())
      ))
    : items;

  // Headers
  const headers = fields.map((f, idx) =>
    `<th${idx === 0 ? ' class="frozen"' : ''}>${f.label}</th>`
  ).join('') + '<th style="width:90px">Actions</th>';

  // Rows
  const rows = filtered.length === 0
    ? `<tr class="empty-row"><td colspan="${fields.length + 1}">No items yet. Click "＋ Add Item" to get started.</td></tr>`
    : filtered.map(item => {
        const realIdx = items.indexOf(item);
        const cells = fields.map((f, idx) => {
          let val = item[f.key];
          if (val === undefined || val === null || val === '') val = '—';
          let disp = escHtml(String(val));
          if (f.type === 'select' && val !== '—') disp = badgeHtml(val);
          return `<td${idx === 0 ? ' class="frozen"' : ''}>${disp}</td>`;
        }).join('');
        return `<tr>
          ${cells}
          <td><div class="row-actions">
            <button class="action-btn" onclick="editItem(${realIdx})">✏ Edit</button>
            <button class="action-btn delete" onclick="promptDelete(${realIdx})">🗑</button>
          </div></td>
        </tr>`;
      }).join('');

  content.innerHTML = `
    ${banner}
    ${statsBar}
    <div class="table-wrap">
      <div class="table-toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input id="searchInput" type="text" placeholder="Search items…"
            value="${escHtml(searchQ)}" oninput="onSearch(this.value)" />
        </div>
        <span style="font-size:12px;color:var(--muted);margin-left:auto">
          ${filtered.length} of ${total} item${total !== 1 ? 's' : ''}
        </span>
      </div>
      <div class="table-outer">
        <table>
          <thead><tr>${headers}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

function badgeHtml(val) {
  const map = {
    'Available':       'available',
    'Consumed':        'consumed',
    'Damaged':         'damaged',
    'Expired':         'expired',
    'Barrowed':        'borrowed',
    'For Replacement': 'replacement',
    'For Calibration': 'calibration',
    'PMS':             'pms',
    '—':               'none',
  };
  const cls = map[val] || 'none';
  return `<span class="badge badge-${cls}">${escHtml(val)}</span>`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function onSearch(v) {
  searchQ = v;
  renderContent();
  const inp = document.getElementById('searchInput');
  if (inp) { inp.focus(); inp.setSelectionRange(v.length, v.length); }
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────
function openAddModal() {
  editIndex = null;
  document.getElementById('modalTitle').textContent =
    `Add Item — ${CATEGORIES[currentCat].label} › ${currentSub}`;
  document.getElementById('modalSave').textContent = 'Save Item';
  buildForm({});
  document.getElementById('itemModal').classList.add('open');
}

function editItem(idx) {
  editIndex = idx;
  const item = state[currentCat][currentSub][idx];
  document.getElementById('modalTitle').textContent = `Edit Item — ${item.name || 'Item'}`;
  document.getElementById('modalSave').textContent = 'Update Item';
  buildForm(item);
  document.getElementById('itemModal').classList.add('open');
}

function buildForm(data) {
  const fields = CATEGORIES[currentCat].fields;
  document.getElementById('modalForm').innerHTML = fields.map(f => {
    const val  = data[f.key] !== undefined ? escHtml(String(data[f.key])) : '';
    const full = f.key === 'description' ? ' full' : '';
    if (f.type === 'select') {
      const opts = f.options.map(o =>
        `<option value="${escHtml(o)}"${data[f.key] === o ? ' selected' : ''}>${escHtml(o)}</option>`
      ).join('');
      return `<div class="form-group${full}">
        <label class="form-label">${f.label}${f.required ? ' *' : ''}</label>
        <select class="form-select" data-key="${f.key}">
          <option value="">— Select —</option>${opts}
        </select></div>`;
    }
    return `<div class="form-group${full}">
      <label class="form-label">${f.label}${f.required ? ' *' : ''}</label>
      <input class="form-input" type="${f.type}" placeholder="${f.label}"
        value="${val}" data-key="${f.key}" />
    </div>`;
  }).join('');
}

function saveItem() {
  const fields = CATEGORIES[currentCat].fields;
  const form   = document.getElementById('modalForm');
  const item   = {};
  for (const f of fields) {
    const el = form.querySelector(`[data-key="${f.key}"]`);
    if (el) item[f.key] = el.value.trim();
  }
  if (!item.name) {
    showToast('Item Name is required.', 'error');
    return;
  }

  if (!state[currentCat]) state[currentCat] = {};
  if (!state[currentCat][currentSub]) state[currentCat][currentSub] = [];

  if (editIndex !== null) {
    state[currentCat][currentSub][editIndex] = item;
    showToast('Item updated successfully.', 'success');
  } else {
    state[currentCat][currentSub].push(item);
    showToast('Item added successfully.', 'success');
  }

  saveData();
  closeModal();
  renderContent();
}

function closeModal() {
  document.getElementById('itemModal').classList.remove('open');
  editIndex = null;
}

// ─── Delete ───────────────────────────────────────────────────────────────
function promptDelete(idx) {
  deleteIndex = idx;
  const name = state[currentCat][currentSub][idx].name || 'this item';
  document.getElementById('deleteItemName').textContent = name;
  document.getElementById('confirmModal').classList.add('open');
}

function closeConfirm() {
  document.getElementById('confirmModal').classList.remove('open');
  deleteIndex = null;
}

function confirmDelete() {
  if (deleteIndex === null) return;
  state[currentCat][currentSub].splice(deleteIndex, 1);
  saveData();
  showToast('Item deleted.', 'success');
  closeConfirm();
  renderContent();
}

// ─── Settings ─────────────────────────────────────────────────────────────
function openSettings() {
  document.getElementById('cfg-key').value    = MASTER_KEY;
  document.getElementById('cfg-bin').value    = BIN_ID;
  document.getElementById('cfg-sheets').value = SHEETS_URL;
  document.getElementById('settingsModal').classList.add('open');
}

function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
}

async function saveSettings() {
  MASTER_KEY  = document.getElementById('cfg-key').value.trim();
  BIN_ID      = document.getElementById('cfg-bin').value.trim();
  SHEETS_URL  = document.getElementById('cfg-sheets').value.trim();
  localStorage.setItem('mtcc_key',        MASTER_KEY);
  localStorage.setItem('mtcc_bin',        BIN_ID);
  localStorage.setItem('mtcc_sheets_url', SHEETS_URL);

  // Show/hide the sheets indicator dot
  const ind = document.getElementById('sheetsIndicator');
  if (ind) ind.style.display = SHEETS_URL ? 'block' : 'none';

  closeSettings();
  document.getElementById('content').innerHTML =
    '<div class="loading"><div class="spinner"></div>Loading from JsonBIN…</div>';
  await loadData();
  renderContent();
  showToast('Settings saved!', 'success');

  // Trigger an immediate sync so the sheet is up to date right away
  if (SHEETS_URL) syncToSheets();
}

// ─── Toast ────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = (type === 'success' ? '✓ ' : '✕ ') + msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ─── Event wiring ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addBtn').onclick     = openAddModal;
  document.getElementById('settingsBtn').onclick = openSettings;

  ['itemModal', 'confirmModal', 'settingsModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', function (e) {
      if (e.target !== this) return;
      if (id === 'itemModal')    closeModal();
      if (id === 'confirmModal') closeConfirm();
      if (id === 'settingsModal') closeSettings();
    });
  });

  // Boot
  (async () => {
    if (BIN_ID && MASTER_KEY) {
      document.getElementById('content').innerHTML =
        '<div class="loading"><div class="spinner"></div>Loading from JsonBIN…</div>';
      await loadData();
    } else {
      state = buildEmpty();
    }
    renderNav();
    renderContent();
  })();
});