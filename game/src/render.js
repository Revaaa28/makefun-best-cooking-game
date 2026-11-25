// Everything the player sees, drawn on one canvas with plain shapes: the bistro floor,
// the counters and their food, the chef, the order board and the shift clock. No image
// files anywhere — every tomato, bun and flame is drawn here, so the game ships offline.
import { INGREDIENTS, PALETTE, RECIPES, STATIONS, VIEW } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'center') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** One ingredient drawn as a little piece of food art, centred at (x, y). */
export function drawIngredient(ctx, id, x, y, s) {
  const u = s / 40; // unit: art is authored on a 40px box
  ctx.save();
  ctx.translate(x, y);
  switch (id) {
    case 'bun': {
      ellipse(ctx, 0, 6 * u, 17 * u, 7 * u, '#d98f35');
      ctx.fillStyle = '#f2c078';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18 * u, 11 * u, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      for (const [sx, sy] of [[-9, -5], [0, -8], [9, -5], [-4, -3], [5, -2]]) {
        ellipse(ctx, sx * u, sy * u, 1.6 * u, 1.1 * u, '#fff3d6');
      }
      break;
    }
    case 'patty': {
      ellipse(ctx, 0, 0, 18 * u, 8 * u, '#6b4423');
      ellipse(ctx, 0, -2 * u, 16 * u, 6 * u, '#8a5a33');
      ctx.fillStyle = '#5d3a1e';
      for (const [sx, sy] of [[-8, -2], [3, 1], [9, -3], [-2, 3]]) ellipse(ctx, sx * u, sy * u, 2 * u, 1.4 * u, '#5d3a1e');
      break;
    }
    case 'patty-cooked': {
      ellipse(ctx, 0, 0, 18 * u, 8 * u, '#5d3a1e');
      ellipse(ctx, 0, -2 * u, 16 * u, 6 * u, '#7d4f2a');
      ctx.strokeStyle = '#3d2712';
      ctx.lineWidth = 1.6 * u;
      ctx.beginPath();
      for (const sx of [-10, -3, 4, 11]) {
        ctx.moveTo(sx * u, -6 * u);
        ctx.lineTo((sx + 3) * u, 4 * u);
      }
      ctx.stroke();
      break;
    }
    case 'patty-burnt': {
      ellipse(ctx, 0, 0, 18 * u, 8 * u, '#1c1210');
      ctx.fillStyle = '#3a3a3a';
      for (const [sx, sy] of [[-8, -2], [2, 2], [9, -3]]) ellipse(ctx, sx * u, sy * u, 2.4 * u, 1.6 * u, '#3a3a3a');
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#f7c948';
      ctx.beginPath();
      ctx.moveTo(-17 * u, -6 * u);
      ctx.lineTo(17 * u, -6 * u);
      ctx.lineTo(12 * u, 8 * u);
      ctx.lineTo(-12 * u, 8 * u);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f7c948';
      ctx.beginPath();
      ctx.moveTo(-8 * u, 8 * u);
      ctx.quadraticCurveTo(-6 * u, 14 * u, -3 * u, 8 * u);
      ctx.moveTo(4 * u, 8 * u);
      ctx.quadraticCurveTo(7 * u, 13 * u, 10 * u, 8 * u);
      ctx.fill();
      ctx.fillStyle = '#d99e06';
      ellipse(ctx, -6 * u, -1 * u, 1.8 * u, 1.8 * u, '#d99e06');
      ellipse(ctx, 7 * u, -2 * u, 1.8 * u, 1.8 * u, '#d99e06');
      break;
    }
    case 'tomato':
    case 'tomato-chopped': {
      ellipse(ctx, 0, 1 * u, 15 * u, 12 * u, '#e4572e');
      ellipse(ctx, 0, -2 * u, 12 * u, 9 * u, '#ef6b42');
      ctx.fillStyle = '#4e9b2e';
      ctx.beginPath();
      ctx.moveTo(0, -9 * u);
      ctx.lineTo(-5 * u, -14 * u);
      ctx.lineTo(0, -11 * u);
      ctx.lineTo(5 * u, -14 * u);
      ctx.lineTo(0, -9 * u);
      ctx.fill();
      if (id === 'tomato-chopped') {
        ctx.strokeStyle = '#b23a1d';
        ctx.lineWidth = 1.4 * u;
        ctx.beginPath();
        ctx.moveTo(-9 * u, -4 * u);
        ctx.lineTo(9 * u, 2 * u);
        ctx.moveTo(-9 * u, 4 * u);
        ctx.lineTo(8 * u, -5 * u);
        ctx.stroke();
      }
      break;
    }
    case 'lettuce':
    case 'lettuce-chopped': {
      ctx.fillStyle = '#7bc950';
      ctx.beginPath();
      ctx.moveTo(-17 * u, 2 * u);
      for (let i = 0; i <= 6; i += 1) {
        const px = (-17 + i * 5.7) * u;
        ctx.quadraticCurveTo((px + 2.8) * u, (i % 2 === 0 ? -9 : 7) * u, (px + 5.7) * u, 2 * u);
      }
      ctx.lineTo(17 * u, 9 * u);
      ctx.lineTo(-17 * u, 9 * u);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#4e9b2e';
      ctx.lineWidth = 1.4 * u;
      ctx.beginPath();
      ctx.moveTo(-12 * u, 2 * u);
      ctx.quadraticCurveTo(0, -5 * u, 12 * u, 2 * u);
      ctx.stroke();
      break;
    }
    case 'onion':
    case 'onion-chopped': {
      ellipse(ctx, 0, 1 * u, 13 * u, 12 * u, '#f3eefb');
      ctx.strokeStyle = '#b9a8cc';
      ctx.lineWidth = 1.6 * u;
      ctx.beginPath();
      ctx.arc(0, 2 * u, 8 * u, Math.PI * 1.1, Math.PI * 1.9);
      ctx.arc(0, 2 * u, 4 * u, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.fillStyle = '#7bc950';
      ctx.beginPath();
      ctx.moveTo(0, -10 * u);
      ctx.quadraticCurveTo(-3 * u, -17 * u, -6 * u, -15 * u);
      ctx.quadraticCurveTo(-2 * u, -11 * u, 0, -10 * u);
      ctx.moveTo(0, -10 * u);
      ctx.quadraticCurveTo(3 * u, -17 * u, 6 * u, -15 * u);
      ctx.quadraticCurveTo(2 * u, -11 * u, 0, -10 * u);
      ctx.fill();
      if (id === 'onion-chopped') {
        ctx.strokeStyle = '#b9a8cc';
        ctx.beginPath();
        ctx.moveTo(-8 * u, -3 * u);
        ctx.lineTo(8 * u, 4 * u);
        ctx.stroke();
      }
      break;
    }
    default: {
      ellipse(ctx, 0, 0, 14 * u, 10 * u, '#999');
    }
  }
  ctx.restore();
}

/** A white plate with a stack of plated ingredients, drawn as a little burger tower. */
export function drawPlate(ctx, x, y, items, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ellipse(ctx, 0, 0, 30, 9, '#e8e2d6');
  ellipse(ctx, 0, -2, 27, 8, '#ffffff');
  ellipse(ctx, 0, -2, 20, 5.5, '#f2ede2');
  let stackY = -4;
  const layers = items.slice().reverse();
  for (const item of layers) {
    drawIngredient(ctx, item, 0, stackY - 4, 26);
    stackY -= 9;
  }
  if (items.length === 0) {
    text(ctx, 'empty plate', 0, -16, 11, '#9aa1ab', '600');
  }
  ctx.restore();
}

/** A progress ring around a station slot: grill time, or chops done. */
function progressRing(ctx, x, y, r, fraction, color) {
  ctx.strokeStyle = 'rgba(46,33,24,0.25)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + fraction * Math.PI * 2);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

function drawCounter(ctx, station, highlight) {
  const { x, y, w, h } = station;
  ctx.fillStyle = PALETTE.counterSide;
  roundRect(ctx, x, y + 6, w, h, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  roundRect(ctx, x, y, w, h - 4, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  roundRect(ctx, x + 6, y + 5, w - 12, 10, 5);
  ctx.fill();
  text(ctx, station.label, x + w / 2, y + h - 12, 11, '#ffe9c4', '800');
  if (highlight) {
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 3;
    roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12);
    ctx.stroke();
  }
}

function drawBin(ctx, station, highlight) {
  drawCounter(ctx, station, highlight);
  const ing = INGREDIENTS[station.gives];
  // A little crate of the ingredient, heaped above the counter's front edge.
  ctx.fillStyle = 'rgba(46,33,24,0.18)';
  roundRect(ctx, station.x + 12, station.y + 8, station.w - 24, 30, 6);
  ctx.fill();
  drawIngredient(ctx, station.gives, station.x + station.w / 2, station.y + 24, 30);
  ctx.fillStyle = ing.dark;
  text(ctx, ing.name.toUpperCase(), station.x + station.w / 2, station.y + station.h - 12, 10, '#ffe9c4', '800');
}

function drawGrill(ctx, station, slots, highlight, now) {
  const { x, y, w, h } = station;
  ctx.fillStyle = '#3a3a3f';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = '#232327';
  roundRect(ctx, x + 8, y + 8, w - 16, h - 26, 8);
  ctx.fill();
  // Grill bars.
  ctx.strokeStyle = '#55555c';
  ctx.lineWidth = 3;
  for (let i = 1; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 8 + (i * (w - 16)) / 6, y + 10);
    ctx.lineTo(x + 8 + (i * (w - 16)) / 6, y + h - 18);
    ctx.stroke();
  }
  // Glowing coals under a cooking patty.
  slots.forEach((slot, i) => {
    const sx = x + 50 + i * 100;
    const sy = y + 38;
    const cooking = slot.item === 'patty' && slot.progressSeconds < 15;
    if (cooking) {
      const flicker = 0.55 + 0.25 * Math.sin(now * 9 + i * 2);
      ctx.fillStyle = `rgba(255,${Math.floor(120 + 60 * flicker)},40,${0.35 + 0.3 * flicker})`;
      ellipse(ctx, sx, sy + 6, 34, 10, ctx.fillStyle);
    }
    if (slot.item === 'patty') {
      const art = slot.progressSeconds >= 15 ? 'patty-burnt' : slot.progressSeconds >= 6 ? 'patty-cooked' : 'patty';
      drawIngredient(ctx, art, sx, sy, 40);
      const fraction = Math.min(1, slot.progressSeconds / 6);
      progressRing(ctx, sx, sy, 26, fraction, slot.progressSeconds >= 15 ? '#e4572e' : '#f7c948');
      if (slot.progressSeconds >= 15) text(ctx, 'BURNT!', sx, sy - 34, 12, '#ff8a5c', '800');
      else if (slot.progressSeconds >= 6) text(ctx, 'READY', sx, sy - 34, 12, '#7bc950', '800');
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ellipse(ctx, sx, sy, 26, 8, 'rgba(255,255,255,0.16)');
    }
  });
  text(ctx, 'GRILL', x + w / 2, y + h - 12, 11, '#ffe9c4', '800');
  if (highlight) {
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 3;
    roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12);
    ctx.stroke();
  }
}

function drawBoard(ctx, station, slots, highlight) {
  const { x, y, w, h } = station;
  ctx.fillStyle = '#c9a86a';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.board;
  roundRect(ctx, x + 8, y + 8, w - 16, h - 26, 8);
  ctx.fill();
  slots.forEach((slot, i) => {
    const sx = x + 50 + i * 100;
    const sy = y + 38;
    if (slot.item) {
      drawIngredient(ctx, slot.chops >= 3 ? `${slot.item}-chopped` : slot.item, sx, sy, 36);
      if (slot.chops < 3) {
        text(ctx, `CHOP ${slot.chops}/3`, sx, sy - 32, 12, '#7a5a2e', '800');
        progressRing(ctx, sx, sy, 24, slot.chops / 3, '#7bc950');
      } else {
        text(ctx, 'READY', sx, sy - 32, 12, '#4e9b2e', '800');
      }
    } else {
      ctx.fillStyle = 'rgba(122,90,46,0.25)';
      ellipse(ctx, sx, sy, 24, 7, 'rgba(122,90,46,0.25)');
    }
  });
  text(ctx, 'CHOPPING BOARD', x + w / 2, y + h - 12, 11, '#7a5a2e', '800');
  if (highlight) {
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 3;
    roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12);
    ctx.stroke();
  }
}

