// Sizzle & Serve — kitchen logic: the chef, the orders, the stations,
// chopping, cooking, plating and serving. No drawing here; render.js
// reads this state and draws it.
function SizzleKitchen(audio) {
  this.audio = audio;
  this.reset();
}

SizzleKitchen.prototype.reset = function () {
  this.phase = 'menu'; // menu | playing | paused | over
  this.timeLeft = SIZZLE_CONFIG.daySeconds;
  this.score = 0;
  this.coins = 0;
  this.hearts = SIZZLE_CONFIG.hearts;
  this.combo = 0;
  this.comboTimer = 0;
  this.chef = { x: 640, y: 380, carry: [], plate: null, facing: 1 };
  this.orders = [];
  this.orderSeq = 0;
  this.spawnTimer = 3;
  this.burners = [
    { slot: 0, item: null, progress: 0, burntAnnounced: false },
    { slot: 1, item: null, progress: 0, burntAnnounced: false },
  ];
  this.plateItems = [];
  this.chopProgress = 0;
  this.washProgress = 0;
  this.message = '';
  this.messageTimer = 0;
  this.servedCount = 0;
  this.expiredCount = 0;
  this.stars = 0;
  this.elapsed = 0;
};

SizzleKitchen.prototype.start = function () {
  this.reset();
  this.phase = 'playing';
  this.say('Day started — first order coming up!');
};

SizzleKitchen.prototype.say = function (text) {
  this.message = text;
  this.messageTimer = 3;
};

SizzleKitchen.prototype.togglePause = function () {
  if (this.phase === 'playing') { this.phase = 'paused'; this.say('Paused'); }
  else if (this.phase === 'paused') { this.phase = 'playing'; this.say('Back to the kitchen!'); }
};

// --- orders ---------------------------------------------------------------
SizzleKitchen.prototype.spawnOrder = function () {
  const keys = Object.keys(SIZZLE_RECIPES);
  const key = keys[Math.floor(Math.random() * keys.length)];
  this.orderSeq += 1;
  this.orders.push({
    id: this.orderSeq,
    recipe: key,
    timeLeft: SIZZLE_CONFIG.orderSeconds,
    maxTime: SIZZLE_CONFIG.orderSeconds,
  });
  this.audio.orderIn();
  this.say('New order: ' + SIZZLE_RECIPES[key].name + '!');
};

SizzleKitchen.prototype.expireOrder = function (order) {
  this.orders = this.orders.filter((o) => o.id !== order.id);
  this.expiredCount += 1;
  this.hearts -= 1;
  this.combo = 0;
  this.audio.expire();
  this.say('Order #' + order.id + ' walked out! -1 heart');
  if (this.hearts <= 0) this.endDay('Out of hearts — the crowd left hungry.');
};

SizzleKitchen.prototype.endDay = function (reason) {
  this.phase = 'over';
  this.endReason = reason || 'The day is done!';
  if (this.servedCount >= 10) this.stars = 3;
  else if (this.servedCount >= 6) this.stars = 2;
  else if (this.servedCount >= 3) this.stars = 1;
  else this.stars = 0;
  this.audio.win();
};

// --- helpers ----------------------------------------------------------------
SizzleKitchen.prototype.stationCenter = function (st) {
  return { x: st.x + st.w / 2, y: st.y + st.h / 2 };
};

SizzleKitchen.prototype.nearestStation = function () {
  const c = this.chef;
  let best = null, bestD = Infinity;
  for (const st of SIZZLE_STATIONS) {
    const cx = Math.max(st.x, Math.min(c.x, st.x + st.w));
    const cy = Math.max(st.y, Math.min(c.y, st.y + st.h));
    const d = Math.hypot(c.x - cx, c.y - cy);
    if (d < bestD) { bestD = d; best = st; }
  }
  if (best && bestD <= SIZZLE_CONFIG.interactRange) return { station: best, dist: bestD };
  return null;
};

