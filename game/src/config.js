// Ember & Oak — Rush Hour Kitchen: every tunable number, recipe and station of the
// game in one place, so balancing the shift never means hunting through the render code.

export const VIEW = { width: 1280, height: 720 };

// The shift: one dinner service, three minutes on the clock.
export const SHIFT_SECONDS = 180;
export const RUSH_AT_SECONDS_LEFT = 45;

// Orders: how fast they arrive, how long a table waits, how many fit on the board.
export const ORDER = {
  firstAtSeconds: 3,
  spawnEverySeconds: 17,
  spawnEveryRushSeconds: 10,
  maxOnBoard: 4,
  patienceSeconds: 78,
  patienceRushSeconds: 58,
};

// The grill: a raw patty cooks, then overcooks and burns.
export const GRILL = { cookSeconds: 6, burnSeconds: 15, slots: 2 };
// The board: vegetables need this many chops before they are ready to plate.
export const BOARD = { chopsNeeded: 3, slots: 2 };

// The chef: how fast they cross the kitchen, and how close they must stand to work.
export const CHEF = { radius: 20, speed: 265, interactRange: 62 };

// Ingredients. `prep` says what a raw ingredient must go through before plating:
// none (ready as it comes), grill (patty), or chop (vegetables).
export const INGREDIENTS = {
  bun:     { name: 'Bun',     prep: 'none',  color: '#e8a54b', dark: '#b97a28' },
  patty:   { name: 'Patty',   prep: 'grill', color: '#8a5a33', dark: '#5d3a1e' },
  cheese:  { name: 'Cheese',  prep: 'none',  color: '#f7c948', dark: '#d99e06' },
  tomato:  { name: 'Tomato',  prep: 'chop',  color: '#e4572e', dark: '#b23a1d' },
  lettuce: { name: 'Lettuce', prep: 'chop',  color: '#7bc950', dark: '#4e9b2e' },
  onion:   { name: 'Onion',   prep: 'chop',  color: '#e9e4f0', dark: '#b9a8cc' },
};

// A dish is a name, the exact stack it needs, its base pay and the colour of its ticket.
export const RECIPES = [
  {
    id: 'ember-classic',
    name: 'Ember Classic',
    needs: ['bun', 'patty', 'cheese'],
    coins: 10,
    ticket: '#f7c948',
    blurb: 'Bun, grilled patty, melted cheese.',
  },
  {
    id: 'garden-stack',
    name: 'Garden Stack',
    needs: ['bun', 'patty', 'lettuce', 'tomato'],
    coins: 13,
    ticket: '#7bc950',
    blurb: 'Bun, patty, lettuce, tomato.',
  },
  {
    id: 'oak-melt',
    name: 'Oak Melt',
    needs: ['bun', 'patty', 'cheese', 'onion'],
    coins: 13,
    ticket: '#e8a54b',
    blurb: 'Bun, patty, cheese, sweet onion.',
  },
  {
    id: 'fresh-bowl',
    name: 'Fresh Garden Bowl',
    needs: ['lettuce', 'tomato', 'onion'],
    coins: 9,
    ticket: '#8ecae6',
    blurb: 'Lettuce, tomato, onion. No bun, no grill.',
  },
  {
    id: 'double-trouble',
    name: 'Double Trouble',
    needs: ['bun', 'patty', 'patty', 'cheese', 'tomato'],
    coins: 17,
    ticket: '#e4572e',
    blurb: 'Two patties, cheese, tomato. The house dare.',
  },
];

// Stars at the end of the shift, by coins earned.
export const STARS = [
  { coins: 70, label: 'One star — the kitchen survived.' },
  { coins: 120, label: 'Two stars — the regulars are happy.' },
  { coins: 175, label: 'Three stars — Ember & Oak is the talk of the town!' },
];

// The kitchen floor plan. Every station is a rectangle the chef walks up to;
// `kind` decides what pressing E (or clicking) there does.
export const STATIONS = {
  // Ingredient bins along the top wall.
  binBun:     { kind: 'bin', gives: 'bun',     x: 40,  y: 118, w: 92, h: 64, label: 'BUNS' },
  binPatty:   { kind: 'bin', gives: 'patty',   x: 148, y: 118, w: 92, h: 64, label: 'PATTIES' },
  binCheese:  { kind: 'bin', gives: 'cheese',  x: 256, y: 118, w: 92, h: 64, label: 'CHEESE' },
  binTomato:  { kind: 'bin', gives: 'tomato',  x: 364, y: 118, w: 92, h: 64, label: 'TOMATO' },
  binLettuce: { kind: 'bin', gives: 'lettuce', x: 472, y: 118, w: 92, h: 64, label: 'LETTUCE' },
  binOnion:   { kind: 'bin', gives: 'onion',   x: 580, y: 118, w: 92, h: 64, label: 'ONION' },
  // The grill and the chopping board, centre-left, side by side so the chef can
  // always tell which one they are working.
  grill: { kind: 'grill', x: 40,  y: 300, w: 200, h: 96, label: 'GRILL' },
  board: { kind: 'board', x: 280, y: 300, w: 200, h: 96, label: 'CHOPPING BOARD' },
  // The assembly counter and the serving window, right side.
  assembly: { kind: 'assembly', x: 760, y: 300, w: 220, h: 110, label: 'ASSEMBLY' },
  serve:    { kind: 'serve',    x: 1010, y: 300, w: 230, h: 110, label: 'SERVING WINDOW' },
  // Plates and the trash, bottom wall.
  plates: { kind: 'plates', x: 760, y: 560, w: 110, h: 80, label: 'PLATES' },
  trash:  { kind: 'trash',  x: 1010, y: 560, w: 110, h: 80, label: 'TRASH' },
};

// Walls the chef cannot cross (the outer shell and the counter blocks).
export const WALLS = [
  { x: 0, y: 108, w: 1280, h: 10 }, // under the order board
  { x: 0, y: 0, w: 1280, h: 4 },
  { x: 0, y: 0, w: 4, h: 720 },
  { x: 1276, y: 0, w: 4, h: 720 },
  { x: 0, y: 716, w: 1280, h: 4 },
];

// The warm bistro palette, shared by every drawing routine.
export const PALETTE = {
  floor: '#c98f5f',
  floorDark: '#b57a4c',
  wall: '#f6ead6',
  counterTop: '#8a5a33',
  counterSide: '#6e4525',
  steel: '#c9ced6',
  steelDark: '#9aa1ab',
  board: '#e8c98f',
  ink: '#2e2118',
  cream: '#fff7e8',
  teal: '#2a9d8f',
  red: '#e4572e',
  gold: '#f7c948',
};
