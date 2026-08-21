/* ================================================================
   PARTICLES.JS — Sistema de partículas (corações, estrelas, brilhos)
   ================================================================ */

const Particles = (() => {
  const SYMBOLS = ['♡', '✦', '✧', '⋆', '˚', '❀', '✿', '·', '★', '💕'];

  /* Emite partículas a partir de uma posição (px, py) no viewport */
  function burst(px, py, count = 10, container = document.body) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'particle-burst';
      el.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

      const angle = (Math.random() * 360);
      const dist  = 40 + Math.random() * 80;
      const dx    = Math.cos(angle * Math.PI / 180) * dist;
      const dy    = Math.sin(angle * Math.PI / 180) * dist;
      const size  = 0.7 + Math.random() * 0.9;
      const dur   = 600 + Math.random() * 600;

      Object.assign(el.style, {
        position:   'fixed',
        left:       px + 'px',
        top:        py + 'px',
        fontSize:   size + 'rem',
        color:      `hsl(${300 + Math.random() * 80}, 80%, 70%)`,
        pointerEvents: 'none',
        zIndex:     9999,
        transition: `transform ${dur}ms ease-out, opacity ${dur}ms ease-out`,
        transform:  'translate(-50%,-50%)',
        opacity:    1,
        userSelect: 'none',
      });

      document.body.appendChild(el);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.2)`;
          el.style.opacity   = '0';
        });
      });

      setTimeout(() => el.remove(), dur + 50);
    }
  }

  /* Partículas flutuantes de fundo (ambiente) */
  function startAmbient(container) {
    const c = container || document.getElementById('particles-ambient');
    if (!c) return;
    const AMBI = ['✦', '✧', '♡', '˚', '·', '⋆', '❀', '◦'];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'particle-ambient';
      el.textContent = AMBI[Math.floor(Math.random() * AMBI.length)];
      Object.assign(el.style, {
        left:              Math.random() * 100 + '%',
        animationDuration: (10 + Math.random() * 16) + 's',
        animationDelay:    (Math.random() * 14) + 's',
        fontSize:          (0.5 + Math.random() * 1) + 'rem',
        color:             `hsl(${290 + Math.random() * 90}, 75%, 72%)`,
      });
      c.appendChild(el);
    }
  }

  /* Chuva de partículas para a tela de vitória */
  function celebration(duration = 3000) {
    const end = Date.now() + duration;
    const iv = setInterval(() => {
      if (Date.now() > end) { clearInterval(iv); return; }
      burst(
        Math.random() * window.innerWidth,
        Math.random() * window.innerHeight * 0.6,
        6
      );
    }, 120);
  }

  return { burst, startAmbient, celebration };
})();
