// ─── Config ───────────────────────────────────────────────────────────────
const JSONBIN_BASE = 'https://api.jsonbin.io/v3';
let MASTER_KEY   = localStorage.getItem('mtcc_key')        || '$2a$10$6YUxFYON7tl.lHl13unwY.JY7BTEdnDYxnRzbS2pZriMdq5EdLEM2';
let BIN_ID       = localStorage.getItem('mtcc_bin')        || '6a03d6a8adc21f119a908818';
let SHEETS_URL   = localStorage.getItem('mtcc_sheets_url')  || 'https://script.google.com/macros/s/AKfycbxWoPKmxtRnR72V_oKfUX_QJv5Oq0wXOoQnl5fGylQBvmKhVLzboptV61aLB_2XvVOXwA/exec';  // Apps Script Web App URL
let SHEET_LINK   = localStorage.getItem('mtcc_sheet_link')  || 'https://docs.google.com/spreadsheets/d/1kHpSXnIYJaFCAWviIe5F9S8AY9TxJ4GUMmt-gNQGQS0/edit?usp=sharing';  // Direct Google Sheet URL

// ─── Schema ───────────────────────────────────────────────────────────────
const CATEGORIES = {
  chemicals: {
    label: 'Chemicals', color: 'green', dot: '#4ade80',
    subs: ['Alugbati', 'Urisnap', 'PLGA', 'MTCC', 'Biotech'],
    fields: [
      { key: 'name',        label: 'Item Name',        type: 'text',   required: true },
      { key: 'description', label: 'Description',      type: 'text' },
      { key: 'quantity',    label: 'Quantity',         type: 'number' },
      { key: 'brand',       label: 'Brand',            type: 'text' },
      { key: 'numSealed',   label: 'No. of Sealed',    type: 'number' },
      { key: 'numUsed',     label: 'No. of Used',      type: 'number' },
      { key: 'expiration',  label: 'Expiration Date',  type: 'date' },
      { key: 'status',      label: 'Status',           type: 'select', options: ['Available', 'Consumed', 'Damaged', 'Expired'] },
      { key: 'remarks',     label: 'Remarks',          type: 'text' },
      { key: 'project',     label: 'Project',          type: 'text' },
    ]
  },
  consumables: {
    label: 'Consumables', color: 'orange', dot: '#fb923c',
    subs: ['Alugbati', 'Urisnap', 'PLGA', 'MTCC', 'Biotech'],
    fields: [
      { key: 'name',        label: 'Item Name',        type: 'text',   required: true },
      { key: 'description', label: 'Description',      type: 'text' },
      { key: 'quantity',    label: 'Quantity',         type: 'number' },
      { key: 'brand',       label: 'Brand',            type: 'text' },
      { key: 'numSealed',   label: 'No. of Sealed',    type: 'number' },
      { key: 'numUnsealed', label: 'No. of Unsealed',  type: 'number' },
      { key: 'status',      label: 'Status',           type: 'select', options: ['Available', 'Consumed', 'Damaged', 'Expired'] },
      { key: 'remarks',     label: 'Remarks',          type: 'text' },
      { key: 'project',     label: 'Project',          type: 'text' },
    ]
  },
  semiExpandable: {
    label: 'Semi-Expandable', color: 'amber',  dot: '#fde047',
    subs: ['Alugbati', 'Urisnap', 'PLGA', 'MTCC', 'Biotech'],
    fields: [
      { key: 'name',        label: 'Item Name',           type: 'text',   required: true },
      { key: 'description', label: 'Description',         type: 'text' },
      { key: 'quantity',    label: 'Quantity',            type: 'number' },
      { key: 'supplier',    label: 'Supplier',            type: 'text' },
      { key: 'unitValue',   label: 'Unit Value (₱)',      type: 'number' },
      { key: 'oldPropNum',  label: 'Old Property Number', type: 'text' },
      { key: 'newPropNum',  label: 'New Property Number', type: 'text' },
      { key: 'allocation',  label: 'Allocation',          type: 'text' },
      { key: 'remarks',     label: 'Remarks',             type: 'text' },
    ]
  },
  equipment: {
    label: 'Equipment', color: 'purple', dot: '#a78bfa',
    subs: ['MTCC', 'Urisnap'],
    fields: [
      { key: 'name',        label: 'Item Name',             type: 'text',   required: true },
      { key: 'description', label: 'Description',           type: 'text' },
      { key: 'supplier',    label: 'Supplier',              type: 'text' },
      { key: 'oldPropNum',  label: 'Old Property No.',      type: 'text' },
      { key: 'newPropNum',  label: 'New Property No.',      type: 'text' },
      { key: 'unitMeasure', label: 'Unit of Measure',       type: 'text' },
      { key: 'unitValue',   label: 'Unit Value (₱)',        type: 'number' },
      { key: 'quantity',    label: 'Quantity',              type: 'number' },
      { key: 'allocation',  label: 'Allocation',            type: 'text' },
      { key: 'remarks',     label: 'Remarks',               type: 'select', options: ['—', 'For Calibration', 'PMS'] },
    ]
  },
  calibrators: {
    label: 'Calibrators', color: 'purple', dot: '#c084fc',
    subs: ['MTCC'],
    fields: [
      { key: 'itemNo',      label: 'Item No.',           type: 'text' },
      { key: 'name',        label: 'Item Name',          type: 'text',   required: true },
      { key: 'description', label: 'Description',        type: 'text' },
      { key: 'brandModel',  label: 'Brand / Model',      type: 'text' },
      { key: 'supplier',    label: 'Supplier',           type: 'text' },
      { key: 'serialNo',    label: 'Serial No.',         type: 'text' },
      { key: 'oldPropNum',  label: 'Old Property No.',   type: 'text' },
      { key: 'newPropNum',  label: 'New Property No.',   type: 'text' },
      { key: 'unitMeasure', label: 'Unit of Measure',    type: 'text' },
      { key: 'unitValue',   label: 'Unit Value (₱)',     type: 'number' },
      { key: 'quantity',    label: 'Quantity',           type: 'number' },
      { key: 'remarks',     label: 'Remarks',            type: 'select', options: ['—', 'For Calibration', 'PMS'] },
    ]
  },
  chemEngDonation: {
    label: 'ChemEng Donation', color: 'teal', dot: '#2dd4bf',
    subs: ['MTCC'],
    fields: [
      { key: 'name',        label: 'Item Name',          type: 'text',   required: true },
      { key: 'description', label: 'Description',        type: 'text' },
      { key: 'supplier',    label: 'Supplier',           type: 'text' },
      { key: 'oldPropNum',  label: 'Old Property No.',   type: 'text' },
      { key: 'newPropNum',  label: 'New Property No.',   type: 'text' },
      { key: 'unitMeasure', label: 'Unit of Measure',    type: 'text' },
      { key: 'unitValue',   label: 'Unit Value (₱)',     type: 'number' },
      { key: 'quantity',    label: 'Quantity',           type: 'number' },
      { key: 'allocation',  label: 'Allocation',         type: 'text' },
      { key: 'remarks',     label: 'Remarks',            type: 'text' },
    ]
  },
  glassware: {
    label: 'Glassware', color: 'blue', dot: '#60a5fa',
    subs: ['Alugbati', 'Urisnap', 'PLGA', 'MTCC', 'Biotech'],
    fields: [
      { key: 'name',        label: 'Item Name',   type: 'text',   required: true },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'quantity',    label: 'Quantity',    type: 'number' },
      { key: 'brand',       label: 'Brand',       type: 'text' },
      { key: 'status',      label: 'Status',      type: 'select', options: ['Available', 'Borrowed', 'Damaged', 'For Replacement'] },
      { key: 'remarks',     label: 'Remarks',     type: 'text' },
      { key: 'project',     label: 'Project',     type: 'text' },
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
    document.getElementById('importBtn').style.display  = 'none';
    document.getElementById('exportBtn').style.display  = 'none';
    document.getElementById('sheetLinkBtn').style.display = 'none';
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
  document.getElementById('importBtn').style.display  = 'flex';
  document.getElementById('exportBtn').style.display  = 'flex';
  const slBtn = document.getElementById('sheetLinkBtn');
  slBtn.style.display = SHEET_LINK ? 'flex' : 'none';
 
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
  document.getElementById('cfg-key').value       = MASTER_KEY;
  document.getElementById('cfg-bin').value       = BIN_ID;
  document.getElementById('cfg-sheets').value    = SHEETS_URL;
  document.getElementById('cfg-sheetlink').value = SHEET_LINK;
  document.getElementById('settingsModal').classList.add('open');
}
 
function closeSettings() {
  document.getElementById('settingsModal').classList.remove('open');
}
 
async function saveSettings() {
  MASTER_KEY  = document.getElementById('cfg-key').value.trim();
  BIN_ID      = document.getElementById('cfg-bin').value.trim();
  SHEETS_URL  = document.getElementById('cfg-sheets').value.trim();
  SHEET_LINK  = document.getElementById('cfg-sheetlink').value.trim();
  localStorage.setItem('mtcc_key',        MASTER_KEY);
  localStorage.setItem('mtcc_bin',        BIN_ID);
  localStorage.setItem('mtcc_sheets_url', SHEETS_URL);
  localStorage.setItem('mtcc_sheet_link', SHEET_LINK);
 
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
  document.getElementById('addBtn').onclick      = openAddModal;
  document.getElementById('importBtn').onclick   = openImport;
  document.getElementById('exportBtn').onclick   = exportToExcel;
  document.getElementById('sheetLinkBtn').onclick = openSheetLink;
  document.getElementById('settingsBtn').onclick  = openSettings;
 
  ['itemModal', 'confirmModal', 'settingsModal', 'importModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', function (e) {
      if (e.target !== this) return;
      if (id === 'itemModal')    closeModal();
      if (id === 'confirmModal') closeConfirm();
      if (id === 'settingsModal') closeSettings();
      if (id === 'importModal')  closeImport();
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
 
// ─── Import ───────────────────────────────────────────────────────────────
// Column header aliases: maps common spreadsheet headers → our field keys.
// Matching is case-insensitive and ignores punctuation/spaces.
const IMPORT_ALIASES = {
  // Item Name — your sheets use 'Artcile/Item' (typo in original) and 'Item Name'
  name:         ['item name','itemname','name','item','artcile/item','article/item','artcile item','article item'],
  description:  ['description','desc','details'],
  quantity:     ['quantity','qty','count','amount','quantity '],
  brand:        ['brand','make','brand/model'],
  expiration:   ['expiration date','expiration','expiry','expiry date','exp date','exp'],
  status:       ['status'],
  // Chemicals & Consumables sealed/used/unsealed
  numSealed:    ['no.of sealed','no. of sealed','number of sealed','no of sealed','sealed','num sealed','# sealed'],
  numUsed:      ['no.of used','no. of used','number of used','no of used','used','num used','# used'],
  numUnsealed:  ['no. of unsealed','no.of unsealed','number of unsealed','no of unsealed','unsealed','num unsealed','# unsealed'],
  // Equipment / Semi-expandable
  supplier:     ['supplier','vendor','supplied by'],
  unitValue:    ['unit value, php','unit value (₱)','unit value (price)','unit value','price','unit price','cost','unit value, php '],
  oldPropNum:   ['old property no. assigned','old property no. assigned ','old property number','old property no','old prop no','old prop number','old prop#'],
  newPropNum:   ['new property no. assigned','new property no. assigned ','new property number','new property no','new prop no','new prop number','new prop#'],
  allocation:   ['allocation','allocated to','allotted'],
  unitMeasure:  ['unit of measure','unit measure','uom'],
  model:        ['model','model number','model no','brand/model'],
  // Calibrators
  itemNo:       ['item no.','item no','item number','#'],
  serialNo:     ['serial no.','serial no','serial number','serial'],
  // Shared
  remarks:      ['remarks','notes','note','comment','comments'],
  project:      ['project'],
};
 
let importParsedRows  = [];   // raw rows from file [{colHeader: value}, ...]
let importMappedItems = [];   // mapped to our field keys
let importColMap      = {};   // { ourKey: fileHeader }
 
function openImport() {
  // Reset state
  importParsedRows  = [];
  importMappedItems = [];
  importColMap      = {};
  document.getElementById('importStep1').style.display = 'block';
  document.getElementById('importStep2').style.display = 'none';
  document.getElementById('importNextBtn').style.display = 'inline-flex';
  document.getElementById('importNextBtn').disabled = true;
  document.getElementById('importConfirmBtn').style.display = 'none';
  document.getElementById('importBackBtn').style.display = 'none';
  document.getElementById('importFileName').textContent = '';
  document.getElementById('fileInput').value = '';
  document.getElementById('importModalTitle').textContent =
    `⬆ Import into ${CATEGORIES[currentCat].label} › ${currentSub}`;
  document.getElementById('importModal').classList.add('open');
}
 
function closeImport() {
  document.getElementById('importModal').classList.remove('open');
}
 
// Drag-and-drop handlers
function onDragOver(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.add('drag-over');
}
function onDragLeave(e) {
  document.getElementById('dropZone').classList.remove('drag-over');
}
function onDrop(e) {
  e.preventDefault();
  document.getElementById('dropZone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
}
function onFileSelected(input) {
  if (input.files[0]) handleFile(input.files[0]);
}
 
function handleFile(file) {
  const name = file.name.toLowerCase();
  if (!name.endsWith('.xlsx') && !name.endsWith('.csv')) {
    showToast('Please upload a .xlsx or .csv file.', 'error');
    return;
  }
  document.getElementById('importFileName').textContent = `📄 ${file.name}`;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      let rows = [];
      if (name.endsWith('.csv')) {
        rows = parseCSV(e.target.result);
      } else {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true });
        // Try to find the right sheet — prefer one matching the current category/sub
        const catLabel = CATEGORIES[currentCat].label.toLowerCase();
        const subLabel = currentSub.toLowerCase();
        let sheetName  = wb.SheetNames[0]; // default: first sheet
        for (const sn of wb.SheetNames) {
          const snl = sn.toLowerCase();
          if (snl.includes(subLabel) && snl.includes(catLabel.substring(0, 4))) {
            sheetName = sn; break;
          }
          if (snl.includes(subLabel)) { sheetName = sn; break; }
        }
        const ws = wb.Sheets[sheetName];
        rows = parseSheetWithHeaderDetection(ws);
      }
      if (!rows.length) {
        showToast('File appears empty or unreadable.', 'error');
        return;
      }
      importParsedRows = rows;
      document.getElementById('importNextBtn').disabled = false;
      showToast(`Loaded ${rows.length} rows. Click Next to preview.`, 'success');
    } catch (err) {
      showToast('Could not read file: ' + err.message, 'error');
    }
  };
  if (name.endsWith('.csv')) {
    reader.readAsText(file);
  } else {
    reader.readAsBinaryString(file);
  }
}
 
// Detect the real header row by finding which row has the most keyword matches.
// Your Excel sheets have a title row first (e.g. "ALUGBATI Chemicals"),
// then the real column headers on the next row — so we score every row
// and pick the best match rather than stopping at the first partial match.
function parseSheetWithHeaderDetection(ws) {
  // raw:false keeps dates as strings; header:1 gives us plain 2D array
  // We read twice: once raw for header detection, once formatted for data
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
  if (!raw.length) return [];
  console.log('[Import] raw rows 0-3:', raw.slice(0,4));
 
  // All known field keywords from our schema + your exact sheet headers
  const knownHeaders = [
    'item name','artcile/item','article/item','description','quantity',
    'brand','status','remarks','supplier','unit value, php','unit value',
    'expiration date','expiration','no.of sealed','no. of sealed',
    'no. of unsealed','no.of unsealed','no.of used','no. of used',
    'allocation','project','serial no.','serial no','item no.','item no',
    'old property','new property','unit of measure','brand/model'
  ];
 
  // Score each of the first 10 rows
  let bestIdx = 0, bestScore = -1;
  for (let i = 0; i < Math.min(raw.length, 10); i++) {
    const rowVals = raw[i].map(c => String(c).toLowerCase().trim());
    // A cell scores if it matches any known header AND is short (not a paragraph)
    const score = rowVals.filter(v =>
      v.length > 0 && v.length < 50 &&
      knownHeaders.some(h => v === h || v.startsWith(h.substring(0, 5)))
    ).length;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
 
  // Extract headers from best row, filtering out empty cells
  const rawHeaders = raw[bestIdx];
  const headers    = rawHeaders.map(h => String(h).trim());
 
  // Data starts on the row after the header
  const dataRows = raw.slice(bestIdx + 1);
 
  return dataRows
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        if (h) obj[h] = String(row[i] || '').trim();
      });
      return obj;
    })
    .filter(row => Object.values(row).some(v => v && v !== '' && v !== '—'));
}
 