SizzleKitchen.prototype.stationAt = function (px, py) {
  for (const st of SIZZLE_STATIONS) {
    if (px >= st.x && px <= st.x + st.w && py >= st.y && py <= st.y + st.h) return st;
  }
  return null;
};

SizzleKitchen.prototype.plateMatchesOrder = function (items, recipeKey) {
  const want = SIZZLE_RECIPES[recipeKey].items.slice().sort();
  const got = items.slice().sort();
  if (want.length !== got.length) return false;
  for (let i = 0; i < want.length; i++) if (want[i] !== got[i]) return false;
  return true;
};

SizzleKitchen.prototype.matchingOrder = function () {
  for (const o of this.orders) {
    if (this.plateMatchesOrder(this.chef.plate, o.recipe)) return o;
  }
  return null;
};

SizzleKitchen.prototype.plateIsComplete = function () {
  return this.chef.plate !== null && this.matchingOrder() !== null;
};

// --- interaction ------------------------------------------------------------
SizzleKitchen.prototype.interact = function (st) {
  if (this.phase !== 'playing' || !st) return;
  const chef = this.chef;
  if (st.kind === 'give') {
    if (chef.plate) { this.audio.error(); this.say('Hands full with a plate! Serve it first.'); return; }
    if (chef.carry.length >= SIZZLE_CONFIG.carryMax) {
      this.audio.error(); this.say('Hands full! Serve or trash something first.');
      return;
    }
    chef.carry.push({ kind: st.give, state: 'raw' });
    this.audio.pickup();
    this.say('Picked up ' + SIZZLE_ITEMS[st.give].label);
    return;
  }
  if (st.kind === 'trash') {
    if (chef.plate) {
      chef.plate = null;
      this.audio.place();
      this.say('Plate dumped in the trash. Ouch.');
      return;
    }
    if (chef.carry.length === 0) { this.audio.error(); this.say('Nothing to throw away.'); return; }
    const item = chef.carry.pop();
    this.audio.place();
    this.say('Trashed ' + sizzleItemLabel(sizzleFinishedKey(item.kind, item.state)));
    return;
  }
  if (st.kind === 'cook') {
    // Take a finished patty first, then place a raw one on a free burner.
    for (const b of this.burners) {
      if (b.item && b.item.state !== 'raw') {
        if (chef.plate) { this.audio.error(); this.say('Hands full with a plate!'); return; }
        if (chef.carry.length >= SIZZLE_CONFIG.carryMax) { this.audio.error(); this.say('Hands full!'); return; }
        chef.carry.push({ kind: 'patty', state: b.item.state });
        this.audio.pickup();
        this.say(b.item.state === 'burnt' ? 'Picked up a burnt patty — wash it at the sink!' : 'Picked up a grilled patty!');
        b.item = null; b.progress = 0; b.burntAnnounced = false;
        return;
      }
    }
    const rawIdx = chef.carry.findIndex((i) => i.kind === 'patty' && i.state === 'raw');
    if (rawIdx === -1) { this.audio.error(); this.say('Need a raw patty from the fridge first.'); return; }
    const free = this.burners.find((b) => !b.item);
    if (!free) { this.audio.error(); this.say('Both burners are busy!'); return; }
    chef.carry.splice(rawIdx, 1);
    free.item = { kind: 'patty', state: 'raw' };
    free.progress = 0;
    free.burntAnnounced = false;
    this.audio.sizzleStart();
    this.say('Patty on the grill…');
    return;
  }
  if (st.kind === 'plate') {
    if (chef.plate) {
      // Put the finished plate back down on the counter.
      this.plateItems = chef.plate.slice();
      chef.plate = null;
      this.audio.place();
      this.say('Plate set back on the counter.');
      return;
    }
    if (this.plateItems.length > 0) {
      const match = this.orders.find((o) => this.plateMatchesOrder(this.plateItems, o.recipe));
      if (match) {
        chef.plate = this.plateItems.slice();
        this.plateItems = [];
        this.audio.pickup();
        this.say(SIZZLE_RECIPES[match.recipe].name + ' is ready — take it to the Serve Window!');
        return;
      }
    }
    if (chef.carry.length === 0) { this.audio.error(); this.say('Carry an ingredient to the plate first.'); return; }
    const item = chef.carry[chef.carry.length - 1];
    const key = sizzleFinishedKey(item.kind, item.state);
    const needed = this.orders.some((o) => {
      const want = SIZZLE_RECIPES[o.recipe].items;
      return want.indexOf(key) !== -1 && this.plateItems.indexOf(key) === -1;
    });
    if (!needed && this.orders.length > 0) {
      this.audio.error();
      this.say(sizzleItemLabel(key) + ' is not on any order right now.');
      return;
    }
    if (this.plateItems.indexOf(key) !== -1) { this.audio.error(); this.say('That is already on the plate.'); return; }
    if (this.plateItems.length >= 4) { this.audio.error(); this.say('The plate is full!'); return; }
    chef.carry.pop();
    this.plateItems.push(key);
    this.audio.place();
    this.say(sizzleItemLabel(key) + ' added to the plate.');
    return;
  }
  if (st.kind === 'serve') {
    if (!chef.plate) { this.audio.error(); this.say('Bring a finished plate to serve.'); return; }
    const order = this.matchingOrder();
    if (!order) { this.audio.error(); this.say('This plate matches no order on the board!'); return; }
    this.serveOrder(order);
    return;
  }
  // chop and sink are hold-to-work stations; a tap does nothing on its own.
};

