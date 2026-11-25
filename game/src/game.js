// The game itself: screens, the shift clock, scoring, combos, popups and particles,
// and the one update step the loop calls. It owns no drawing and no station rules —
// it asks the chef, the stations and the order board, then hands a view to the renderer.
import { CHEF, ORDER, SHIFT_SECONDS, STATIONS } from './config.js';
import { Chef } from './chef.js';
import { OrderBoard } from './orders.js';
import { Stations } from './stations.js';
import { SoundBank } from './audio.js';
import { drawFrame } from './render.js';
import { mulberry32 } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_END = 'end';

const BEST_KEY = 'ember-oak-best-coins';

export class Game {
  constructor(canvas, input) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = input;
    this.sounds = new SoundBank();
    this.chef = new Chef();
    this.stations = new Stations();
    this.board = new OrderBoard(mulberry32((Date.now() % 2147483647) || 7));
    this.screen = SCREEN_TITLE;
    this.now = 0; // seconds since the page loaded (drives animations)
    this.shiftTime = 0; // seconds since the shift started
    this.coins = 0;
    this.served = 0;
    this.failed = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.stars = 0;
    this.starsLabel = '';
    this.newBest = false;
    this.bestCoins = 0;
    try {
      this.bestCoins = Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
    } catch {
      this.bestCoins = 0;
    }
    this.popups = [];
    this.particles = [];
    this.message = null;
    this.messageUntil = 0;
    this.hint = null;
    this.rushAnnounced = false;
    this.lastTickSecond = -1;
    this.startPulse = true;
    this.onFirstInteraction = null;
  }

  get timeLeftSeconds() {
    return Math.max(0, SHIFT_SECONDS - this.shiftTime);
  }

  get rushHour() {
    return this.timeLeftSeconds <= 45 && this.screen === SCREEN_PLAY;
  }

  resetShift(seed) {
    this.chef.reset();
    this.stations.reset();
    this.board = new OrderBoard(mulberry32(seed ?? ((Date.now() % 2147483647) || 7)));
    this.shiftTime = 0;
    this.coins = 0;
    this.served = 0;
    this.failed = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.stars = 0;
    this.starsLabel = '';
    this.newBest = false;
    this.popups = [];
    this.particles = [];
    this.message = null;
    this.rushAnnounced = false;
    this.lastTickSecond = -1;
  }

  startShift() {
    this.resetShift();
    this.screen = SCREEN_PLAY;
    this.sounds.unlock();
    this.showMessage('Shift started! First order coming in…');
    this.hint = 'Grab a bun, a patty and cheese — the Ember Classic is the house favourite.';
  }

  endShift() {
    this.screen = SCREEN_END;
    this.sounds.stopSizzle();
    this.combo = 0;
    this.hint = null;
    const stars = [175, 120, 70].filter((bar) => this.coins >= bar).length;
    this.stars = stars;
    this.starsLabel = [
      'A quiet night — the kitchen kept its cool.',
      'One star — the kitchen survived.',
      'Two stars — the regulars are happy.',
      'Three stars — Ember & Oak is the talk of the town!',
    ][stars];
    if (this.coins > this.bestCoins) {
      this.bestCoins = this.coins;
      this.newBest = true;
      try { window.localStorage.setItem(BEST_KEY, String(this.coins)); } catch { /* private mode */ }
    }
    this.sounds.fanfare();
  }

  showMessage(message, seconds = 2.6) {
    this.message = message;
    this.messageUntil = this.now + seconds;
  }

  addPopup(x, y, message, color = '#fff7e8', big = false) {
    this.popups.push({ x, y, message, color, big, ageSeconds: 0, lifeSeconds: 1.4 });
  }

  burst(x, y, color, count = 12) {
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        ageSeconds: 0,
        lifeSeconds: 0.6 + Math.random() * 0.5,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  /** Serve the plate the chef carries; the board decides whether a table wants it. */
  servePlate() {
    const items = this.chef.held.items;
    const ticket = this.board.findMatchFor(items);
    if (!ticket) {
      this.sounds.error();
      this.showMessage('No table ordered that dish — check the tickets!');
      this.combo = 0;
      return;
    }
    const base = ticket.payout(this.shiftTime);
    const paid = base * (this.combo >= 2 ? 2 : 1);
    this.coins += paid;
    this.served += 1;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    ticket.served = true;
    this.chef.held = null;
    this.sounds.serve();
    const wx = STATIONS.serve.x + STATIONS.serve.w / 2;
    const wy = STATIONS.serve.y;
    this.addPopup(wx, wy - 10, `+$${paid}`, '#f7c948', true);
    if (this.combo >= 2) this.addPopup(wx, wy - 42, `COMBO x${this.combo}!`, '#e4572e');
    this.burst(wx, wy + 20, '#f7c948', 16);
    this.board.tickets = this.board.tickets.filter((t) => !t.served);
    this.hint = this.combo >= 2
      ? `Combo x${this.combo} — keep serving without a miss and every dish pays double!`
      : 'Served! Watch the board for the next ticket.';
  }

  handleStationEvent(event, station) {
    const cx = station.x + station.w / 2;
    const cy = station.y;
    switch (event.type) {
      case 'pickup':
        this.sounds.pickup();
        break;
      case 'place':
        this.sounds.place();
        break;
      case 'plate-add':
        this.sounds.place();
        this.burst(cx, cy + 40, '#f7c948', 6);
        break;
      case 'grill-on':
        this.sounds.grillOn();
        this.showMessage('Patty on the grill — grab it when it dings!');
        break;
      case 'chop':
        this.sounds.chop();
        this.burst(cx, cy + 40, '#7bc950', 5);
        break;
      case 'chopped':
        this.sounds.ding();
        this.showMessage('Chopped! Ready for the plate.');
        break;
      case 'trash':
        this.sounds.trash();
        break;
      case 'serve-attempt':
        this.servePlate();
        break;
      case 'error':
        this.sounds.error();
        this.showMessage(event.message);
        break;
      default:
        break;
    }
  }

  /** One frame: read input, move the chef, run the stations and the board. */
  update(dt) {
    this.now += dt;
    this.startPulse = Math.floor(this.now * 2) % 2 === 0;
    for (const popup of this.popups) popup.ageSeconds += dt;
    this.popups = this.popups.filter((p) => p.ageSeconds < p.lifeSeconds);
    for (const p of this.particles) {
      p.ageSeconds += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 160 * dt;
    }
    this.particles = this.particles.filter((p) => p.ageSeconds < p.lifeSeconds);
    if (this.message && this.now >= this.messageUntil) this.message = null;

    if (this.screen === SCREEN_TITLE) {
      if (this.input.wasPressed('Enter', 'Space') || this.clickedStartButton()) {
        this.startShift();
      }
      this.input.endFrame();
      return;
    }
    if (this.screen === SCREEN_END) {
      if (this.input.wasPressed('KeyR', 'Enter', 'Space') || this.clickedStartButton()) {
        this.startShift();
      }
      this.input.endFrame();
      return;
    }
    if (this.input.wasPressed('KeyM')) {
      this.sounds.toggleMute();
    }
    if (this.input.wasPressed('KeyP', 'Escape')) {
      this.screen = this.screen === SCREEN_PAUSED ? SCREEN_PLAY : SCREEN_PAUSED;
      this.sounds.stopSizzle();
    }
    if (this.screen === SCREEN_PAUSED) {
      this.input.endFrame();
      return;
    }

    // The shift clock.
    this.shiftTime += dt;
    const wholeSecond = Math.floor(this.timeLeftSeconds);
    if (wholeSecond <= 10 && wholeSecond !== this.lastTickSecond) {
      this.lastTickSecond = wholeSecond;
      this.sounds.tick();
    }
    if (this.rushHour && !this.rushAnnounced) {
      this.rushAnnounced = true;
      this.sounds.rush();
      this.showMessage('DINNER RUSH! Orders come faster — keep the grill hot!', 3.2);
    }

    // Orders arrive and expire.
    const expired = this.board.update(this.shiftTime, this.rushHour, (ticket) => {
      this.showMessage(`New order: ${ticket.recipe.name}!`, 2.2);
      this.sounds.ding();
    });
    if (expired.length > 0) {
      this.failed += expired.length;
      this.combo = 0;
      this.sounds.error();
      this.showMessage(`A table walked out — ${expired[0].recipe.name} was too slow!`, 3);
    }

    // The grill sizzles while a patty cooks.
    const cooking = this.stations.update(dt);
    this.sounds.updateSizzle(cooking);

    // Movement: keys win over a click target; reaching the target clears it.
    const keys = this.input.moveVector();
    if (keys.x !== 0 || keys.y !== 0) {
      this.input.moveTarget = null;
      this.chef.move(keys.x, keys.y, dt);
    } else if (this.input.moveTarget) {
      const dx = this.input.moveTarget.x - this.chef.x;
      const dy = this.input.moveTarget.y - this.chef.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 8) {
        this.input.moveTarget = null;
        this.chef.moving = false;
      } else {
        this.chef.move(dx / dist, dy / dist, dt);
      }
    } else {
      this.chef.moving = false;
    }

    // Work: E, Space, or clicking a station in reach.
    let station = null;
    if (this.input.wasPressed('KeyE', 'Space')) {
      station = this.chef.nearestStation();
    } else if (this.input.clickedStation) {
      const clicked = this.input.clickedStation;
      station = Object.values(STATIONS).find((s) =>
        clicked.x >= s.x - 6 && clicked.x <= s.x + s.w + 6 &&
        clicked.y >= s.y - 6 && clicked.y <= s.y + s.h + 6) ?? null;
      if (station && !this.chef.near(station)) {
        // Too far: walk there instead; a second click works it.
        this.input.moveTarget = { x: station.x + station.w / 2, y: station.y + station.h + 30 };
        station = null;
      }
    }
    if (station) {
      this.sounds.unlock();
      const event = this.stations.interact(station, this.chef);
      this.handleStationEvent(event, station);
    }

    if (this.timeLeftSeconds <= 0) this.endShift();
    this.input.endFrame();
  }

  clickedStartButton() {
    const click = this.input.clickedStation;
    if (!click) return false;
    const cx = 640;
    const cy = this.screen === SCREEN_TITLE ? 486 : 446;
    return Math.abs(click.x - cx) <= 130 && Math.abs(click.y - cy) <= 26;
  }

  /** The whole frame's view, for the renderer. */
  buildView() {
    return {
      screen: this.screen,
      now: this.now,
      nowSeconds: this.shiftTime,
      chef: this.chef,
      stations: this.stations,
      board: this.board,
      coins: this.coins,
      combo: this.combo,
      served: this.served,
      failed: this.failed,
      timeLeftSeconds: this.timeLeftSeconds,
      rushHour: this.rushHour,
      muted: this.sounds.muted,
      popups: this.popups,
      particles: this.particles,
      message: this.message,
      hint: this.hint,
      nearestStation: this.screen === SCREEN_PLAY ? this.chef.nearestStation() : null,
      heldPlateItems: this.chef.held?.kind === 'plate' ? this.chef.held.items : null,
      stars: this.stars,
      starsLabel: this.starsLabel,
      bestCombo: this.bestCombo,
      bestCoins: this.bestCoins,
      newBest: this.newBest,
      startPulse: this.startPulse,
    };
  }

  render() {
    drawFrame(this.ctx, this.buildView());
  }
}
