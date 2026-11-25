// The order board: which dishes the tables want, how long each table will wait,
// and what a served dish pays. Orders are the game's clock and its score.
import { ORDER, RECIPES } from './config.js';
import { pick, shuffle } from './random.js';

let nextOrderId = 1;

/** One ticket on the board. */
export class OrderTicket {
  constructor(recipe, patienceSeconds, nowSeconds) {
    this.id = nextOrderId;
    nextOrderId += 1;
    this.recipe = recipe;
    this.bornAt = nowSeconds;
    this.expiresAt = nowSeconds + patienceSeconds;
    this.served = false;
    this.expired = false;
  }

  /** Fraction of patience left, 1 when fresh, 0 when the table walks out. */
  patienceFraction(nowSeconds) {
    return Math.max(0, (this.expiresAt - nowSeconds) / (this.expiresAt - this.bornAt));
  }

  /** Coins for serving right now: base pay plus a speed tip of up to half again. */
  payout(nowSeconds) {
    const tip = Math.round((this.recipe.coins * this.patienceFraction(nowSeconds)) / 2);
    return this.recipe.coins + tip;
  }
}

/** The board itself: spawns tickets on a schedule and retires them when served or stale. */
export class OrderBoard {
  constructor(random) {
    this.random = random;
    this.tickets = [];
    this.nextSpawnAt = ORDER.firstAtSeconds;
    this.spawnedCount = 0;
    this.unlockedRecipes = 3; // the first three dishes; the rest join as the shift heats up
  }

  get rushing() {
    return this.tickets.length >= 3;
  }

  spawnIntervalSeconds(rushHour) {
    return rushHour ? ORDER.spawnEveryRushSeconds : ORDER.spawnEverySeconds;
  }

  /** Recipes the kitchen may be asked for right now. */
  availableRecipes() {
    return RECIPES.slice(0, this.unlockedRecipes);
  }

  /** Advance spawning and expiry. Returns the tickets that just walked out. */
  update(nowSeconds, rushHour, onNewOrder) {
    // New dishes join the menu as the shift goes on.
    if (nowSeconds >= 60 && this.unlockedRecipes < 4) this.unlockedRecipes = 4;
    if (nowSeconds >= 110 && this.unlockedRecipes < 5) this.unlockedRecipes = 5;

    if (this.tickets.length < ORDER.maxOnBoard && nowSeconds >= this.nextSpawnAt) {
      const recipe = pick(this.random, this.availableRecipes());
      const patience = rushHour ? ORDER.patienceRushSeconds : ORDER.patienceSeconds;
      const ticket = new OrderTicket(recipe, patience, nowSeconds);
      this.tickets.push(ticket);
      this.spawnedCount += 1;
      this.nextSpawnAt = nowSeconds + this.spawnIntervalSeconds(rushHour);
      if (onNewOrder) onNewOrder(ticket);
    }

    const expired = [];
    for (const ticket of this.tickets) {
      if (!ticket.served && !ticket.expired && nowSeconds >= ticket.expiresAt) {
        ticket.expired = true;
        expired.push(ticket);
      }
    }
    this.tickets = this.tickets.filter((t) => !t.served && !t.expired);
    return expired;
  }

  /** The open tickets, oldest first, for the render and the serve check. */
  openTickets() {
    return this.tickets.slice().sort((a, b) => a.expiresAt - b.expiresAt);
  }

  /** Find an open ticket whose dish matches the plated stack exactly, if any. */
  findMatchFor(plateItems) {
    const sorted = plateItems.slice().sort().join(',');
    return this.openTickets().find((t) => t.recipe.needs.slice().sort().join(',') === sorted) ?? null;
  }
}

/** The shuffled deck a screenshot scene draws its tickets from, so shots are stable. */
export function sampleRecipes(random, count) {
  return shuffle(random, RECIPES).slice(0, count);
}