function drawServeWindow(ctx, station, highlight, readyPlate) {
  const { x, y, w, h } = station;
  ctx.fillStyle = PALETTE.steelDark;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = '#f6ead6';
  roundRect(ctx, x + 8, y + 8, w - 16, 52, 8);
  ctx.fill();
  // A little bell on the pass.
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.arc(x + w - 26, y + 30, 10, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(x + w - 30, y + 30, 8, 3);
  if (readyPlate) {
    drawPlate(ctx, x + w / 2 - 30, y + 32, readyPlate, 0.9);
    text(ctx, 'READY TO SERVE', x + w / 2, y + 74, 12, '#2a9d8f', '800');
  } else {
    text(ctx, '— pass —', x + w / 2, y + 32, 13, '#9aa1ab', '600');
    text(ctx, 'SERVE HERE', x + w / 2, y + 74, 12, '#5d6b7a', '800');
  }
  text(ctx, 'SERVING WINDOW', x + w / 2, y + h - 12, 11, '#ffe9c4', '800');
  if (highlight) {
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 3;
    roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12);
    ctx.stroke();
  }
}

function drawPlatesStation(ctx, station, highlight) {
  drawCounter(ctx, station, highlight);
  for (let i = 0; i < 3; i += 1) {
    ellipse(ctx, station.x + station.w / 2, station.y + 26 - i * 5, 26, 7, i === 2 ? '#ffffff' : '#e8e2d6');
  }
  text(ctx, 'PLATES', station.x + station.w / 2, station.y + station.h - 12, 11, '#ffe9c4', '800');
}

