// Boot: wire the canvas, the input and the game together, run the loop, and honour
// ?shot=<name> for the staged screenshot scenes (see shots.js).
import { VIEW } from './config.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const game = new Game(canvas, new Input(canvas));
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') ?? 0);

if (shot) {
  // A staged scene: one deterministic frame, then stop. Screenshots take it from here.
  stageShot(shot, game);
  document.title = `Ember & Oak — shot ${shot}`;
} else {
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    game.update(dt);
    game.render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// Expose the game for the play harness and for debugging in the console.
window.__emberOak = game;
void seed;
