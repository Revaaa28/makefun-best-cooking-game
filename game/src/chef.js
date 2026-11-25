// The chef: a little cook with a toque who walks the kitchen, carries one thing at
// a time, and bumps into counters instead of walking through them.
import { CHEF, STATIONS, VIEW, WALLS } from './config.js';

function rectsOverlap(ax, ay, ar, bx, by, bw, bh) {
  return ax + ar > bx && ax - ar < bx + bw && ay + ar > by && ay - ar < by + bh;
}

export class Chef {
  constructor() {
    this.x = VIEW.width / 2;
    this.y = 560;
    this.facing = -1; // -1 left, 1 right; the toque turns with the chef
    this.moving = false;
    this.held = null; // null, or { kind: 'ingredient', id } / { kind: 'plate', items: [] }
    this.walkPhase = 0;
  }

  reset() {
    this.x = VIEW.width / 2;
    this.y = 560;
    this.facing = -1;
    this.moving = false;
    this.held = null;
    this.walkPhase = 0;
  }

  /** Is the chef close enough to work this station? */
  near(station) {
    const cx = Math.max(station.x, Math.min(this.x, station.x + station.w));
    const cy = Math.max(station.y, Math.min(this.y, station.y + station.h));
    return Math.hypot(this.x - cx, this.y - cy) <= CHEF.interactRange;
  }

  /** The nearest station in reach, or null when the chef stands in open floor. */
  nearestStation() {
    let best = null;
    let bestDistance = Infinity;
    for (const station of Object.values(STATIONS)) {
      const cx = Math.max(station.x, Math.min(this.x, station.x + station.w));
      const cy = Math.max(station.y, Math.min(this.y, station.y + station.h));
      const d = Math.hypot(this.x - cx, this.y - cy);
      if (d < bestDistance) {
        bestDistance = d;
        best = station;
      }
    }
    return bestDistance <= CHEF.interactRange ? best : null;
  }

  /** Move toward a direction for `dt` seconds, sliding along walls and counters. */
  move(dx, dy, dt) {
    if (dx === 0 && dy === 0) {
      this.moving = false;
      return;
    }
    this.moving = true;
    if (dx !== 0) this.facing = dx > 0 ? 1 : -1;
    this.walkPhase += dt * 11;
    const stepX = dx * CHEF.speed * dt;
    const stepY = dy * CHEF.speed * dt;
    if (!this.hitsAnything(this.x + stepX, this.y)) this.x += stepX;
    if (!this.hitsAnything(this.x, this.y + stepY)) this.y += stepY;
    this.x = Math.max(CHEF.radius, Math.min(VIEW.width - CHEF.radius, this.x));
    this.y = Math.max(118 + CHEF.radius, Math.min(VIEW.height - CHEF.radius, this.y));
  }

  hitsAnything(x, y) {
    for (const wall of WALLS) {
      if (rectsOverlap(x, y, CHEF.radius - 2, wall.x, wall.y, wall.w, wall.h)) return true;
    }
    for (const station of Object.values(STATIONS)) {
      if (rectsOverlap(x, y, CHEF.radius - 4, station.x, station.y, station.w, station.h)) return true;
    }
    return false;
  }

  /** A human-readable name for what the chef carries, for the HUD and the hints. */
  heldLabel() {
    if (!this.held) return 'empty hands';
    if (this.held.kind === 'plate') {
      return this.held.items.length === 0 ? 'empty plate' : `plate (${this.held.items.length})`;
    }
    return this.held.id;
  }
}