function drawTrashStation(ctx, station, highlight) {
  const { x, y, w, h } = station;
  ctx.fillStyle = '#5d6b7a';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.fillStyle = '#7a8794';
  roundRect(ctx, x + 18, y + 10, w - 36, h - 28, 6);
  ctx.fill();
  ctx.strokeStyle = '#5d6b7a';
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 32 + i * 16, y + 18);
    ctx.lineTo(x + 32 + i * 16, y + h - 26);
    ctx.stroke();
  }
  text(ctx, 'TRASH', x + w / 2, y + h - 12, 11, '#e8edf2', '800');
  if (highlight) {
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 3;
    roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 12);
    ctx.stroke();
  }
}

function drawChef(ctx, chef, now) {
  const bob = chef.moving ? Math.sin(chef.walkPhase) * 2 : 0;
  const x = chef.x;
  const y = chef.y + bob;
  // Shadow.
  ellipse(ctx, x, chef.y + 26, 26, 8, 'rgba(46,33,24,0.25)');
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.25, 1.25);
  // Body: a little cook in a teal apron.
  ctx.fillStyle = '#2a9d8f';
  roundRect(ctx, -16, -6, 32, 26, 12);
  ctx.fill();
  ctx.fillStyle = '#f6ead6';
  roundRect(ctx, -11, -2, 22, 18, 6);
  ctx.fill();
  // Head and toque.
  ellipse(ctx, 0, -16, 13, 12, '#f2c9a0');
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, -14, -38, 28, 14, 7);
  ctx.fill();
  ellipse(ctx, -9, -38, 8, 6, '#ffffff');
  ellipse(ctx, 0, -41, 9, 7, '#ffffff');
  ellipse(ctx, 9, -38, 8, 6, '#ffffff');
  // Eyes look where the chef faces.
  ctx.fillStyle = '#2e2118';
  ellipse(ctx, chef.facing * 4 - 4, -16, 1.8, 2.4, '#2e2118');
  ellipse(ctx, chef.facing * 4 + 4, -16, 1.8, 2.4, '#2e2118');
  ctx.restore();
  // What the chef carries, held up high where the player can read it.
  if (chef.held) {
    const hy = y - 62;
    if (chef.held.kind === 'plate') {
      drawPlate(ctx, x, hy, chef.held.items, 0.95);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ellipse(ctx, x, hy, 26, 9, 'rgba(255,255,255,0.85)');
      drawIngredient(ctx, chef.held.id, x, hy - 8, 34);
    }
    // Little hands reaching up to it.
    ellipse(ctx, x - 14, hy + 10, 4.5, 4.5, '#f2c9a0');
    ellipse(ctx, x + 14, hy + 10, 4.5, 4.5, '#f2c9a0');
  }
  void now;
}

