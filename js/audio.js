/* ================================================================
   AUDIO.JS — Controle da música de fundo
   ================================================================ */

const Audio = (() => {
  let audio = null;
  let muted = false;
  let started = false;
  const MUSIC_SRC = 'musica/Mrs magic - Strawberry Guy (Instrumental - Strings Version).mp3';

  function init() {
    audio = new window.Audio(MUSIC_SRC);
    audio.loop   = true;
    audio.volume = 0;

    const btn = document.getElementById('music-btn');
    if (btn) btn.addEventListener('click', toggle);
  }

  function start() {
    if (!audio || started) return;
    started = true;
    audio.play().catch(() => {});
    fadeIn(0.55, 1200);
    updateBtn();
  }

  function fadeIn(targetVol, duration) {
    if (!audio) return;
    const step = 50;
    const inc  = (targetVol / (duration / step));
    const iv   = setInterval(() => {
      if (audio.volume + inc >= targetVol) {
        audio.volume = targetVol;
        clearInterval(iv);
      } else {
        audio.volume += inc;
      }
    }, step);
  }

  function fadeOut(duration = 800) {
    if (!audio) return;
    const step = 50;
    const dec  = (audio.volume / (duration / step));
    const iv   = setInterval(() => {
      if (audio.volume - dec <= 0) {
        audio.volume = 0;
        clearInterval(iv);
      } else {
        audio.volume -= dec;
      }
    }, step);
  }

  function toggle() {
    if (!audio) return;
    muted = !muted;
    if (muted) {
      fadeOut(400);
    } else {
      fadeIn(0.55, 600);
    }
    updateBtn();
  }

  function updateBtn() {
    const btn = document.getElementById('music-btn');
    if (!btn) return;
    btn.textContent = muted ? '🔇' : '🎵';
    btn.title       = muted ? 'Ligar música' : 'Desligar música';
    btn.classList.toggle('muted', muted);
  }

  return { init, start, fadeIn, fadeOut, toggle };
})();
