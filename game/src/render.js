// Sizzle & Serve — renderer. Everything is drawn on one canvas with
// plain shapes: the kitchen, the order board, the stations, the chef and
// the food. No images, no fonts from the network.
function SizzleRenderer(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
}

SizzleRenderer.prototype.roundRect = function (x, y, w, h, r) {
  const c = this.ctx;
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

SizzleRenderer.prototype.text = function (s, x, y, size, color, align, bold) {
  const c = this.ctx;
  c.fillStyle = color || '#2b2118';
  c.font = (bold ? 'bold ' : '') + size + 'px Trebuchet MS, Verdana, sans-serif';
  c.textAlign = align || 'left';
  c.textBaseline = 'middle';
  c.fillText(s, x, y);
};

// --- food icons ---------------------------------------------------------------
SizzleRenderer.prototype.drawItem = function (key, x, y, s) {
  const c = this.ctx;
  const parts = key.split('-');
  const kind = parts[0];
  const state = parts[1] || 'raw';
  const base = SIZZLE_ITEMS[kind];
  const u = s / 2; // half-size unit
  c.save();
  c.translate(x, y);
  if (kind === 'bun') {
    c.fillStyle = base.color;
    c.beginPath(); c.arc(0, u * 0.25, u, Math.PI, 0); c.fill();
    c.fillStyle = '#f3d79a';
    c.fillRect(-u, u * 0.25, u * 2, u * 0.45);
    c.fillStyle = '#fff';
    c.fillRect(-u * 0.6, -u * 0.35, u * 0.22, u * 0.14);
    c.fillRect(-u * 0.1, -u * 0.55, u * 0.22, u * 0.14);
    c.fillRect(u * 0.4, -u * 0.3, u * 0.22, u * 0.14);
  } else if (kind === 'patty') {
    c.fillStyle = state === 'burnt' ? '#221a14' : (state === 'cooked' ? '#6b4429' : base.color);
    this.roundRect(-u, -u * 0.55, u * 2, u * 1.1, u * 0.5);
    c.fill();
    if (state === 'cooked') {
      c.strokeStyle = '#4a2c17'; c.lineWidth = Math.max(2, u * 0.12);
      c.beginPath();
      c.moveTo(-u * 0.6, -u * 0.3); c.lineTo(u * 0.6, -u * 0.3);
      c.moveTo(-u * 0.6, u * 0.3); c.lineTo(u * 0.6, u * 0.3);
      c.stroke();
    }
    if (state === 'burnt') {
      c.strokeStyle = '#555'; c.lineWidth = Math.max(1, u * 0.08);
      c.beginPath(); c.moveTo(-u * 0.5, -u * 0.4); c.lineTo(u * 0.5, u * 0.4);
      c.moveTo(u * 0.5, -u * 0.4); c.lineTo(-u * 0.5, u * 0.4); c.stroke();
    }
  } else if (kind === 'lettuce') {
    if (state === 'chopped') {
      c.fillStyle = base.color;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.arc(-u * 0.6 + i * u * 0.6, (i % 2 ? u * 0.25 : -u * 0.25), u * 0.42, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = base.dark;
      c.fillRect(-u * 0.8, -u * 0.08, u * 1.6, u * 0.16);
    } else {
      c.fillStyle = base.color;
      c.beginPath();
      c.arc(0, 0, u * 0.95, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = base.dark; c.lineWidth = Math.max(2, u * 0.14);
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        c.moveTo(0, 0);
        c.lineTo(Math.cos(a) * u * 0.9, Math.sin(a) * u * 0.9);
      }
      c.stroke();
    }
  } else if (kind === 'tomato') {
    if (state === 'chopped') {
      c.fillStyle = base.color;
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.arc(-u * 0.55 + i * u * 0.55, (i % 2 ? u * 0.3 : -u * 0.2), u * 0.45, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = '#ff8a70';
      c.fillRect(-u * 0.7, -u * 0.1, u * 0.5, u * 0.2);
      c.fillRect(u * 0.1, u * 0.1, u * 0.5, u * 0.2);
    } else {
      c.fillStyle = base.color;
      c.beginPath(); c.arc(0, u * 0.1, u * 0.9, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#4d8a26';
      c.beginPath(); c.arc(0, -u * 0.75, u * 0.35, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.beginPath(); c.arc(-u * 0.35, -u * 0.3, u * 0.25, 0, Math.PI * 2); c.fill();
    }
  } else if (kind === 'cheese') {
    c.fillStyle = base.color;
    c.beginPath();
    c.moveTo(-u, u * 0.6); c.lineTo(u, u * 0.6); c.lineTo(0, -u * 0.8);
    c.closePath(); c.fill();
    c.fillStyle = base.dark;
    c.beginPath(); c.arc(-u * 0.25, u * 0.2, u * 0.14, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(u * 0.3, u * 0.35, u * 0.14, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(u * 0.05, -u * 0.25, u * 0.12, 0, Math.PI * 2); c.fill();
  }
  c.restore();
};

// --- kitchen ------------------------------------------------------------------
SizzleRenderer.prototype.drawFloor = function () {
  const c = this.ctx;
  const W = SIZZLE_CONFIG.width, H = SIZZLE_CONFIG.height;
  c.fillStyle = '#3a2f28';
  c.fillRect(0, 0, W, H);
  // Wall band behind the top stations.
  c.fillStyle = '#6b4a35';
  c.fillRect(0, SIZZLE_CONFIG.topBar, W, 116);
  c.fillStyle = '#7d5a41';
  for (let x = 0; x < W; x += 64) c.fillRect(x, SIZZLE_CONFIG.topBar + 58, 64, 2);
  // Floor tiles.
  for (let y = 180; y < H; y += 56) {
    for (let x = 0; x < W; x += 56) {
      c.fillStyle = ((x / 56 + y / 56) % 2 === 0) ? '#e8dcc4' : '#ddcfae';
      c.fillRect(x + 1, y + 1, 54, 54);
    }
  }
  // Bottom wall band behind the bottom stations.
  c.fillStyle = '#6b4a35';
  c.fillRect(0, 580, W, H - 580);
};

SizzleRenderer.prototype.drawTopBar = function (g) {
  const c = this.ctx;
  const W = SIZZLE_CONFIG.width;
  c.fillStyle = '#2b2118';
  c.fillRect(0, 0, W, SIZZLE_CONFIG.topBar);
  // Order board: up to 3 order cards.
  this.text('ORDERS', 16, 14, 13, '#f7c948', 'left', true);
  if (g.orders.length === 0) {
    this.text('No orders yet — the lunch rush is coming…', 16, 40, 14, '#cbb89a');
  }
  g.orders.forEach((o, i) => {
    const x = 16 + i * 218, y = 22, w = 206, h = 36;
    const recipe = SIZZLE_RECIPES[o.recipe];
    const urgent = o.timeLeft < 15;
    c.fillStyle = urgent ? '#7a2d1e' : '#4a3826';
    this.roundRect(x, y, w, h, 8); c.fill();
    c.strokeStyle = urgent ? '#ff6b4a' : '#8a6d4b'; c.lineWidth = 2; c.stroke();
    this.text('#' + o.id + ' ' + recipe.name, x + 8, y + 12, 13, '#ffe9b0', 'left', true);
    // A little drawn coin, then the payout.
    c.fillStyle = '#f7c948';
    c.beginPath(); c.arc(x + w - 34, y + 12, 7, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#b98a3e'; c.lineWidth = 1.5; c.stroke();
    this.text('$', x + w - 34, y + 12, 10, '#7a5a10', 'center', true);
    this.text(String(recipe.coins), x + w - 24, y + 12, 13, '#f7c948', 'left', true);
    // Needed items as tiny icons + per-order timer bar.
    recipe.items.forEach((key, j) => {
      const done = g.plateItems.indexOf(key) !== -1 || (g.chef.plate && g.chef.plate.indexOf(key) !== -1);
      this.drawItem(key, x + 16 + j * 26, y + 27, 15);
      if (done) {
        c.strokeStyle = '#7dc24a'; c.lineWidth = 3;
        c.beginPath(); c.arc(x + 16 + j * 26, y + 27, 10, 0, Math.PI * 2); c.stroke();
      }
    });
    const frac = Math.max(0, o.timeLeft / o.maxTime);
    c.fillStyle = '#241a12';
    c.fillRect(x + 92, y + 24, 104, 7);
    c.fillStyle = frac > 0.5 ? '#7dc24a' : frac > 0.25 ? '#f7c948' : '#e2543e';
    c.fillRect(x + 92, y + 24, 104 * frac, 7);
  });
  // Right side: day timer, coins, score, hearts.
  const rx = W - 16;
  const mins = Math.floor(g.timeLeft / 60);
  const secs = Math.floor(g.timeLeft % 60);
  const clock = mins + ':' + (secs < 10 ? '0' : '') + secs;
  const clockColor = g.timeLeft < 30 ? '#ff6b4a' : '#ffe9b0';
  this.text('TIME ' + clock, rx - 330, 20, 20, clockColor, 'right', true);
  this.text('DAY ' + (g.phase === 'over' ? 'OVER' : '1'), rx - 330, 46, 13, '#cbb89a', 'right', true);
  // Coins: a drawn coin, then the count.
  c.fillStyle = '#f7c948';
  c.beginPath(); c.arc(rx - 238, 32, 10, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#b98a3e'; c.lineWidth = 2; c.stroke();
  this.text('$', rx - 238, 32, 13, '#7a5a10', 'center', true);
  this.text(String(g.coins), rx - 222, 32, 20, '#f7c948', 'left', true);
  this.text('SCORE ' + g.score, rx - 120, 20, 14, '#ffe9b0', 'right', true);
  let hearts = '';
  for (let i = 0; i < SIZZLE_CONFIG.hearts; i++) hearts += i < g.hearts ? '♥' : '♡';
  this.text(hearts, rx - 120, 46, 16, '#ff6b7a', 'right', true);
  if (g.combo > 0) {
    this.text('COMBO x' + (1 + 0.25 * Math.min(g.combo, 4)).toFixed(2), rx, 32, 15, '#ff9d2e', 'right', true);
  }
};

SizzleRenderer.prototype.drawStation = function (g, st) {
  const c = this.ctx;
  const near = g.phase === 'playing' && g.nearestStation() && g.nearestStation().station.id === st.id;
  c.fillStyle = 'rgba(0,0,0,0.25)';
  this.roundRect(st.x + 3, st.y + 4, st.w, st.h, 10); c.fill();
  c.fillStyle = st.tint;
  this.roundRect(st.x, st.y, st.w, st.h, 10); c.fill();
  c.strokeStyle = near ? '#fff' : 'rgba(0,0,0,0.35)';
  c.lineWidth = near ? 4 : 2;
  this.roundRect(st.x, st.y, st.w, st.h, 10); c.stroke();
  // Station picture.
  const cx = st.x + st.w / 2, cy = st.y + st.h / 2 - 8;
  if (st.kind === 'give') {
    this.drawItem(st.give, cx - 18, cy, 26);
    this.drawItem(st.give, cx + 18, cy, 26);
  } else if (st.id === 'board') {
    c.fillStyle = '#e8c795';
    this.roundRect(cx - 42, cy - 16, 84, 32, 6); c.fill();
    c.strokeStyle = '#8a6d4b'; c.lineWidth = 2; c.stroke();
    this.drawItem('lettuce', cx - 14, cy, 20);
    this.drawItem('tomato', cx + 16, cy, 20);
    c.strokeStyle = '#dfe6ea'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx + 34, cy - 14); c.lineTo(cx + 48, cy + 12); c.stroke();
  } else if (st.id === 'stove') {
    for (let i = 0; i < 2; i++) {
      const bx = cx - 34 + i * 68;
      const b = g.burners[i];
      c.fillStyle = '#2e3138';
      c.beginPath(); c.arc(bx, cy, 26, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#888'; c.lineWidth = 2; c.stroke();
      if (b.item) {
        this.drawItem(b.item.kind + '-' + b.item.state, bx, cy, 30);
        // Cook progress as a ring around the burner, so it never
        // strikes through the station label underneath.
        const frac = Math.min(1, b.progress / SIZZLE_CONFIG.cookSeconds);
        c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 5;
        c.beginPath(); c.arc(bx, cy, 30, 0, Math.PI * 2); c.stroke();
        c.strokeStyle = b.item.state === 'burnt' ? '#e2543e' : b.item.state === 'cooked' ? '#7dc24a' : '#f7c948';
        c.beginPath(); c.arc(bx, cy, 30, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); c.stroke();
      } else {
        c.fillStyle = '#4a4d57';
        c.beginPath(); c.arc(bx, cy, 12, 0, Math.PI * 2); c.fill();
      }
    }
  } else if (st.id === 'plate') {
    c.fillStyle = '#fff';
    c.beginPath(); c.ellipse(cx, cy + 4, 52, 20, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#cbb89a'; c.lineWidth = 2; c.stroke();
    g.plateItems.forEach((key, i) => {
      this.drawItem(key, cx - 36 + i * 24, cy, 20);
    });
    const ready = g.plateItems.length > 0 &&
      g.orders.some((o) => g.plateMatchesOrder(g.plateItems, o.recipe));
    if (ready) {
      c.strokeStyle = '#7dc24a'; c.lineWidth = 4;
      c.beginPath(); c.ellipse(cx, cy + 4, 58, 26, 0, 0, Math.PI * 2); c.stroke();
    }
    // The ready state rides on the station label: a separate pill above
    // the counter would collide with the E prompt and the chef.
    this.text(ready ? 'Plating Counter — READY!' : st.label, cx, st.y + st.h - 10, 12,
      ready ? '#2f7a1e' : '#2b2118', 'center', ready);
    if (near) {
      c.fillStyle = '#2b2118';
      this.roundRect(cx - 14, st.y - 26, 28, 20, 6); c.fill();
      this.text('E', cx, st.y - 15, 13, '#fff', 'center', true);
    }
    return;
  } else if (st.id === 'serve') {
    c.fillStyle = '#8a5a2b';
    this.roundRect(cx - 52, cy - 14, 104, 12, 4); c.fill();
    c.fillStyle = '#ffd76a';
    c.beginPath(); c.arc(cx, cy - 16, 12, Math.PI, 0); c.fill();
    c.fillRect(cx - 12, cy - 16, 24, 4);
    c.fillStyle = '#2b2118';
    c.beginPath(); c.arc(cx, cy - 28, 3, 0, Math.PI * 2); c.fill();
    if (g.chef.plate) this.text('serve here!', cx, cy + 26, 13, '#2b2118', 'center', true);
  } else if (st.id === 'trash') {
    c.fillStyle = '#5b5f6b';
    this.roundRect(cx - 20, cy - 16, 40, 32, 6); c.fill();
    c.fillStyle = '#3a3d45';
    c.fillRect(cx - 24, cy - 20, 48, 6);
  } else if (st.id === 'sink') {
    c.fillStyle = '#dfe6ea';
    this.roundRect(cx - 46, cy - 14, 92, 28, 8); c.fill();
    c.fillStyle = '#7fb3d5';
    this.roundRect(cx - 40, cy - 8, 80, 16, 6); c.fill();
    c.strokeStyle = '#9aa5ab'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx, cy - 14); c.lineTo(cx, cy - 24); c.lineTo(cx + 14, cy - 24); c.stroke();
  }
  this.text(st.label, cx, st.y + st.h - 10, 12, '#2b2118', 'center', true);
  if (near) {
    c.fillStyle = '#2b2118';
    this.roundRect(cx - 14, st.y - 26, 28, 20, 6); c.fill();
    this.text('E', cx, st.y - 15, 13, '#fff', 'center', true);
  }
};

SizzleRenderer.prototype.drawChef = function (g) {
  const c = this.ctx;
  const chef = g.chef;
  const r = SIZZLE_CONFIG.chefRadius;
  // Shadow.
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.beginPath(); c.ellipse(chef.x, chef.y + r * 0.85, r, r * 0.35, 0, 0, Math.PI * 2); c.fill();
  // Body (apron) and head.
  c.fillStyle = '#f2ead8';
  c.beginPath(); c.arc(chef.x, chef.y + 4, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#e2543e';
  c.fillRect(chef.x - r + 4, chef.y - 2, r * 2 - 8, r * 0.9);
  c.fillStyle = '#f7c948';
  c.fillRect(chef.x - r + 4, chef.y + r * 0.55, r * 2 - 8, 4);
  c.fillStyle = '#ffcf9e';
  c.beginPath(); c.arc(chef.x, chef.y - r * 0.55, r * 0.62, 0, Math.PI * 2); c.fill();
  // Chef hat.
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(chef.x - r * 0.3, chef.y - r * 1.05, r * 0.34, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(chef.x + r * 0.3, chef.y - r * 1.05, r * 0.34, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(chef.x, chef.y - r * 1.15, r * 0.4, 0, Math.PI * 2); c.fill();
  c.fillRect(chef.x - r * 0.55, chef.y - r * 0.95, r * 1.1, r * 0.28);
  // Eyes look where the chef faces.
  c.fillStyle = '#2b2118';
  c.beginPath(); c.arc(chef.x + chef.facing * 5 - 5, chef.y - r * 0.55, 2.5, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(chef.x + chef.facing * 5 + 5, chef.y - r * 0.55, 2.5, 0, Math.PI * 2); c.fill();
  // Carried items float above the hat; a plate rides in front.
  if (chef.plate) {
    c.fillStyle = '#fff';
    c.beginPath(); c.ellipse(chef.x + chef.facing * 26, chef.y + 2, 26, 10, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#cbb89a'; c.lineWidth = 2; c.stroke();
    chef.plate.forEach((key, i) => {
      this.drawItem(key, chef.x + chef.facing * 26 - 16 + i * 16, chef.y - 2, 13);
    });
    const order = g.matchingOrder();
    if (order) this.text('Serve #' + order.id + '!', chef.x, chef.y - r - 34, 13, '#7dc24a', 'center', true);
  } else {
    chef.carry.forEach((item, i) => {
      this.drawItem(sizzleFinishedKey(item.kind, item.state), chef.x - 20 + i * 20, chef.y - r - 18, 16);
    });
  }
  // Chop / wash progress ring.
  const prog = Math.max(g.chopProgress, g.washProgress);
  if (prog > 0) {
    c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 5;
    c.beginPath(); c.arc(chef.x, chef.y, r + 10, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = g.chopProgress > 0 ? '#f7c948' : '#7fb3d5'; c.lineWidth = 5;
    c.beginPath(); c.arc(chef.x, chef.y, r + 10, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2); c.stroke();
    this.text(g.chopProgress > 0 ? 'CHOPPING…' : 'WASHING…', chef.x, chef.y - r - 34, 12, '#2b2118', 'center', true);
  }
};

SizzleRenderer.prototype.drawHintBar = function (g) {
  const c = this.ctx;
  const near = g.phase === 'playing' ? g.nearestStation() : null;
  let hint = 'WASD / arrows to move • click a station to use it • E to interact • P pause • M mute';
  if (near) {
    const st = near.station;
    if (st.kind === 'give') hint = 'Press E (or click) to take a ' + SIZZLE_ITEMS[st.give].label;
    else if (st.id === 'board') hint = 'Hold E here to chop lettuce / tomato';
    else if (st.id === 'stove') hint = 'E: put a raw patty on / take a grilled patty off';
    else if (st.id === 'plate') hint = 'E: add the top item to the plate • E again when the dish matches an order';
    else if (st.id === 'serve') hint = 'E: serve the finished plate!';
    else if (st.id === 'trash') hint = 'E: throw away the last thing you carry';
    else if (st.id === 'sink') hint = 'Hold E here to wash a burnt patty back to raw';
  }
  c.fillStyle = 'rgba(43,33,24,0.85)';
  this.roundRect(280, 676, 720, 30, 8); c.fill();
  this.text(hint, 640, 691, 14, '#ffe9b0', 'center');
  if (g.messageTimer > 0 && g.message) {
    // Top of the floor, below the top stations: never covers a station.
    c.fillStyle = 'rgba(43,33,24,0.9)';
    const w = Math.min(560, 24 + g.message.length * 8);
    this.roundRect(640 - w / 2, 186, w, 28, 8); c.fill();
    this.text(g.message, 640, 200, 14, '#fff', 'center', true);
  }
};

SizzleRenderer.prototype.draw = function (g) {
  const c = this.ctx;
  c.clearRect(0, 0, SIZZLE_CONFIG.width, SIZZLE_CONFIG.height);
  this.drawFloor();
  this.drawTopBar(g);
  for (const st of SIZZLE_STATIONS) this.drawStation(g, st);
  if (g.phase !== 'menu') this.drawChef(g);
  if (g.phase === 'playing' || g.phase === 'paused') this.drawHintBar(g);
  if (g.phase === 'paused') {
    c.fillStyle = 'rgba(0,0,0,0.55)';
    c.fillRect(0, 0, SIZZLE_CONFIG.width, SIZZLE_CONFIG.height);
    this.text('PAUSED', 640, 330, 56, '#fff', 'center', true);
    this.text('Press P or the Resume button to keep cooking', 640, 380, 18, '#ffe9b0', 'center');
  }
};
