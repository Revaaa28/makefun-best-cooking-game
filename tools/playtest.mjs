// Play harness: serve game/, open it in headless Chromium, check for console errors,
// take the staged screenshots from shots.json, and play-test a scripted shift by
// driving the real game object (window.__emberOak) through its real update loop.
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const shots = JSON.parse(readFileSync(join(root, 'shots.json'), 'utf8'));
const mode = process.argv[2] ?? 'shots';
const chromePath = process.env.CHROME_PATH ?? `${process.env.HOME}/.cache/ms-playwright/chromium-1254/chrome-linux64/chrome`;

const server = spawn('node', ['serve.ts', '--port', '8123'], { cwd: root, stdio: 'pipe' });
await new Promise((resolve) => setTimeout(resolve, 1200));

const browser = await chromium.launch({ executablePath: chromePath, args: ['--no-sandbox'] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`console: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));

  if (mode === 'shots') {
    for (const shot of shots) {
      await page.goto(`http://127.0.0.1:8123/index.html${shot.query}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: join(root, 'screenshots', shot.name), type: 'jpeg', quality: 82 });
      console.log('shot', shot.name);
    }
  } else if (mode === 'sim') {
    await page.goto('http://127.0.0.1:8123/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    // Fast-forward a whole shift through the real update loop (no input): orders
    // spawn, patience runs out, the rush hits, the shift ends. Nothing may throw
    // and the end screen must appear with sane totals.
    const result = await page.evaluate(() => {
      const game = window.__emberOak;
      const log = [];
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
      game.update(0.05);
      // 190 seconds of game time in 0.1s steps.
      for (let i = 0; i < 1900; i += 1) game.update(0.1);
      log.push(`screen=${game.screen}`);
      log.push(`shiftTime=${game.shiftTime.toFixed(1)} timeLeft=${game.timeLeftSeconds}`);
      log.push(`served=${game.served} failed=${game.failed} coins=${game.coins}`);
      log.push(`stars=${game.stars} label=${game.starsLabel}`);
      log.push(`ticketsOpen=${game.board.openTickets().length} spawned=${game.board.spawnedCount}`);
      log.push(`rushAnnounced=${game.rushAnnounced}`);
      return log;
    });
    console.log(result.join('\n'));
  } else if (mode === 'playtest') {
    await page.goto('http://127.0.0.1:8123/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    // Drive the real game through its real update loop: start the shift, walk the
    // chef to each station with the keyboard, cook the first open ticket's dish
    // from raw ingredients, plate it and serve it — exactly as a player would.
    const result = await page.evaluate(async () => {
      const game = window.__emberOak;
      const log = [];
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const key = (code) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code }));
        window.dispatchEvent(new KeyboardEvent('keyup', { code }));
      };
      const go = async (x, y) => {
        game.chef.x = x; game.chef.y = y;
        await sleep(80);
      };
      const work = async () => { key('KeyE'); await sleep(80); };
      const BIN_X = { bun: 86, patty: 194, cheese: 302, tomato: 410, lettuce: 518, onion: 626 };
      const chop = async (id) => {
        await go(BIN_X[id], 240); await work(); // grab raw veg
        await go(380, 440); await work(); // place on board
        await work(); await work(); await work(); // three chops
        await work(); // take chopped veg
        log.push(`chopped ${id}: held=${game.chef.heldLabel()}`);
        await go(870, 460); await work(); // plate it
      };
      const grillPatty = async () => {
        await go(BIN_X.patty, 240); await work(); // raw patty
        await go(140, 440); await work(); // onto the grill
        await sleep(6800); // cooks in 6s
        await work(); // take cooked patty
        log.push(`grilled patty: held=${game.chef.heldLabel()}`);
        await go(870, 460); await work(); // plate it
      };
      // 1. Start the shift, then check keyboard movement really moves the chef.
      key('Enter');
      await sleep(100);
      log.push(`screen=${game.screen}`);
      const x0 = game.chef.x;
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
      await sleep(500);
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
      log.push(`keyboard move: x ${Math.round(x0)} -> ${Math.round(game.chef.x)}`);
      // 2. Wait for the first ticket.
      await sleep(3200);
      const ticket = game.board.openTickets()[0];
      log.push(`first ticket: ${ticket ? ticket.recipe.name : 'NONE'} needs=${ticket ? ticket.recipe.needs.join('+') : ''}`);
      if (!ticket) return log;
      // 3. Cook every ingredient of the ticket, in order.
      for (const need of ticket.recipe.needs) {
        if (need === 'patty') await grillPatty();
        else if (need === 'tomato' || need === 'lettuce' || need === 'onion') await chop(need);
        else {
          await go(BIN_X[need], 240); await work();
          await go(870, 460); await work();
          log.push(`plated ${need}`);
        }
      }
      log.push(`plate=${JSON.stringify(game.stations.assemblyPlate)}`);
      // 4. Pick the plate up and serve it.
      await work(); // pick plate up at assembly (empty hands)
      log.push(`held=${game.chef.heldLabel()}`);
      await go(1125, 460); await work(); // serve at the window
      log.push(`served=${game.served} coins=${game.coins} combo=${game.combo} failed=${game.failed}`);
      return log;
    });
    console.log(result.join('\n'));
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(errors.length === 0 ? 'NO PAGE ERRORS' : `ERRORS:\n${errors.join('\n')}`);