function patienceColor(fraction) {
  if (fraction > 0.55) return '#4e9b2e';
  if (fraction > 0.28) return '#f7c948';
  return '#e4572e';
}

function drawOrderBoard(ctx, board, nowSeconds, rushHour) {
  // The board itself: a dark menu rail across the top.
  ctx.fillStyle = '#2e2118';
  ctx.fillRect(0, 0, VIEW.width, 108);
  ctx.fillStyle = '#f6ead6';
  text(ctx, 'EMBER & OAK', 96, 26, 22, '#f7c948', '800', 'left');
  text(ctx, 'RUSH HOUR KITCHEN', 96, 50, 11, '#f6ead6', '600', 'left');
  text(ctx, 'Orders', 300, 26, 13, 'rgba(246,234,214,0.6)', '700', 'left');
  text(ctx, 'serve fast for a tip', 300, 50, 11, 'rgba(246,234,214,0.6)', '600', 'left');

  const tickets = board.openTickets();
  const slotW = 160;
  const startX = 470;
  tickets.forEach((ticket, i) => {
    const x = startX + i * (slotW + 8);
    const frac = ticket.patienceFraction(nowSeconds);
    ctx.fillStyle = '#fff7e8';
    roundRect(ctx, x, 10, slotW, 88, 10);
    ctx.fill();
    ctx.fillStyle = ticket.recipe.ticket;
    roundRect(ctx, x, 10, slotW, 8, 4);
    ctx.fill();
    text(ctx, ticket.recipe.name, x + 10, 30, 12, '#2e2118', '800', 'left');
    // The recipe as dots of its ingredients.
    ticket.recipe.needs.forEach((need, j) => {
      drawIngredient(ctx, need === 'patty' ? 'patty-cooked' : need, x + 22 + j * 28, 56, 20);
    });
    // Patience bar, green to red.
    ctx.fillStyle = 'rgba(46,33,24,0.15)';
    roundRect(ctx, x + 12, 78, slotW - 24, 8, 4);
    ctx.fill();
    ctx.fillStyle = patienceColor(frac);
    roundRect(ctx, x + 12, 78, (slotW - 24) * frac, 8, 4);
    ctx.fill();
    text(ctx, `$${ticket.payout(nowSeconds)}`, x + slotW - 14, 30, 13, '#2a9d8f', '800', 'right');
  });
  if (tickets.length === 0) {
    text(ctx, 'No orders — breathe. The next table is coming…', startX + 200, 54, 14, '#f6ead6', '600');
  }
}