SizzleKitchen.prototype.serveOrder = function (order) {
  const recipe = SIZZLE_RECIPES[order.recipe];
  if (this.comboTimer > 0) this.combo += 1; else this.combo = 0;
  this.comboTimer = SIZZLE_CONFIG.comboWindow;
  const mult = 1 + 0.25 * Math.min(this.combo, 4);
  const coins = Math.round(recipe.coins * mult);
  const timeBonus = Math.round(order.timeLeft);
  this.coins += coins;
  this.score += coins * 10 + timeBonus;
  this.servedCount += 1;
  this.orders = this.orders.filter((o) => o.id !== order.id);
  this.chef.plate = null;
  this.audio.serve();
  this.say('Served ' + recipe.name + '! +' + coins + ' coins' + (this.combo > 0 ? ' (combo x' + mult.toFixed(2) + ')' : ''));
};

// --- per-frame update ---------------------------------------------------------
SizzleKitchen.prototype.update = function (dt, input) {
  if (this.phase !== 'playing') { input.clearTransient(); return; }
  this.elapsed += dt;
  this.timeLeft -= dt;
  if (this.messageTimer > 0) this.messageTimer -= dt;
  if (this.comboTimer > 0) this.comboTimer -= dt;
  if (this.timeLeft <= 0) { this.timeLeft = 0; this.endDay('The day is done!'); input.clearTransient(); return; }

  // Orders: spawn and tick.
  this.spawnTimer -= dt;
  if (this.spawnTimer <= 0) {
    if (this.orders.length < SIZZLE_CONFIG.maxOrders) this.spawnOrder();
    this.spawnTimer = SIZZLE_CONFIG.orderSpawnEvery + Math.random() * 4;
  }
  for (const o of this.orders.slice()) {
    o.timeLeft -= dt;
    if (o.timeLeft <= 0) this.expireOrder(o);
  }
  if (this.phase !== 'playing') { input.clearTransient(); return; }

  // Burners cook on their own.
  for (const b of this.burners) {
    if (!b.item) continue;
    b.progress += dt;
    if (b.item.state === 'raw' && b.progress >= SIZZLE_CONFIG.cookSeconds) {
      b.item.state = 'cooked';
      this.audio.cookDone();
      this.say('Patty is grilled — grab it before it burns!');
    } else if (b.item.state === 'cooked' && b.progress >= SIZZLE_CONFIG.burnSeconds && !b.burntAnnounced) {
      b.item.state = 'burnt';
      b.burntAnnounced = true;
      this.audio.burnt();
      this.say('A patty burnt! Wash it at the sink or trash it.');
    }
  }

  // Movement: keys win over a click target.
  const chef = this.chef;
  const mv = input.moveVector();
  let vx = 0, vy = 0;
  if (mv) { vx = mv.x; vy = mv.y; }
  else if (input.moveTarget) {
    const dx = input.moveTarget.x - chef.x;
    const dy = input.moveTarget.y - chef.y;
    const d = Math.hypot(dx, dy);
    if (d > 8) { vx = dx / d; vy = dy / d; }
    else input.moveTarget = null;
  }
  if (vx !== 0) chef.facing = vx > 0 ? 1 : -1;
  this._moveChef(vx * SIZZLE_CONFIG.chefSpeed * dt, 0);
  this._moveChef(0, vy * SIZZLE_CONFIG.chefSpeed * dt);

  // Clicks: a station click interacts when near, otherwise it was a walk order.
  for (const p of input.consumeClicks()) {
    const st = this.stationAt(p.x, p.y);
    if (st) {
      const near = this.nearestStation();
      if (near && near.station.id === st.id) {
        this.interact(st);
        input.moveTarget = null; // stop walking: the chef is using the station
      } else this.say('Walk closer to the ' + st.label + ' first!');
    }
  }
  // E press: interact with the nearest station.
  if (input.consumeInteractPress()) {
    const near = this.nearestStation();
    if (near) {
      this.interact(near.station);
      input.moveTarget = null;
    }
  }

  // Hold E at the board to chop, at the sink to wash a burnt item.
  const near = this.nearestStation();
  const choppableIdx = chef.carry.findIndex(
    (i) => SIZZLE_ITEMS[i.kind].needs === 'chop' && i.state === 'raw');
  if (input.interactHeld && near && near.station.id === 'board' && choppableIdx !== -1 && !chef.plate) {
    this.chopProgress += dt / SIZZLE_CONFIG.chopSeconds;
    if (Math.floor(this.chopProgress * 4) !== Math.floor((this.chopProgress - dt / SIZZLE_CONFIG.chopSeconds) * 4)) {
      this.audio.chop();
    }
    if (this.chopProgress >= 1) {
      chef.carry[choppableIdx].state = 'chopped';
      this.chopProgress = 0;
      this.audio.chopDone();
      this.say('Chopped ' + SIZZLE_ITEMS[chef.carry[choppableIdx].kind].label + '!');
    }
  } else {
    this.chopProgress = 0;
  }
  const burntIdx = chef.carry.findIndex((i) => i.state === 'burnt');
  if (input.interactHeld && near && near.station.id === 'sink' && burntIdx !== -1 && !chef.plate) {
    this.washProgress += dt / 1.5;
    if (this.washProgress >= 1) {
      chef.carry[burntIdx].state = 'raw';
      this.washProgress = 0;
      this.audio.chopDone();
      this.say('Washed clean — good as new!');
    }
  } else {
    this.washProgress = 0;
  }
};

SizzleKitchen.prototype._collides = function (x, y) {
  const r = SIZZLE_CONFIG.chefRadius;
  if (x < 16 + r || x > SIZZLE_CONFIG.width - 16 - r) return true;
  if (y < 186 + r || y > 574 - r) return true;
  for (const st of SIZZLE_STATIONS) {
    if (x + r > st.x && x - r < st.x + st.w && y + r > st.y && y - r < st.y + st.h) return true;
  }
  return false;
};

SizzleKitchen.prototype._moveChef = function (dx, dy) {
  const chef = this.chef;
  if (dx !== 0 && !this._collides(chef.x + dx, chef.y)) chef.x += dx;
  if (dy !== 0 && !this._collides(chef.x, chef.y + dy)) chef.y += dy;
};
