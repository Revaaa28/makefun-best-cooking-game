// The stations' working state: patties on the grill, vegetables on the board, the
// plate on the assembly counter. One file owns every rule of "what happens when the
// chef presses E here", so the game loop never touches a station directly.
import { BOARD, GRILL, INGREDIENTS } from './config.js';

/** A slot on the grill or the board: what sits there and how far along it is. */
export class WorkSlot {
  constructor() {
    this.item = null; // ingredient id, or null when the slot is empty
    this.progressSeconds = 0;
    this.chops = 0;
  }

  get empty() {
    return this.item === null;
  }

  clear() {
    this.item = null;
    this.progressSeconds = 0;
    this.chops = 0;
  }
}

export class Stations {
  constructor() {
    this.grill = [new WorkSlot(), new WorkSlot()];
    this.board = [new WorkSlot(), new WorkSlot()];
    this.assemblyPlate = null; // items on the plate waiting at the assembly counter
    this.plateTimer = 0; // a fresh empty plate slides in shortly after one is taken
  }

  reset() {
    this.grill = [new WorkSlot(), new WorkSlot()];
    this.board = [new WorkSlot(), new WorkSlot()];
    this.assemblyPlate = [];
    this.plateTimer = 0;
  }

  /** Advance grill timers and the plate restock; returns true while anything cooks. */
  update(dt) {
    let cooking = false;
    for (const slot of this.grill) {
      if (slot.item === 'patty') {
        slot.progressSeconds += dt;
        cooking = true;
      }
    }
    if (this.assemblyPlate === null) {
      this.plateTimer += dt;
      if (this.plateTimer >= 1) {
        this.assemblyPlate = [];
        this.plateTimer = 0;
      }
    }
    return cooking;
  }

  grillState(slot) {
    if (slot.item !== 'patty') return 'empty';
    if (slot.progressSeconds >= GRILL.burnSeconds) return 'burnt';
    if (slot.progressSeconds >= GRILL.cookSeconds) return 'cooked';
    return 'cooking';
  }

  boardState(slot) {
    if (slot.item === null) return 'empty';
    return slot.chops >= BOARD.chopsNeeded ? 'chopped' : 'chopping';
  }

  /** The grill slot the chef would work, preferring one that is ready to come off. */
  grillSlotFor(chef) {
    const ready = this.grill.find((s) => this.grillState(s) === 'cooked' || this.grillState(s) === 'burnt');
    if (ready) return ready;
    return this.grill.find((s) => s.empty) ?? null;
  }

  /**
   * Work a station with what the chef holds. Returns an event the game turns into
   * a sound, a popup or a score change: { type, ... }.
   */
  interact(station, chef) {
    switch (station.kind) {
      case 'bin': return this.takeFromBin(station, chef);
      case 'grill': return this.workGrill(chef);
      case 'board': return this.workBoard(chef);
      case 'assembly': return this.workAssembly(chef);
      case 'plates': return this.takePlate(chef);
      case 'serve': return this.serve(chef);
      case 'trash': return this.useTrash(chef);
      default: return { type: 'noop' };
    }
  }

  takeFromBin(station, chef) {
    if (chef.held) return { type: 'error', message: 'Hands full!' };
    chef.held = { kind: 'ingredient', id: station.gives };
    return { type: 'pickup', message: INGREDIENTS[station.gives].name };
  }

  workGrill(chef) {
    const slot = this.grillSlotFor(chef);
    if (!slot) return { type: 'error', message: 'Grill is full!' };
    const state = this.grillState(slot);
    if (state === 'cooked') {
      if (chef.held) return { type: 'error', message: 'Hands full!' };
      chef.held = { kind: 'ingredient', id: 'patty-cooked' };
      slot.clear();
      return { type: 'pickup', message: 'Cooked patty!' };
    }
    if (state === 'burnt') {
      if (chef.held) return { type: 'error', message: 'Hands full!' };
      chef.held = { kind: 'ingredient', id: 'patty-burnt' };
      slot.clear();
      return { type: 'pickup', message: 'Burnt patty — bin it!' };
    }
    if (state === 'cooking') return { type: 'error', message: 'Still sizzling…' };
    // Empty slot: only a raw patty belongs on the grill.
    if (!chef.held || chef.held.kind !== 'ingredient' || chef.held.id !== 'patty') {
      return { type: 'error', message: 'The grill wants a raw patty.' };
    }
    slot.item = 'patty';
    slot.progressSeconds = 0;
    chef.held = null;
    return { type: 'grill-on' };
  }