function drawHud(ctx, view) {
  const { coins, combo, served, failed, timeLeftSeconds, rushHour, muted } = view;
  const minutes = Math.floor(Math.max(0, timeLeftSeconds) / 60);
  const seconds = Math.floor(Math.max(0, timeLeftSeconds) % 60);
  const clock = `${minutes}:${String(seconds).padStart(2, '0')}`;
  const urgent = timeLeftSeconds <= 30;
  // Shift clock, top right.
  ctx.fillStyle = urgent && Math.floor(timeLeftSeconds * 2) % 2 === 0 ? '#e4572e' : '#2e2118';
  roundRect(ctx, VIEW.width - 148, 12, 132, 52, 10);
  ctx.fill();
  text(ctx, clock, VIEW.width - 82, 30, 24, urgent ? '#ffd76a' : '#fff7e8', '800');
  text(ctx, rushHour ? 'DINNER RUSH' : 'SHIFT', VIEW.width - 82, 52, 10, '#f7c948', '800');
  // Coins and combo, bottom left.
  ctx.fillStyle = 'rgba(46,33,24,0.82)';
  roundRect(ctx, 12, VIEW.height - 52, 250, 40, 10);
  ctx.fill();
  text(ctx, `$${coins}`, 24, VIEW.height - 32, 18, '#f7c948', '800', 'left');
  text(ctx, `Served ${served} · Lost ${failed}`, 128, VIEW.height - 32, 13, '#fff7e8', '600', 'left');
  if (combo >= 2) {
    ctx.fillStyle = '#e4572e';
    roundRect(ctx, 272, VIEW.height - 52, 110, 40, 10);
    ctx.fill();
    text(ctx, `COMBO ×${combo}`, 327, VIEW.height - 32, 16, '#fff7e8', '800');
  }
  // Controls hint, bottom right.
  text(ctx, 'WASD / click to move · E to work · M mute · P pause', VIEW.width - 16, VIEW.height - 32, 12, 'rgba(255,247,232,0.85)', '600', 'right');
  if (muted) text(ctx, 'MUTED', VIEW.width - 16, VIEW.height - 58, 12, '#f7c948', '700', 'right');
}

