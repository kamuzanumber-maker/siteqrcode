/* ================================================================
   MAIN.JS — Orquestração: intro → loading → senha → sucesso
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Partículas de fundo */
  Particles.startAmbient();

  /* Áudio */
  Audio.init();

  /* Senha */
  Password.init();

  /* Tela inicial */
  Screens.showIntro();

  /* Botão Começar */
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      Audio.start();
      // Mostra botão de música
      const musicBtn = document.getElementById('music-btn');
      if (musicBtn) musicBtn.style.display = 'flex';
      // Vai para o loading
      Screens.showLoading(() => {
        Screens.showPassword();
      });
    });
  }

});