// Simple CSV parser
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}
 
// Normalize a string for loose matching — strip non-breaking spaces,
// punctuation, extra whitespace so 'No.of Sealed' === 'no of sealed'
function norm(s) {
  return String(s)
    .replace(/\u00a0/g, ' ')   // non-breaking space
    .replace(/\u200b/g, '')    // zero-width space
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')  // punctuation → space
    .replace(/\s+/g, ' ')        // collapse spaces
    .trim();
}
 
// Same normalization but keep dots for alias matching
function normAlias(s) {
  return String(s)
    .replace(/\u00a0/g, ' ')
    .replace(/\u200b/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}
 
// Build column map: our field key → matching file header (or null)
// Uses multiple matching strategies in order of strictness
function buildColMap(fileHeaders, catKey) {
  const fields = CATEGORIES[catKey].fields;
  const map    = {};
  for (const f of fields) {
    const aliases = IMPORT_ALIASES[f.key] || [f.label.toLowerCase()];
    let match = null;
 
    // Strategy 1: exact match after full normalization (letters+digits+spaces only)
    match = fileHeaders.find(h => aliases.some(a => norm(a) === norm(h)));
 
    // Strategy 2: alias normalization keeping dots (catches 'no.of sealed')
    if (!match) {
      match = fileHeaders.find(h => {
        const hn = normAlias(h);
        return aliases.some(a => normAlias(a) === hn);
      });
    }
 
    // Strategy 3: file header starts with alias (catches truncated headers)
    if (!match) {
      match = fileHeaders.find(h => {
        const hn = norm(h);
        return aliases.some(a => { const an = norm(a); return an.length > 3 && hn.startsWith(an); });
      });
    }
 
    // Strategy 4: alias starts with file header (reverse of above)
    if (!match) {
      match = fileHeaders.find(h => {
        const hn = norm(h);
        return hn.length > 3 && aliases.some(a => norm(a).startsWith(hn));
      });
    }
 
    map[f.key] = match || null;
  }
  return map;
}
 
function importNext() {
  if (!importParsedRows.length) return;
  const fileHeaders = Object.keys(importParsedRows[0]);
  importColMap      = buildColMap(fileHeaders, currentCat);
  const fields      = CATEGORIES[currentCat].fields;
 
  // Map rows → items
  importMappedItems = importParsedRows.map(row => {
    const item = {};
    for (const f of fields) {
      const header = importColMap[f.key];
      item[f.key]  = header ? String(row[header] || '').trim() : '';
    }
    return item;
  }).filter(item => item.name); // skip rows with no Item Name
 
  // Build mapping table HTML
  const mappingRows = fields.map(f => {
    const header  = importColMap[f.key];
    const matched = !!header;
    return `<div class="mapping-row ${matched ? 'matched' : 'skipped'}">
      <span>${escHtml(header || '(not found)')}</span>
      <span class="mapping-arrow">${matched ? '→' : '✕'}</span>
      <span class="${matched ? 'mapping-field' : 'mapping-skip'}">${f.label}</span>
    </div>`;
  }).join('');
 
  document.getElementById('mappingTable').innerHTML = mappingRows;
  document.getElementById('importSummary').innerHTML =
    `<strong style="color:var(--active)">${importMappedItems.length}</strong> items ready to import` +
    ` from <strong style="color:var(--text)">${fileHeaders.length}</strong> columns detected in file.<br>` +
    `<span style="color:var(--muted)">${fields.filter(f=>importColMap[f.key]).length} of ${fields.length} fields matched automatically.</span>`;
  document.getElementById('importTargetLabel').textContent =
    `${CATEGORIES[currentCat].label} › ${currentSub}`;
 
  // Switch to step 2
  document.getElementById('importStep1').style.display = 'none';
  document.getElementById('importStep2').style.display = 'block';
  document.getElementById('importNextBtn').style.display = 'none';
  document.getElementById('importConfirmBtn').style.display = 'inline-flex';
  document.getElementById('importBackBtn').style.display = 'inline-flex';
}
 
function importGoBack() {
  document.getElementById('importStep1').style.display = 'block';
  document.getElementById('importStep2').style.display = 'none';
  document.getElementById('importNextBtn').style.display = 'inline-flex';
  document.getElementById('importConfirmBtn').style.display = 'none';
  document.getElementById('importBackBtn').style.display = 'none';
}
 
async function confirmImport() {
  if (!importMappedItems.length) {
    showToast('No valid items to import.', 'error');
    return;
  }
  if (!state[currentCat]) state[currentCat] = {};
  state[currentCat][currentSub] = importMappedItems;
 
  closeImport();
  await saveData();
  renderContent();
  showToast(`Imported ${importMappedItems.length} items into ${CATEGORIES[currentCat].label} › ${currentSub}!`, 'success');
}
 
// ─── Open Google Sheet link ───────────────────────────────────────────────
function openSheetLink() {
  if (!SHEET_LINK) {
    showToast('No Sheet URL configured. Add it in Settings.', 'error');
    return;
  }
  window.open(SHEET_LINK, '_blank');
}
 
// ─── Export current view to Excel (.xlsx) ────────────────────────────────
function exportToExcel() {
  if (!currentCat || !currentSub) return;
 
  const cat    = CATEGORIES[currentCat];
  const fields = cat.fields;
  const items  = (state[currentCat] && state[currentCat][currentSub]) || [];
 
  // Build worksheet data: header row + data rows
  const headers = fields.map(f => f.label);
  const rows    = items.map(item =>
    fields.map(f => {
      const v = item[f.key];
      return (v === undefined || v === null || v === '') ? '—' : v;
    })
  );
 
  const wsData = [headers, ...rows];
  const ws     = XLSX.utils.aoa_to_sheet(wsData);
 
  // Column widths
  ws['!cols'] = headers.map(() => ({ wch: 20 }));
 
  // Workbook
  const wb       = XLSX.utils.book_new();
  const tabName  = `${cat.label} - ${currentSub}`.substring(0, 31); // Excel tab limit
  XLSX.utils.book_append_sheet(wb, ws, tabName);
 
  const filename = `MTCC_${cat.label}_${currentSub}_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`Exported ${items.length} items to ${filename}`, 'success');
}
 
// ─── Export ALL categories to a single Excel workbook ────────────────────
function exportAllToExcel() {
  const wb = XLSX.utils.book_new();
  let sheetCount = 0;
 
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    const fields = cat.fields;
    for (const sub of cat.subs) {
      const items = (state[catKey] && state[catKey][sub]) || [];
      if (!items.length) continue; // skip empty tabs
 
      const headers = fields.map(f => f.label);
      const rows    = items.map(item =>
        fields.map(f => {
          const v = item[f.key];
          return (v === undefined || v === null || v === '') ? '—' : v;
        })
      );
 
      const ws      = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols']   = headers.map(() => ({ wch: 18 }));
      const tabName = `${cat.label} - ${sub}`.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, tabName);
      sheetCount++;
    }
  }
 
  if (!sheetCount) {
    showToast('No data to export yet.', 'error');
    return;
  }
 
  const filename = `MTCC_Inventory_Full_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast(`Exported ${sheetCount} sheets to ${filename}`, 'success');
}
 