function drawPopups(ctx, popups) {
  for (const popup of popups) {
    const age = popup.ageSeconds / popup.lifeSeconds;
    ctx.globalAlpha = age < 0.7 ? 1 : 1 - (age - 0.7) / 0.3;
    text(ctx, popup.message, popup.x, popup.y - age * 34, popup.big ? 22 : 16, popup.color, '800');
    ctx.globalAlpha = 1;
  }
}

function drawParticles(ctx, particles) {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, 1 - p.ageSeconds / p.lifeSeconds);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawMessage(ctx, message) {
  if (!message) return;
  ctx.fillStyle = 'rgba(46,33,24,0.85)';
  const w = Math.min(560, 40 + message.length * 8.5);
  roundRect(ctx, VIEW.width / 2 - w / 2, 196, w, 34, 17);
  ctx.fill();
  text(ctx, message, VIEW.width / 2, 214, 15, '#fff7e8', '700');
}

function drawHint(ctx, hint) {
  if (!hint) return;
  ctx.fillStyle = 'rgba(46,33,24,0.75)';
  const w = Math.min(560, 36 + hint.length * 7.2);
  roundRect(ctx, 12, VIEW.height - 100, w, 30, 15);
  ctx.fill();
  text(ctx, hint, 26, VIEW.height - 85, 13, '#ffe9c4', '600', 'left');
}

/** The kitchen floor: warm tiles and a rug in front of the pass. */
function drawFloor(ctx) {
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 108, VIEW.width, VIEW.height - 108);
  ctx.fillStyle = PALETTE.floorDark;
  for (let y = 118; y < VIEW.height; y += 48) {
    for (let x = ((y / 48) % 2 === 0 ? 0 : 24); x < VIEW.width; x += 48) {
      ctx.fillRect(x, y, 46, 2);
    }
  }
  // Rug by the serving window.
  ctx.fillStyle = '#2a9d8f';
  roundRect(ctx, 1000, 430, 240, 90, 12);
  ctx.fill();
  ctx.strokeStyle = '#f6ead6';
  ctx.lineWidth = 3;
  roundRect(ctx, 1010, 440, 220, 70, 8);
  ctx.stroke();
  // Wall band above the counters.
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 108, VIEW.width, 10);
}

function drawTitle(ctx, view) {
  ctx.fillStyle = 'rgba(46,33,24,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff7e8';
  roundRect(ctx, VIEW.width / 2 - 340, 130, 680, 440, 20);
  ctx.fill();
  ctx.fillStyle = '#2e2118';
  text(ctx, 'EMBER & OAK', VIEW.width / 2, 190, 46, '#2e2118', '800');
  text(ctx, 'RUSH HOUR KITCHEN', VIEW.width / 2, 232, 20, '#e4572e', '800');
  text(ctx, 'A tiny bistro. A three-minute shift. A full board of hungry tables.', VIEW.width / 2, 272, 15, '#5d4a38', '600');
  const lines = [
    '1 · Grab ingredients from the bins along the top wall.',
    '2 · Grill patties on the GRILL, chop veg on the BOARD.',
    '3 · Stack the dish on a plate at ASSEMBLY, then serve it at the WINDOW.',
    '4 · Serve before a ticket’s patience runs out — fast serves pay a tip!',
  ];
  lines.forEach((line, i) => text(ctx, line, VIEW.width / 2, 318 + i * 30, 15, '#2e2118', '600'));
  ctx.fillStyle = '#2a9d8f';
  roundRect(ctx, VIEW.width / 2 - 130, 460, 260, 52, 26);
  ctx.fill();
  text(ctx, view.startPulse ? '▶  START SHIFT' : '▶  START SHIFT', VIEW.width / 2, 487, 20, '#ffffff', '800');
  text(ctx, 'WASD / arrows or click to move · E or click to work · M mute', VIEW.width / 2, 540, 13, '#8a7a68', '600');
  text(ctx, `Best shift: $${view.bestCoins}`, VIEW.width / 2, 566, 13, '#8a7a68', '600');
}

