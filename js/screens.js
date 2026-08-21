/* ================================================================
   SCREENS.JS — Gerenciamento de telas
   Fluxo: intro → loading → senha → sucesso (iframe)
   ================================================================ */

const Screens = (() => {
  const ALL = ['screen-intro','screen-loading','screen-password','screen-success'];

  function show(id) {
    ALL.forEach(s => {
      const el = document.getElementById(s);
      if (!el) return;
      if (s === id) {
        el.style.visibility  = 'visible';
        el.style.opacity     = '0';
        el.style.transform   = 'scale(0.97)';
        el.style.pointerEvents = 'all';
        void el.offsetWidth;
        el.style.transition  = 'opacity 0.45s ease, transform 0.45s cubic-bezier(.34,1.1,.64,1)';
        el.style.opacity     = '1';
        el.style.transform   = 'scale(1)';
      } else {
        el.style.transition  = 'opacity 0.3s ease';
        el.style.opacity     = '0';
        el.style.pointerEvents = 'none';
        setTimeout(() => { el.style.visibility = 'hidden'; }, 350);
      }
    });
  }

  /* ── Tela inicial ── */
  function showIntro() { show('screen-intro'); }

  /* ── Loading: 8-12 segundos, barra de progresso ── */
  function showLoading(onDone) {
    show('screen-loading');

    const bar   = document.getElementById('progress-bar');
    const cat   = document.querySelector('.progress-cat');
    const wrap  = document.getElementById('progress-bar-wrap');
    const texts = [
      'preparando a surpresa',
      'acordando o gatinho',
      'espalhando corações',
      'quase lá',
      'abrindo a surpresa',
    ];
    let textIdx = 0;
    const textEl = document.getElementById('loading-text');

    // Duração aleatória entre 8000 e 12000ms
    const total = 8000 + Math.random() * 4000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const pct     = Math.min(elapsed / total, 1);

      // Atualiza barra
      const pctStr = (pct * 100).toFixed(1) + '%';
      if (bar) bar.style.width = pctStr;
      if (cat) {
        cat.style.setProperty('--prog', pctStr);
        cat.style.right = `calc(${100 - pct * 100}% - 8px)`;
      }
      if (wrap) wrap.setAttribute('aria-valuenow', Math.round(pct * 100));

      // Muda texto a cada 20%
      const newIdx = Math.min(Math.floor(pct * texts.length), texts.length - 1);
      if (newIdx !== textIdx) {
        textIdx = newIdx;
        if (textEl) {
          textEl.style.opacity = '0';
          setTimeout(() => {
            const span = textEl.querySelector('.loading-dots');
            textEl.innerHTML = texts[textIdx];
            const newSpan = document.createElement('span');
            newSpan.className = 'loading-dots';
            textEl.appendChild(newSpan);
            textEl.style.opacity = '1';
          }, 200);
        }
      }

      if (pct < 1) {
        requestAnimationFrame(tick);
      } else {
        // Barra cheia — pequena pausa e vai para a senha
        setTimeout(onDone, 400);
      }
    }

    requestAnimationFrame(tick);
  }

  /* ── Senha ── */
  function showPassword() {
    show('screen-password');
    setTimeout(() => {
      const inp = document.getElementById('password-input');
      if (inp) inp.focus();
    }, 450);
  }

  /* ── Sucesso + iframe ── */
  function showSuccess(redirectUrl) {
    show('screen-success');
    Particles.celebration(3500);

    const splash   = document.getElementById('success-splash');
    const frame    = document.getElementById('nextcloud-frame');
    const fallback = document.getElementById('iframe-fallback');
    const fbLink   = document.getElementById('fallback-link');

    // Após 2.5s tenta carregar o iframe
    setTimeout(() => {
      if (!frame) return;

      // Define o src
      frame.src = redirectUrl;
      if (fbLink) fbLink.href = redirectUrl;

      // Detecta se o iframe bloqueou (erro de X-Frame-Options)
      // A forma mais confiável: ouvir 'load' e checar se o conteúdo está acessível
      const timeout = setTimeout(() => {
        // Se demorou mais de 8s sem carregar, mostra fallback
        showFallback(splash, frame, fallback);
      }, 8000);

      frame.addEventListener('load', () => {
        clearTimeout(timeout);
        try {
          // Tenta acessar o contentDocument — se bloqueado lança exceção
          const doc = frame.contentDocument || frame.contentWindow.document;
          if (!doc || doc.URL === 'about:blank') throw new Error('blank');
          // Carregou OK — mostra iframe
          if (splash)   splash.style.display = 'none';
          if (frame)    frame.style.display  = 'block';
          if (fallback) fallback.style.display = 'none';
          // Esconde partículas para não sujar o iframe
          document.body.style.overflow = 'hidden';
        } catch {
          // Bloqueado por X-Frame-Options — mostra fallback
          showFallback(splash, frame, fallback);
        }
      });

      frame.addEventListener('error', () => {
        clearTimeout(timeout);
        showFallback(splash, frame, fallback);
      });

    }, 2500);
  }

  function showFallback(splash, frame, fallback) {
    if (splash)   splash.style.display  = 'none';
    if (frame)    frame.style.display   = 'none';
    if (fallback) fallback.style.display = 'flex';
  }

  return { showIntro, showLoading, showPassword, showSuccess };
})();
