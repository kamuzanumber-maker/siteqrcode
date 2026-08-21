/* ================================================================
   MAIN.JS — Inicialização e orquestração geral
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Partículas de fundo ── */
  Particles.startAmbient();

  /* ── Áudio ── */
  Audio.init();

  /* ── Jogo (inicializa o canvas, não inicia ainda) ── */
  const canvas = document.getElementById('game-canvas');
  if (canvas) Game.init(canvas);

  /* ── Senha ── */
  Password.init();

  /* ── Tela inicial ── */
  Screens.showIntro();

  /* ── Botão "Começar ♡" ── */
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      Audio.start();
      Screens.showGame();
    });
  }

  /* ── Botão "Tentar novamente" (game over) ── */
  const btnRetry = document.getElementById('btn-retry');
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      const overlay = document.getElementById('gameover-overlay');
      overlay.classList.remove('show');
      overlay.classList.add('hidden');
      // Pequeno delay para o overlay sumir antes de reiniciar
      setTimeout(() => {
        Game.reset();
        Game.start();
      }, 100);
    });
  }

  /* ── Botão "Pular animação" na tela de vitória ── */
  const btnSkipWin = document.getElementById('btn-skip-win');
  if (btnSkipWin) {
    btnSkipWin.addEventListener('click', () => {
      Game.stop();
      Screens.showPassword();
    });
  }

});
