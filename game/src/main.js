// Sizzle & Serve — entry point: the loop, the buttons, the overlays.
// The kitchen (kitchen.js) owns the rules; this file owns the frame.
(function () {
  const canvas = document.getElementById('game');
  const audio = new SizzleAudio();
  const input = new SizzleInput(canvas);
  const kitchen = new SizzleKitchen(audio);
  const renderer = new SizzleRenderer(canvas);

  const $ = (id) => document.getElementById(id);
  const menuEl = $('menu'), helpEl = $('help'), endEl = $('end'),
    hudEl = $('hud'), endTitle = $('end-title'), endStats = $('end-stats'),
    muteBtn = $('btn-mute'), pauseBtn = $('btn-pause');

  function show(el, on) { el.classList.toggle('hidden', !on); }

  function syncOverlays() {
    const p = kitchen.phase;
    show(menuEl, p === 'menu');
    show(endEl, p === 'over');
    show(hudEl, p === 'playing' || p === 'paused');
    pauseBtn.textContent = p === 'paused' ? 'Resume' : 'Pause';
    if (p === 'over') {
      endTitle.textContent = kitchen.stars > 0
        ? 'Day complete — ' + '★'.repeat(kitchen.stars) + '☆'.repeat(3 - kitchen.stars)
        : 'Day complete';
      endStats.innerHTML =
        '<p>' + kitchen.endReason + '</p>' +
        '<p><strong>' + kitchen.servedCount + '</strong> dishes served • ' +
        '<strong>' + kitchen.coins + '</strong> coins • ' +
        '<strong>' + kitchen.score + '</strong> points</p>' +
        '<p>' + kitchen.expiredCount + ' order' + (kitchen.expiredCount === 1 ? '' : 's') +
        ' walked out • ' + kitchen.hearts + ' heart' + (kitchen.hearts === 1 ? '' : 's') + ' left</p>';
    }
  }

  function startGame() {
    audio.ensure();
    kitchen.start();
    syncOverlays();
  }

  $('btn-start').addEventListener('click', startGame);
  $('btn-again').addEventListener('click', startGame);
  $('btn-how').addEventListener('click', () => { show(helpEl, true); });
  $('btn-close-help').addEventListener('click', () => { show(helpEl, false); });
  $('btn-restart').addEventListener('click', startGame);
  pauseBtn.addEventListener('click', () => { kitchen.togglePause(); syncOverlays(); });
  muteBtn.addEventListener('click', () => {
    const muted = audio.toggleMute();
    muteBtn.textContent = muted ? 'Muted' : 'Sound on';
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP' && (kitchen.phase === 'playing' || kitchen.phase === 'paused')) {
      kitchen.togglePause();
      syncOverlays();
    }
    if (e.code === 'KeyM') {
      const muted = audio.toggleMute();
      muteBtn.textContent = muted ? 'Muted' : 'Sound on';
    }
    if (e.code === 'KeyR' && kitchen.phase !== 'menu') startGame();
    if (e.code === 'Enter' && kitchen.phase === 'menu') startGame();
    if (e.code === 'Enter' && kitchen.phase === 'over') startGame();
  });

  // Exposed for live testing: the whole game state, read-only by convention.
  window.SIZZLE = { game: kitchen, audio: audio, input: input, config: SIZZLE_CONFIG };

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const wasOver = kitchen.phase === 'over';
    kitchen.update(dt, input);
    if (kitchen.phase === 'over' && !wasOver) syncOverlays();
    renderer.draw(kitchen);
    requestAnimationFrame(frame);
  }
  syncOverlays();
  requestAnimationFrame(frame);
})();
