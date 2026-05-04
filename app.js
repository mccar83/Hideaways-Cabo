const defaultUnits = [
  { id: '1301', tower: 'T1', x: 22, y: 55, w: 6, h: 8, status: 'sold', price: 0, beds: 4, baths: 4 },
  { id: '1302', tower: 'T1', x: 28, y: 55, w: 6, h: 8, status: 'available', price: 379000, beds: 2, baths: 2 },
  { id: '1303', tower: 'T1', x: 34, y: 55, w: 6, h: 8, status: 'available', price: 379000, beds: 2, baths: 2 },
  { id: '1304', tower: 'T1', x: 40, y: 55, w: 6, h: 8, status: 'available', price: 379000, beds: 2, baths: 2 },
  { id: '1305', tower: 'T1', x: 46, y: 55, w: 6, h: 8, status: 'sold', price: 0, beds: 3, baths: 3 },
  { id: '2308', tower: 'T2', x: 50, y: 35, w: 6, h: 8, status: 'reserved', price: 0, beds: 3, baths: 3 },
  { id: '2309', tower: 'T2', x: 56, y: 35, w: 6, h: 8, status: 'sold', price: 0, beds: 2, baths: 2 },
  { id: '2310', tower: 'T2', x: 62, y: 35, w: 6, h: 8, status: 'sold', price: 0, beds: 2, baths: 2 },
  { id: '2311', tower: 'T2', x: 68, y: 35, w: 6, h: 8, status: 'sold', price: 0, beds: 2, baths: 2 },
  { id: '2312', tower: 'T2', x: 74, y: 35, w: 6, h: 8, status: 'available', price: 709000, beds: 4, baths: 4 },
  { id: 'T3-01', tower: 'T3', x: 34, y: 18, w: 8, h: 7, status: 'disabled', price: 0, beds: 0, baths: 0 },
  { id: 'T3-02', tower: 'T3', x: 43, y: 18, w: 8, h: 7, status: 'disabled', price: 0, beds: 0, baths: 0 },
  { id: 'T3-03', tower: 'T3', x: 52, y: 18, w: 8, h: 7, status: 'disabled', price: 0, beds: 0, baths: 0 },
  { id: 'T3-04', tower: 'T3', x: 61, y: 18, w: 8, h: 7, status: 'disabled', price: 0, beds: 0, baths: 0 }
];
const storageKey = 'hideaways-cabo-units-v2';
let units = loadUnits();
let selectedId = null;
let editMode = false;
let currentTowerFilter = 'all';
const $ = (id) => document.getElementById(id);

function loadUnits() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return defaultUnits;
  try { return JSON.parse(raw); } catch { return defaultUnits; }
}
function saveUnits() { localStorage.setItem(storageKey, JSON.stringify(units)); }
function formatUsd(value) { return Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }); }
function displayText(u){ if(u.status==='available') return formatUsd(u.price); if(u.status==='reserved') return 'RESERVADO'; if(u.status==='disabled') return 'PRÓXIMAMENTE'; return 'VENDIDO'; }

function renderUnits() {
  const layer = $('unitsLayer');
  layer.innerHTML = '';
  for (const unit of units.filter(u => currentTowerFilter === 'all' || u.tower === currentTowerFilter)) {
    const card = document.createElement('button');
    card.className = `unit ${unit.status}`;
    card.style.left = `${unit.x}%`; card.style.top = `${unit.y}%`; card.style.width = `${unit.w}%`; card.style.height = `${unit.h}%`;
    card.innerHTML = `<h3>${unit.id}</h3><div class="price">${displayText(unit)}</div><div class="meta">${unit.tower} · 🛏 ${unit.beds} · 🛁 ${unit.baths}</div>`;
    card.addEventListener('click', () => selectUnit(unit.id));
    layer.appendChild(card);
  }
}

function selectUnit(id) {
  if (!editMode) return;
  const unit = units.find((u) => u.id === id); if (!unit) return;
  selectedId = id;
  $('selectedUnitHint').textContent = `Editando ${unit.id} (${unit.tower})`;
  $('unitName').value = unit.id; $('unitTower').value = unit.tower; $('unitStatus').value = unit.status;
  $('unitPrice').value = unit.price; $('unitBeds').value = unit.beds; $('unitBaths').value = unit.baths;
  $('unitForm').classList.remove('hidden');
}

$('unitForm').addEventListener('submit', (e) => {
  e.preventDefault();
  units = units.map(u => u.id !== selectedId ? u : ({ ...u, status: $('unitStatus').value, price: Number($('unitPrice').value || 0), beds: Number($('unitBeds').value || 0), baths: Number($('unitBaths').value || 0) }));
  saveUnits(); renderUnits();
});
$('toggleAdminBtn').addEventListener('click', () => {
  editMode = !editMode;
  $('editor').classList.toggle('hidden', !editMode);
  $('toggleAdminBtn').textContent = editMode ? 'Salir edición' : 'Modo edición';
  if (!editMode) $('unitForm').classList.add('hidden');
});
$('towerFilter').addEventListener('change', (e) => { currentTowerFilter = e.target.value; renderUnits(); });
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(units, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'hideaways-fase1-availability.json'; a.click(); URL.revokeObjectURL(url);
});
$('importInput').addEventListener('change', async (e) => {
  const file = e.target.files?.[0]; if (!file) return;
  try { const data = JSON.parse(await file.text()); if (!Array.isArray(data)) throw new Error(); units = data; saveUnits(); renderUnits(); }
  catch { alert('Archivo inválido'); }
});
renderUnits();
