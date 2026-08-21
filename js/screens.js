/* ================================================================
   SCREENS.JS — Gerenciamento de telas e transições
   ================================================================ */

const Screens = (() => {
  const SCREENS = ['screen-intro', 'screen-game', 'screen-win', 'screen-password', 'screen-success'];

  function show(id) {
    SCREENS.forEach(s => {
      const el = document.getElementById(s);
      if (!el) return;
      if (s === id) {
        // Torna visível ANTES da animação para que o layout seja calculado
        el.style.visibility = 'visible';
        el.style.opacity    = '0';
        el.style.transform  = 'scale(0.97)';
        el.style.pointerEvents = 'all';
        // Força reflow
        void el.offsetWidth;
        // Anima entrada
        el.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(.34,1.1,.64,1)';
        el.style.opacity    = '1';
        el.style.transform  = 'scale(1)';
      } else {
        el.style.opacity    = '0';
        el.style.transform  = 'scale(0.97)';
        el.style.pointerEvents = 'none';
        el.style.visibility = 'hidden';
        el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      }
    });
  }

  function showIntro() {
    show('screen-intro');
  }

  function showGame() {
    show('screen-game');
    // Aguarda o próximo frame de pintura para garantir que o canvas
    // já tem dimensões reais antes de iniciar o jogo
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        Game.reset();
        Game.start();
      });
    });
  }

  function showWin() {
    Game.stop();
    show('screen-win');
    Particles.celebration(3500);
    // Após a animação de vitória, transição para a senha
    setTimeout(() => {
      showPassword();
    }, 5000);
  }

  function showPassword() {
    show('screen-password');
    // Foca o campo de senha após a transição
    setTimeout(() => {
      const input = document.getElementById('password-input');
      if (input) input.focus();
    }, 400);
  }

  function showSuccess() {
    show('screen-success');
    Particles.celebration(4000);
    setTimeout(() => {
      window.location.href = CONFIG.REDIRECT_URL;
    }, 3000);
  }

  return { showIntro, showGame, showWin, showPassword, showSuccess };
})();