  /** The board: place a vegetable with full hands, chop it with empty ones. */
  workBoard(chef) {
    const held = chef.held;
    const holdingVeg = held?.kind === 'ingredient' && INGREDIENTS[held.id]?.prep === 'chop';
    if (holdingVeg) {
      const empty = this.board.find((s) => s.empty);
      if (!empty) return { type: 'error', message: 'Board is full!' };
      empty.item = held.id;
      empty.chops = 0;
      chef.held = null;
      return { type: 'place', message: 'On the board!' };
    }
    const chopped = this.board.find((s) => this.boardState(s) === 'chopped');
    if (chopped) {
      if (held) return { type: 'error', message: 'Hands full!' };
      chef.held = { kind: 'ingredient', id: `${chopped.item}-chopped` };
      const name = INGREDIENTS[chopped.item].name;
      chopped.clear();
      return { type: 'pickup', message: `Chopped ${name}!` };
    }
    const chopping = this.board.filter((s) => !s.empty).sort((a, b) => b.chops - a.chops)[0];
    if (chopping) {
      chopping.chops += 1;
      if (chopping.chops >= BOARD.chopsNeeded) return { type: 'chopped', message: 'Chopped!' };
      return { type: 'chop', message: `Chop… ${chopping.chops}/${BOARD.chopsNeeded}` };
    }
    return { type: 'error', message: 'The board wants a vegetable.' };
  }

  workAssembly(chef) {
    if (this.assemblyPlate === null) return { type: 'error', message: 'No plate here yet…' };
    if (chef.held?.kind === 'plate') {
      // Put a carried plate back down, if the counter is clear.
      if (this.assemblyPlate.length > 0) return { type: 'error', message: 'Counter plate is busy.' };
      this.assemblyPlate = chef.held.items;
      chef.held = null;
      return { type: 'place', message: 'Plate down.' };
    }
    if (chef.held?.kind === 'ingredient') {
      const id = chef.held.id;
      if (id === 'patty-burnt') return { type: 'error', message: 'Burnt! Trash it, not the plate.' };
      if (id === 'patty' || INGREDIENTS[id]?.prep === 'chop' || INGREDIENTS[id]?.prep === 'grill') {
        return { type: 'error', message: 'Cook or chop it first!' };
      }
      if (this.assemblyPlate.length >= 5) return { type: 'error', message: 'Plate is full!' };
      // A cooked patty plates as a patty, a chopped vegetable as itself.
      const platedId = id === 'patty-cooked' ? 'patty' : id.replace(/-chopped$/, '');
      this.assemblyPlate.push(platedId);
      chef.held = null;
      return { type: 'plate-add', message: 'Plated!' };
    }
    // Empty hands: pick the plate up.
    const items = this.assemblyPlate;
    this.assemblyPlate = null;
    this.plateTimer = 0;
    chef.held = { kind: 'plate', items };
    return { type: 'pickup', message: items.length === 0 ? 'Empty plate.' : 'Plate up!' };
  }

  takePlate(chef) {
    if (chef.held) return { type: 'error', message: 'Hands full!' };
    chef.held = { kind: 'plate', items: [] };
    return { type: 'pickup', message: 'Empty plate.' };
  }

  serve(chef) {
    if (chef.held?.kind !== 'plate') return { type: 'error', message: 'Bring a plated dish!' };
    if (chef.held.items.length === 0) return { type: 'error', message: 'That plate is empty!' };
    return { type: 'serve-attempt', items: chef.held.items.slice() };
  }

  useTrash(chef) {
    if (!chef.held) return { type: 'error', message: 'Nothing to throw away.' };
    chef.held = null;
    return { type: 'trash', message: 'Tossed.' };
  }
}
