// The screenshot scenes behind ?shot=cover|orders|rush|serve. Each one sets the real
// game state directly — a busy mid-shift kitchen, real tickets, a dish mid-assembly,
// a plate ready to serve — so every screenshot is a frame the game itself can reach,
// and the same seed always stages the same frame.
import { ORDER, RECIPES, SHIFT_SECONDS } from './config.js';
import { OrderTicket } from './orders.js';
import { SCREEN_END, SCREEN_PLAY, SCREEN_TITLE } from './game.js';

function ticketFor(game, recipeId, patienceLeftSeconds) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  const now = game.shiftTime;
  const ticket = new OrderTicket(recipe, ORDER.patienceSeconds, now - (ORDER.patienceSeconds - patienceLeftSeconds));
  game.board.tickets.push(ticket);
  return ticket;
}

/** The cover: the fullest frame — three tickets, a dish mid-assembly, grill and board busy. */
function stageCover(game) {
  game.startShift();
  game.shiftTime = 73; // 1:47 left on the clock
  game.coins = 46;
  game.served = 4;
  game.combo = 3;
  game.bestCombo = 3;
  ticketFor(game, 'ember-classic', 52);
  ticketFor(game, 'garden-stack', 34);
  ticketFor(game, 'oak-melt', 61);
  // A patty sizzling, one ready to come off; a tomato half-chopped.
  game.stations.grill[0].item = 'patty';
  game.stations.grill[0].progressSeconds = 2.5;
  game.stations.grill[1].item = 'patty';
  game.stations.grill[1].progressSeconds = 6.4;
  game.stations.board[0].item = 'tomato';
  game.stations.board[0].chops = 2;
  game.stations.board[1].item = 'lettuce';
  game.stations.board[1].chops = 1;
  // The dish mid-assembly: bun and patty already on the plate, cheese in hand.
  game.stations.assemblyPlate = ['bun', 'patty'];
  game.chef.x = 830;
  game.chef.y = 492;
  game.chef.facing = 1;
  game.chef.held = { kind: 'ingredient', id: 'cheese' };
  game.hint = 'Cheese on the plate, then serve the Ember Classic at the window!';
  game.message = null;
  game.addPopup(870, 300, '+$12', '#f7c948', true);
  game.screen = SCREEN_PLAY;
}

/** Orders: a fresh board filling up, the chef fetching a bun. */
function stageOrders(game) {
  game.startShift();
  game.shiftTime = 24; // 2:36 left
  game.coins = 12;
  game.served = 1;
  ticketFor(game, 'fresh-bowl', 66);
  ticketFor(game, 'ember-classic', 48);
  game.chef.x = 300;
  game.chef.y = 240;
  game.chef.facing = 1;
  game.chef.held = { kind: 'ingredient', id: 'bun' };
  game.stations.assemblyPlate = [];
  game.hint = 'Fresh Garden Bowl first — lettuce, tomato, onion. No grill needed.';
  game.message = null;
  game.screen = SCREEN_PLAY;
}

/** Rush: the last minute, four tickets, two nearly out of patience, combo burning. */
function stageRush(game) {
  game.startShift();
  game.shiftTime = SHIFT_SECONDS - 38; // 0:38 left, dinner rush
  game.coins = 128;
  game.served = 11;
  game.combo = 4;
  game.bestCombo = 4;
  game.rushAnnounced = true;
  ticketFor(game, 'double-trouble', 12);
  ticketFor(game, 'garden-stack', 9);
  ticketFor(game, 'oak-melt', 31);
  ticketFor(game, 'fresh-bowl', 44);
  game.stations.grill[0].item = 'patty';
  game.stations.grill[0].progressSeconds = 5.2;
  game.stations.grill[1].item = 'patty';
  game.stations.grill[1].progressSeconds = 1.1;
  game.stations.board[0].item = 'onion';
  game.stations.board[0].chops = 3;
  // A finished Double Trouble carried to the window.
  game.chef.x = 1060;
  game.chef.y = 500;
  game.chef.facing = 1;
  game.chef.held = { kind: 'plate', items: ['bun', 'patty', 'patty', 'cheese', 'tomato'] };
  game.stations.assemblyPlate = [];
  game.showMessage('DINNER RUSH! Orders come faster — keep the grill hot!', 30);
  game.hint = 'Serve the Double Trouble NOW — that ticket has 12 seconds left!';
  game.screen = SCREEN_PLAY;
}

/** Serve: the shift just ended on a three-star night. */
function stageServe(game) {
  game.startShift();
  game.shiftTime = SHIFT_SECONDS;
  game.coins = 186;
  game.served = 15;
  game.failed = 1;
  game.bestCombo = 5;
  game.stars = 3;
  game.starsLabel = 'Three stars — Ember & Oak is the talk of the town!';
  game.newBest = true;
  game.bestCoins = 186;
  game.hint = null;
  game.message = null;
  game.screen = SCREEN_END;
}

/**
 * Set the game to the named scene and return the screen to draw. Unknown names
 * stage the title screen.
 */
export function stageShot(name, game) {
  game.resetShift(20261125);
  if (name === 'cover') stageCover(game);
  else if (name === 'orders') stageOrders(game);
  else if (name === 'rush') stageRush(game);
  else if (name === 'serve') stageServe(game);
  else game.screen = SCREEN_TITLE;
  game.render();
}
