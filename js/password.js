/* ================================================================
   PASSWORD.JS — Lógica da tela de senha
   ================================================================ */

const Password = (() => {

  function init() {
    const form    = document.getElementById('password-form');
    const input   = document.getElementById('password-input');
    const toggle  = document.getElementById('toggle-password');
    const message = document.getElementById('password-message');

    if (!form) return;

    /* Mostrar / ocultar senha */
    if (toggle) {
      toggle.addEventListener('click', () => {
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        toggle.textContent = isPass ? '🙈' : '👁️';
        toggle.setAttribute('aria-label', isPass ? 'Ocultar senha' : 'Mostrar senha');
        input.focus();
      });
    }

    /* Limpa mensagem ao digitar */
    input.addEventListener('input', () => clearMessage(message));

    /* Submit */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const value = input.value.trim();

      if (!value) {
        showMessage(message, 'Por favor, digite a senha ♡', 'error');
        return;
      }

      const btn = form.querySelector('.btn-unlock');
      setLoading(btn, true);
      clearMessage(message);

      if (CONFIG.USE_WORKER) {
        await verifyWithWorker(value, message, btn, input);
      } else {
        await verifyFrontend(value, message, btn, input);
      }
    });
  }

  /* ── Verificação frontend (Opção A) ── */
  async function verifyFrontend(value, message, btn, input) {
    await sleep(350);
    if (value === CONFIG.PASSWORD) {
      onSuccess(message);
    } else {
      onError(message, btn, input);
    }
  }

  /* ── Verificação via Cloudflare Worker (Opção B) ── */
  async function verifyWithWorker(value, message, btn, input) {
    try {
      const res  = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      });
      const data = await res.json();
      if (data.ok) {
        onSuccess(message, data.redirectUrl);
      } else {
        onError(message, btn, input);
      }
    } catch {
      setLoading(btn, false);
      showMessage(message, 'Erro de conexão. Tente novamente ♡', 'error');
    }
  }

  function onSuccess(message, redirectUrl) {
    showMessage(message, 'Acertou! ♡', 'success');
    const rect = document.getElementById('screen-password').getBoundingClientRect();
    Particles.burst(rect.width / 2, rect.height / 2, 20);
    setTimeout(() => Screens.showSuccess(), 1200);
  }

  function onError(message, btn, input) {
    setLoading(btn, false);
    showMessage(message, 'Ops... essa não é a senha 🥺', 'error');
    shake(input.closest('.input-wrap') || input);
    input.value = '';
    input.focus();
  }

  /* ── Helpers ── */
  function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className   = `password-message ${type} show`;
  }

  function clearMessage(el) {
    if (!el) return;
    el.className = 'password-message';
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.classList.toggle('loading', loading);
    btn.querySelector('.btn-text').style.display  = loading ? 'none' : '';
    btn.querySelector('.btn-spinner').style.display = loading ? 'block' : 'none';
  }

  function shake(el) {
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  return { init };
})();