function drawEnd(ctx, view) {
  ctx.fillStyle = 'rgba(46,33,24,0.6)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff7e8';
  roundRect(ctx, VIEW.width / 2 - 320, 120, 640, 460, 20);
  ctx.fill();
  text(ctx, 'SHIFT OVER!', VIEW.width / 2, 178, 42, '#2e2118', '800');
  text(ctx, `You earned $${view.coins} · served ${view.served} dishes · lost ${view.failed}`, VIEW.width / 2, 224, 16, '#5d4a38', '600');
  // Stars.
  for (let i = 0; i < 3; i += 1) {
    const cx = VIEW.width / 2 + (i - 1) * 90;
    const lit = i < view.stars;
    ctx.fillStyle = lit ? '#f7c948' : '#d8cfc0';
    ctx.beginPath();
    for (let k = 0; k < 10; k += 1) {
      const r = k % 2 === 0 ? 30 : 13;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      const px = cx + r * Math.cos(a);
      const py = 292 + r * Math.sin(a);
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  text(ctx, view.starsLabel, VIEW.width / 2, 348, 16, '#2a9d8f', '700');
  text(ctx, `Best combo ×${view.bestCombo} · Best shift $${view.bestCoins}`, VIEW.width / 2, 384, 14, '#5d4a38', '600');
  ctx.fillStyle = '#2a9d8f';
  roundRect(ctx, VIEW.width / 2 - 130, 420, 260, 52, 26);
  ctx.fill();
  text(ctx, 'COOK AGAIN  (R)', VIEW.width / 2, 447, 18, '#ffffff', '800');
  text(ctx, 'Tip: serve fast for tips, and never let a patty burn.', VIEW.width / 2, 508, 13, '#8a7a68', '600');
  if (view.newBest) text(ctx, '★ NEW BEST SHIFT! ★', VIEW.width / 2, 536, 15, '#e4572e', '800');
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(46,33,24,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  text(ctx, 'PAUSED', VIEW.width / 2, VIEW.height / 2 - 10, 44, '#fff7e8', '800');
  text(ctx, 'Press P to keep cooking', VIEW.width / 2, VIEW.height / 2 + 34, 16, '#ffe9c4', '600');
}

/** Draw one frame of the game from the view the game loop builds. */
export function drawFrame(ctx, view) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawFloor(ctx);

  // Stations, back to front.
  const stations = view.stations;
  const highlight = view.nearestStation;
  for (const key of ['binBun', 'binPatty', 'binCheese', 'binTomato', 'binLettuce', 'binOnion']) {
    drawBin(ctx, STATIONS[key], highlight === STATIONS[key]);
  }
  drawGrill(ctx, STATIONS.grill, stations.grill, highlight === STATIONS.grill, view.now);
  drawBoard(ctx, STATIONS.board, stations.board, highlight === STATIONS.board);
  // Assembly counter with its plate.
  drawCounter(ctx, STATIONS.assembly, highlight === STATIONS.assembly);
  if (stations.assemblyPlate !== null) {
    drawPlate(ctx, STATIONS.assembly.x + STATIONS.assembly.w / 2, STATIONS.assembly.y + 52, stations.assemblyPlate, 0.95);
  } else {
    text(ctx, 'plate coming…', STATIONS.assembly.x + STATIONS.assembly.w / 2, STATIONS.assembly.y + 52, 12, '#ffe9c4', '600');
  }
  const readyPlate = view.heldPlateItems?.length ? view.heldPlateItems : null;
  drawServeWindow(ctx, STATIONS.serve, highlight === STATIONS.serve, readyPlate);
  drawPlatesStation(ctx, STATIONS.plates, highlight === STATIONS.plates);
  drawTrashStation(ctx, STATIONS.trash, highlight === STATIONS.trash);

  drawChef(ctx, view.chef, view.now);
  drawParticles(ctx, view.particles);
  drawPopups(ctx, view.popups);
  drawOrderBoard(ctx, view.board, view.nowSeconds, view.rushHour);
  drawHud(ctx, view);
  drawMessage(ctx, view.message);
  drawHint(ctx, view.hint);

  if (view.screen === 'title') drawTitle(ctx, view);
  else if (view.screen === 'end') drawEnd(ctx, view);
  else if (view.screen === 'paused') drawPaused(ctx);
}

export { RECIPES };
