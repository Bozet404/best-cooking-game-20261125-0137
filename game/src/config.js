// Sizzle & Serve — configuration: canvas size, recipes, stations, tuning.
// Every value the kitchen logic and the renderer share lives here, so a
// balance tweak is one edit in one place.
const SIZZLE_CONFIG = {
  width: 1280,
  height: 720,
  topBar: 64,
  daySeconds: 180,
  orderSeconds: 60,
  maxOrders: 3,
  orderSpawnEvery: 12,
  hearts: 3,
  carryMax: 3,
  chefSpeed: 240,
  chefRadius: 22,
  interactRange: 86,
  chopSeconds: 1.1,
  cookSeconds: 4.0,
  burnSeconds: 8.0,
  comboWindow: 10,
};

// One item kind per entry. `needs` says what the kitchen must do to it
// before it can go on a plate: nothing, chop it, or cook it.
const SIZZLE_ITEMS = {
  bun:     { label: 'Bun',      color: '#e8b96a', dark: '#b98a3e', needs: 'none' },
  patty:   { label: 'Patty',    color: '#8a5a3b', dark: '#5f3a24', needs: 'cook' },
  lettuce: { label: 'Lettuce',  color: '#7dc24a', dark: '#4d8a26', needs: 'chop' },
  tomato:  { label: 'Tomato',   color: '#e2543e', dark: '#a82e1d', needs: 'chop' },
  cheese:  { label: 'Cheese',   color: '#f7c948', dark: '#c79a1e', needs: 'none' },
};

// A dish is a set of finished items. Two dishes may share items; the plate
// matches an order only when its items are exactly the dish's set.
const SIZZLE_RECIPES = {
  burger: {
    name: 'Classic Burger', coins: 18,
    items: ['bun', 'patty-cooked', 'lettuce-chopped'],
    blurb: 'Bun + grilled patty + chopped lettuce',
  },
  melt: {
    name: 'Cheesy Melt', coins: 22,
    items: ['bun', 'patty-cooked', 'cheese'],
    blurb: 'Bun + grilled patty + cheese',
  },
  salad: {
    name: 'Garden Salad', coins: 12,
    items: ['lettuce-chopped', 'tomato-chopped'],
    blurb: 'Chopped lettuce + chopped tomato',
  },
  bruschetta: {
    name: 'Bruschetta', coins: 16,
    items: ['bun', 'tomato-chopped', 'cheese'],
    blurb: 'Bun + chopped tomato + cheese',
  },
};

// Finished-item key: kind + '-' + state, e.g. 'patty-cooked'.
// A raw item's finished key is just its kind when needs === 'none'.
function sizzleFinishedKey(kind, state) {
  if (state === 'raw') return kind;
  return kind + '-' + state;
}

function sizzleItemLabel(key) {
  const parts = key.split('-');
  const kind = parts[0];
  const state = parts[1] || 'raw';
  const base = SIZZLE_ITEMS[kind];
  if (!base) return key;
  if (state === 'chopped') return 'Chopped ' + base.label;
  if (state === 'cooked') return 'Grilled ' + base.label;
  if (state === 'burnt') return 'Burnt ' + base.label;
  return base.label;
}

// Stations sit on the top and bottom walls; the chef roams the floor
// between them, so every order is a little route through the kitchen.
const SIZZLE_STATIONS = [
  { id: 'bread',   kind: 'give', give: 'bun',     label: 'Bread Box',    x: 36,  y: 96,  w: 128, h: 74, tint: '#d9a05b' },
  { id: 'lettuce', kind: 'give', give: 'lettuce', label: 'Lettuce Crate', x: 196, y: 96,  w: 128, h: 74, tint: '#7dc24a' },
  { id: 'tomato',  kind: 'give', give: 'tomato',  label: 'Tomato Crate',  x: 356, y: 96,  w: 128, h: 74, tint: '#e2543e' },
  { id: 'fridge',  kind: 'give', give: 'patty',   label: 'Fridge',        x: 516, y: 96,  w: 128, h: 74, tint: '#9fc3e8' },
  { id: 'cheese',  kind: 'give', give: 'cheese',  label: 'Cheese Shelf',  x: 676, y: 96,  w: 128, h: 74, tint: '#f7c948' },
  { id: 'board',   kind: 'chop',                  label: 'Chopping Board', x: 836, y: 96, w: 150, h: 74, tint: '#c89b6d' },
  { id: 'stove',   kind: 'cook',                  label: 'Stove',          x: 1018, y: 96, w: 150, h: 74, tint: '#5b5f6b' },
  { id: 'plate',   kind: 'plate',                 label: 'Plating Counter', x: 120, y: 590, w: 210, h: 74, tint: '#f2ead8' },
  { id: 'serve',   kind: 'serve',                 label: 'Serve Window',    x: 420, y: 590, w: 210, h: 74, tint: '#f7c948' },
  { id: 'trash',   kind: 'trash',                 label: 'Trash Bin',       x: 720, y: 590, w: 130, h: 74, tint: '#8d8d8d' },
  { id: 'sink',    kind: 'sink',                  label: 'Sink (wash up)',  x: 920, y: 590, w: 210, h: 74, tint: '#7fb3d5' },
];

function sizzleStationById(id) {
  for (const s of SIZZLE_STATIONS) if (s.id === id) return s;
  return null;
}
