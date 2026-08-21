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
        el.classList.remove('hidden');
        el.classList.add('visible');
        void el.offsetWidth; // reflow para forçar animação
        el.classList.add('anim-in');
      } else {
        el.classList.remove('visible', 'anim-in');
        el.classList.add('hidden');
      }
    });
  }

  function showIntro() {
    show('screen-intro');
  }

  function showGame() {
    show('screen-game');
    // Pequeno delay para a transição terminar antes de iniciar o jogo
    setTimeout(() => {
      Game.reset();
      Game.start();
    }, 350);
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
