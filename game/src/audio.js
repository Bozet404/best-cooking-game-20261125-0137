// Sizzle & Serve — sounds. Every sound is synthesised with WebAudio:
// short oscillator blips and filtered noise, no audio files, no network.
function SizzleAudio() {
  this.ctx = null;
  this.muted = false;
  this.sizzleNodes = null;
}

SizzleAudio.prototype.ensure = function () {
  if (!this.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
    } catch (e) { this.ctx = null; }
  }
  if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  return this.ctx;
};

SizzleAudio.prototype.tone = function (freq, dur, type, vol, slideTo) {
  if (this.muted) return;
  const ctx = this.ensure();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(vol || 0.12, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
};

SizzleAudio.prototype.noise = function (dur, vol, filterFreq) {
  if (this.muted) return;
  const ctx = this.ensure();
  if (!ctx) return;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq || 1200;
  const gain = ctx.createGain();
  gain.gain.value = vol || 0.15;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
};

SizzleAudio.prototype.pickup = function () { this.tone(520, 0.09, 'triangle', 0.12, 760); };
SizzleAudio.prototype.place = function () { this.tone(340, 0.08, 'triangle', 0.1, 260); };
SizzleAudio.prototype.chop = function () { this.noise(0.07, 0.2, 900); this.tone(180, 0.05, 'square', 0.05); };
SizzleAudio.prototype.chopDone = function () { this.tone(660, 0.1, 'triangle', 0.12); this.tone(880, 0.12, 'triangle', 0.1); };
SizzleAudio.prototype.sizzleStart = function () { this.noise(0.4, 0.08, 2400); };
SizzleAudio.prototype.cookDone = function () { this.tone(740, 0.1, 'sine', 0.12); this.tone(988, 0.14, 'sine', 0.12); };
SizzleAudio.prototype.burnt = function () { this.tone(220, 0.25, 'sawtooth', 0.1, 110); };
SizzleAudio.prototype.serve = function () {
  this.tone(523, 0.1, 'triangle', 0.13);
  setTimeout(() => this.tone(659, 0.1, 'triangle', 0.13), 90);
  setTimeout(() => this.tone(784, 0.18, 'triangle', 0.14), 180);
};
SizzleAudio.prototype.error = function () { this.tone(160, 0.16, 'square', 0.08, 120); };
SizzleAudio.prototype.orderIn = function () { this.tone(440, 0.08, 'sine', 0.1); this.tone(587, 0.1, 'sine', 0.1); };
SizzleAudio.prototype.expire = function () { this.tone(330, 0.2, 'sawtooth', 0.09, 196); };
SizzleAudio.prototype.win = function () {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => setTimeout(() => this.tone(n, 0.22, 'triangle', 0.13), i * 130));
};
SizzleAudio.prototype.toggleMute = function () {
  this.muted = !this.muted;
  return this.muted;
};
