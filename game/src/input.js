// Sizzle & Serve — input. Keyboard state, mouse position, canvas clicks,
// and a click-to-move target the chef walks toward when no key is held.
function SizzleInput(canvas) {
  this.canvas = canvas;
  this.keys = {};
  this.mouseX = 0;
  this.mouseY = 0;
  this.moveTarget = null; // {x, y} in canvas coordinates, or null
  this.clickQueue = [];   // canvas clicks waiting to be consumed, {x, y}
  this.interactHeld = false; // E held (for chopping / washing holds)
  this.interactPressed = false; // E freshly pressed this frame
  this._down = this._onKeyDown.bind(this);
  this._up = this._onKeyUp.bind(this);
  this._move = this._onMouseMove.bind(this);
  this._click = this._onClick.bind(this);
  window.addEventListener('keydown', this._down);
  window.addEventListener('keyup', this._up);
  canvas.addEventListener('mousemove', this._move);
  canvas.addEventListener('click', this._click);
}

SizzleInput.prototype._keyName = function (e) {
  return (e.code || e.key || '').toString();
};

SizzleInput.prototype._onKeyDown = function (e) {
  const code = this._keyName(e);
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].indexOf(code) !== -1) {
    e.preventDefault();
  }
  if (code === 'KeyE' && !this.keys[code]) this.interactPressed = true;
  this.keys[code] = true;
  this.interactHeld = !!this.keys['KeyE'];
  if (this._isMoveKey(code)) this.moveTarget = null;
};

SizzleInput.prototype._onKeyUp = function (e) {
  const code = this._keyName(e);
  this.keys[code] = false;
  this.interactHeld = !!this.keys['KeyE'];
};

SizzleInput.prototype._isMoveKey = function (code) {
  return code === 'KeyW' || code === 'KeyA' || code === 'KeyS' || code === 'KeyD' ||
    code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight';
};

SizzleInput.prototype.moveVector = function () {
  let dx = 0, dy = 0;
  if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
  if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;
  if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
  if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
  if (dx === 0 && dy === 0) return null;
  const len = Math.sqrt(dx * dx + dy * dy);
  return { x: dx / len, y: dy / len };
};

SizzleInput.prototype._canvasPoint = function (clientX, clientY) {
  const r = this.canvas.getBoundingClientRect();
  return {
    x: (clientX - r.left) * (this.canvas.width / r.width),
    y: (clientY - r.top) * (this.canvas.height / r.height),
  };
};

SizzleInput.prototype._onMouseMove = function (e) {
  const p = this._canvasPoint(e.clientX, e.clientY);
  this.mouseX = p.x;
  this.mouseY = p.y;
};

SizzleInput.prototype._onClick = function (e) {
  const p = this._canvasPoint(e.clientX, e.clientY);
  this.clickQueue.push(p);
  // A floor click becomes a walk target; a station click is also queued
  // so the kitchen can treat it as an interact when the chef is near.
  this.moveTarget = p;
};

SizzleInput.prototype.consumeClicks = function () {
  const out = this.clickQueue;
  this.clickQueue = [];
  return out;
};

SizzleInput.prototype.consumeInteractPress = function () {
  const p = this.interactPressed;
  this.interactPressed = false;
  return p;
};

SizzleInput.prototype.clearTransient = function () {
  this.interactPressed = false;
  this.clickQueue = [];
};
