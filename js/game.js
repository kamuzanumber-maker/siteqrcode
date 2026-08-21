/* ================================================================
   GAME.JS — Motor completo do mini game do gatinho
   ================================================================ */

const Game = (() => {
  /* ── Canvas & contexto ── */
  let canvas, ctx;
  let raf = null;
  let running = false;

  /* ── Estado ── */
  let jumps = 0;
  let gameOver = false;
  let won = false;
  let frameCount = 0;
  let nextSpawnFrame = 0;  // frame em que o próximo obstáculo deve aparecer
  let bgOffset = 0;
  let groundOffset = 0;
  let starOffset = 0;
  let cloudOffset = 0;

  /* ── Gato ── */
  const CAT = {
    x: 0, y: 0,
    w: 52, h: 52,
    vy: 0,
    onGround: true,
    frame: 0,
    frameTimer: 0,
    celebrating: false,
    celebrateTimer: 0,
    jumpPressed: false,
  };

  /* ── Física ── */
  const GRAVITY    = 0.48;   // menos gravidade → mais tempo no ar
  const JUMP_FORCE = -14.5;  // pulo mais alto
  const GROUND_Y   = () => canvas.height - 80;

  /* ── Obstáculos ── */
  let obstacles = [];
  const OBS_SPEED_BASE = 2.4;  // velocidade inicial mais lenta
  let obsSpeed = OBS_SPEED_BASE;

  /* ── Nuvens ── */
  let clouds = [];

  /* ── Estrelas ── */
  let stars = [];

  /* ── Sprites CSS do gato (desenhados em canvas via SVG-string) ── */
  /* Paleta kawaii */
  const C = {
    sky1: '#1a0533',
    sky2: '#3b1060',
    sky3: '#7b3fa0',
    moon: '#fff8e1',
    star: '#ffe0f7',
    ground: '#4a2060',
    groundTop: '#7c4fa8',
    cat: '#ffd6ec',
    catDark: '#e8a0c8',
    catEye: '#2d1040',
    catNose: '#ff8fb0',
    obs: '#9b59b6',
    obsDark: '#6c3483',
    obsTop: '#f1c40f',
    cloud: 'rgba(255,220,255,0.18)',
    heart: '#ff6b9d',
    accent: '#c084fc',
  };

  /* ─────────────────────────────────────────
     Inicialização
  ───────────────────────────────────────── */
  function init(canvasEl) {
    canvas = canvasEl;
    ctx    = canvas.getContext('2d');

    // Controles registrados uma única vez
    document.addEventListener('keydown', onKey);
    canvas.addEventListener('pointerdown', onTap);
  }

  function resize() {
    if (!canvas) return;
    // Usa o wrapper pai ou cai para o viewport
    const parent = canvas.parentElement;
    const w = parent ? parent.clientWidth  : Math.min(window.innerWidth,  640);
    const h = Math.min(window.innerHeight * 0.44, 290);
    canvas.width  = Math.max(w, 300);
    canvas.height = Math.max(h, 180);
    CAT.x = Math.floor(canvas.width * 0.15);
    CAT.y = GROUND_Y() - CAT.h;
    generateStars();
    generateClouds();
  }

  function generateStars() {
    stars = [];
    const count = Math.floor(canvas.width / 20);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height * 0.55),
        r: 0.5 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03,
      });
    }
  }

  function generateClouds() {
    clouds = [];
    for (let i = 0; i < 4; i++) {
      clouds.push(makeCloud(canvas.width * (i / 3)));
    }
  }

  function makeCloud(x) {
    return {
      x,
      y: 15 + Math.random() * canvas.height * 0.25,
      w: 60 + Math.random() * 80,
      h: 20 + Math.random() * 20,
      speed: 0.3 + Math.random() * 0.4,
    };
  }

  /* ─────────────────────────────────────────
     Reset
  ───────────────────────────────────────── */
  function reset() {
    jumps      = 0;
    gameOver   = false;
    won        = false;
    obstacles  = [];
    obsSpeed   = OBS_SPEED_BASE;
    frameCount = 0;
    bgOffset   = 0;
    groundOffset = 0;
    starOffset = 0;
    cloudOffset = 0;
    nextSpawnFrame = 120; // primeiro obstáculo aparece após ~2 segundos

    CAT.vy          = 0;
    CAT.onGround    = true;
    CAT.frame       = 0;
    CAT.frameTimer  = 0;
    CAT.celebrating = false;
    CAT.y           = GROUND_Y() - CAT.h;
    CAT.jumpPressed = false;

    updateCounter();
  }

  /* ─────────────────────────────────────────
     Controles
  ───────────────────────────────────────── */
  function onKey(e) {
    if (!running) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      jump();
    }
  }

  function onTap(e) {
    if (!running) return;
    e.preventDefault();
    jump();
  }

  function jump() {
    if (gameOver || won) return;
    if (CAT.onGround) {
      CAT.vy       = JUMP_FORCE;
      CAT.onGround = false;
      CAT.jumpPressed = true;
    }
  }

  /* ─────────────────────────────────────────
     Loop principal
  ───────────────────────────────────────── */
  function start() {
    // Redimensiona PRIMEIRO — garante canvas.width/height corretos
    resize();
    // Só depois reseta o estado do jogo
    reset();
    window.addEventListener('resize', resize);
    running = true;
    if (raf) cancelAnimationFrame(raf);
    loop();
  }

  function stop() {
    running = false;
    window.removeEventListener('resize', resize);
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  function loop() {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    update();
    draw();
  }

  /* ─────────────────────────────────────────
     Update
  ───────────────────────────────────────── */
  function update() {
    if (gameOver || won) {
      if (CAT.celebrating) {
        CAT.celebrateTimer++;
        CAT.frameTimer++;
        if (CAT.frameTimer > 6) { CAT.frame = (CAT.frame + 1) % 4; CAT.frameTimer = 0; }
      }
      // continua animando fundo
      bgOffset     = (bgOffset + 0.3) % canvas.width;
      starOffset   = (starOffset + 0.2) % canvas.width;
      cloudOffset  = (cloudOffset + 0.4) % (canvas.width + 200);
      updateClouds();
      return;
    }

    frameCount++;

    /* Gato */
    if (!CAT.onGround) {
      CAT.vy += GRAVITY;
      CAT.y  += CAT.vy;
    }
    if (CAT.y >= GROUND_Y() - CAT.h) {
      CAT.y        = GROUND_Y() - CAT.h;
      CAT.vy       = 0;
      CAT.onGround = true;
    }

    /* Animação frame */
    CAT.frameTimer++;
    if (CAT.frameTimer > (CAT.onGround ? 6 : 12)) {
      CAT.frame = (CAT.frame + 1) % 4;
      CAT.frameTimer = 0;
    }

    /* Obstáculos — spawn por frame */
    if (frameCount >= nextSpawnFrame) {
      spawnObstacle();
    }

    obstacles.forEach(o => { o.x -= obsSpeed; });
    obstacles = obstacles.filter(o => o.x > -80);

    /* Colisão */
    for (const o of obstacles) {
      if (checkCollision(CAT, o)) {
        triggerGameOver();
        return;
      }
      // Pulo bem-sucedido: passou o obstáculo
      if (!o.passed && o.x + o.w < CAT.x) {
        o.passed = true;
        jumps++;
        obsSpeed = OBS_SPEED_BASE + jumps * 0.06; // aceleração muito suave
        updateCounter();
        onJumpScored(o.x + o.w / 2, CAT.y + CAT.h / 2);
        if (jumps >= CONFIG.JUMPS_NEEDED) {
          triggerWin();
          return;
        }
      }
    }

    /* Cenário */
    groundOffset = (groundOffset + obsSpeed) % 40;
    bgOffset     = (bgOffset + obsSpeed * 0.15) % canvas.width;
    starOffset   = (starOffset + 0.3) % canvas.width;
    cloudOffset  = (cloudOffset + 0.5) % (canvas.width + 200);
    updateClouds();
    updateStars();
  }

  function updateClouds() {
    clouds.forEach(c => {
      c.x -= c.speed;
      if (c.x + c.w < 0) {
        c.x = canvas.width + 20;
        c.y = 15 + Math.random() * canvas.height * 0.25;
      }
    });
  }

  function updateStars() {
    stars.forEach(s => { s.twinkle += s.speed; });
  }

  function spawnObstacle() {
    const h   = 28 + Math.floor(Math.random() * 22);
    const w   = 22 + Math.floor(Math.random() * 14);
    const obs = {
      x: canvas.width + 20,
      y: GROUND_Y() - h,
      w, h,
      passed: false,
      type: Math.random() > 0.5 ? 'crystal' : 'plant',
    };
    obstacles.push(obs);
    nextSpawnFrame = frameCount + randomObstacleGapFrames();
  }

  function randomObstacleGapFrames() {
    // A 60fps: 140 frames = ~2.3s, 200 frames = ~3.3s
    // Nos primeiros pulos dá mais tempo
    const base    = 140;
    const extra   = Math.max(0, (CONFIG.JUMPS_NEEDED - jumps) * 6);
    const variance = 60;
    return base + extra + Math.floor(Math.random() * variance);
  }

  /* ─────────────────────────────────────────
     Colisão (AABB com margem de tolerância)
  ───────────────────────────────────────── */
  function checkCollision(cat, obs) {
    const margin = 16; // margem de tolerância generosa
    return (
      cat.x + margin           < obs.x + obs.w - margin &&
      cat.x + cat.w - margin   > obs.x + margin         &&
      cat.y + margin           < obs.y + obs.h           &&
      cat.y + cat.h - margin   > obs.y
    );
  }

  /* ─────────────────────────────────────────
     Eventos de jogo
  ───────────────────────────────────────── */
  function onJumpScored(x, y) {
    // Partículas no centro do obstáculo
    const rect = canvas.getBoundingClientRect();
    Particles.burst(rect.left + x, rect.top + y, 8);
  }

  function triggerGameOver() {
    gameOver = true;
    running  = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    // Desenha um último frame com o gato "tropeçando"
    draw();
    document.getElementById('gameover-overlay').classList.remove('hidden');
    document.getElementById('gameover-overlay').classList.add('show');
  }

  function triggerWin() {
    won = true;
    CAT.celebrating = true;
    CAT.onGround = true;
    CAT.vy = 0;
    CAT.y  = GROUND_Y() - CAT.h;
    obstacles = [];
    Particles.celebration(4000);
    // Depois de 2.5s chama o callback de vitória
    setTimeout(() => {
      Screens.showWin();
    }, 2500);
  }

  function updateCounter() {
    const el = document.getElementById('jump-counter');
    if (el) {
      el.textContent = `${jumps} / ${CONFIG.JUMPS_NEEDED}`;
      el.classList.add('pop');
      setTimeout(() => el.classList.remove('pop'), 300);
    }
  }

  /* ─────────────────────────────────────────
     DRAW
  ───────────────────────────────────────── */
  function draw() {
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const GY = GROUND_Y();

    /* Fundo gradiente noturno */
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   C.sky1);
    bg.addColorStop(0.5, C.sky2);
    bg.addColorStop(1,   C.sky3);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawStars(W, H);
    drawMoon(W);
    drawClouds();
    drawGround(W, H, GY);
    drawObstacles(GY);
    drawCat(GY);
  }

  function drawStars(W, H) {
    stars.forEach(s => {
      const alpha = 0.4 + 0.5 * Math.abs(Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 220, 255, ${alpha})`;
      ctx.fill();
    });

    // Corações pequenos flutuando no fundo
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.font = '12px serif';
    ctx.fillStyle = '#ff8fb0';
    for (let i = 0; i < 5; i++) {
      const hx = ((i * W / 5) + bgOffset * 0.3) % W;
      const hy = 10 + Math.sin(frameCount * 0.02 + i) * 8 + H * 0.1 * i;
      ctx.fillText('♡', hx, hy);
    }
    ctx.restore();
  }

  function drawMoon(W) {
    const mx = W * 0.82;
    const my = 30;
    // Glow
    const glow = ctx.createRadialGradient(mx, my, 4, mx, my, 28);
    glow.addColorStop(0, 'rgba(255,240,210,0.35)');
    glow.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mx, my, 28, 0, Math.PI * 2);
    ctx.fill();

    // Lua
    ctx.beginPath();
    ctx.arc(mx, my, 14, 0, Math.PI * 2);
    ctx.fillStyle = C.moon;
    ctx.fill();

    // Carinha kawaii na lua
    ctx.fillStyle = '#c8a96e';
    ctx.font = '7px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('˘ ˘', mx + 1, my + 1);
  }

  function drawClouds() {
    clouds.forEach(c => {
      ctx.save();
      ctx.fillStyle = C.cloud;
      // Forma nuvem pixel-art
      roundRect(ctx, c.x, c.y, c.w, c.h, 12);
      ctx.fill();
      roundRect(ctx, c.x + c.w * 0.15, c.y - c.h * 0.4, c.w * 0.5, c.h * 0.65, 10);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawGround(W, H, GY) {
    // Linha do chão pixel art
    ctx.fillStyle = C.groundTop;
    ctx.fillRect(0, GY, W, 6);

    ctx.fillStyle = C.ground;
    ctx.fillRect(0, GY + 6, W, H - GY);

    // Detalhes no chão (bolinhas)
    ctx.fillStyle = 'rgba(200,140,255,0.25)';
    for (let x = -groundOffset; x < W + 40; x += 40) {
      ctx.beginPath();
      ctx.arc(x, GY + 3, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawObstacles(GY) {
    obstacles.forEach(o => {
      if (o.type === 'crystal') {
        drawCrystal(o);
      } else {
        drawPlant(o);
      }
    });
  }

  function drawCrystal(o) {
    // Cristal pixel art fofo
    ctx.save();
    ctx.fillStyle = C.obs;

    // Corpo
    ctx.beginPath();
    ctx.moveTo(o.x + o.w / 2, o.y);
    ctx.lineTo(o.x + o.w,     o.y + o.h * 0.45);
    ctx.lineTo(o.x + o.w * 0.75, o.y + o.h);
    ctx.lineTo(o.x + o.w * 0.25, o.y + o.h);
    ctx.lineTo(o.x,            o.y + o.h * 0.45);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = C.obsDark;
    ctx.beginPath();
    ctx.moveTo(o.x + o.w / 2, o.y);
    ctx.lineTo(o.x + o.w * 0.7, o.y + o.h * 0.45);
    ctx.lineTo(o.x + o.w * 0.55, o.y + o.h);
    ctx.lineTo(o.x + o.w * 0.5, o.y + o.h);
    ctx.closePath();
    ctx.fill();

    // Brilho
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.moveTo(o.x + o.w * 0.35, o.y + o.h * 0.1);
    ctx.lineTo(o.x + o.w * 0.5,  o.y + o.h * 0.05);
    ctx.lineTo(o.x + o.w * 0.45, o.y + o.h * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawPlant(o) {
    ctx.save();
    const cx = o.x + o.w / 2;
    // Vaso
    ctx.fillStyle = '#e8a0c8';
    ctx.beginPath();
    ctx.moveTo(o.x + 4, o.y + o.h);
    ctx.lineTo(o.x, o.y + o.h * 0.55);
    ctx.lineTo(o.x + o.w, o.y + o.h * 0.55);
    ctx.lineTo(o.x + o.w - 4, o.y + o.h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#c084fc';
    roundRect(ctx, o.x + 2, o.y + o.h * 0.5, o.w - 4, 8, 3);
    ctx.fill();

    // Folhas
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.ellipse(cx - 6, o.y + o.h * 0.3, 8, 14, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 6, o.y + o.h * 0.25, 7, 13, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Florzinha
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('✿', cx, o.y + o.h * 0.15);

    ctx.restore();
  }

  function drawCat(GY) {
    ctx.save();
    const cx = CAT.x + CAT.w / 2;
    const cy = CAT.y + CAT.h / 2;
    const bounceY = CAT.onGround ? Math.sin(frameCount * 0.25) * 1.5 : 0;

    if (CAT.celebrating) {
      // Gato comemora pulando
      const celebBounce = Math.abs(Math.sin(CAT.celebrateTimer * 0.15)) * 12;
      ctx.translate(cx, cy - celebBounce);
    } else {
      ctx.translate(cx, cy + bounceY);
    }

    if (gameOver) {
      // Gato "deitado" (rotacionado)
      ctx.rotate(Math.PI / 8);
      ctx.globalAlpha = 0.8;
    }

    ctx.scale(1, 1);

    const hw = CAT.w / 2;
    const hh = CAT.h / 2;

    // Sombra suave
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, hh + 4, hw * 0.7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Corpo do gato
    ctx.fillStyle = C.cat;
    ctx.beginPath();
    ctx.ellipse(0, 2, hw * 0.75, hh * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cabeça
    ctx.fillStyle = C.cat;
    ctx.beginPath();
    ctx.arc(0, -hh * 0.4, hw * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas
    ctx.fillStyle = C.cat;
    drawEar(ctx, -hw * 0.4, -hh * 0.9, -0.5);
    drawEar(ctx,  hw * 0.4, -hh * 0.9,  0.5);

    // Interior orelha
    ctx.fillStyle = C.catNose;
    ctx.globalAlpha = 0.4;
    drawEar(ctx, -hw * 0.4, -hh * 0.9 + 2, -0.4, 0.55);
    drawEar(ctx,  hw * 0.4, -hh * 0.9 + 2,  0.4, 0.55);
    ctx.globalAlpha = 1;

    // Olhos
    ctx.fillStyle = C.catEye;
    const eyeY = -hh * 0.45;
    // Olho esquerdo
    if (CAT.onGround && !gameOver) {
      // Olho normal
      ctx.beginPath();
      ctx.ellipse(-hw * 0.25, eyeY, 4, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Brilho
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-hw * 0.25 - 1.5, eyeY - 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (!gameOver) {
      // Olho fechado (pulando — feliz)
      ctx.strokeStyle = C.catEye;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(-hw * 0.25, eyeY, 4, Math.PI, Math.PI * 2);
      ctx.stroke();
    } else {
      // Olho x (game over)
      ctx.strokeStyle = C.catEye;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-hw * 0.25 - 3, eyeY - 3);
      ctx.lineTo(-hw * 0.25 + 3, eyeY + 3);
      ctx.moveTo(-hw * 0.25 + 3, eyeY - 3);
      ctx.lineTo(-hw * 0.25 - 3, eyeY + 3);
      ctx.stroke();
    }

    // Olho direito
    ctx.fillStyle = C.catEye;
    if (CAT.onGround && !gameOver) {
      ctx.beginPath();
      ctx.ellipse(hw * 0.25, eyeY, 4, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(hw * 0.25 - 1.5, eyeY - 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (!gameOver) {
      ctx.strokeStyle = C.catEye;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(hw * 0.25, eyeY, 4, Math.PI, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = C.catEye;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(hw * 0.25 - 3, eyeY - 3);
      ctx.lineTo(hw * 0.25 + 3, eyeY + 3);
      ctx.moveTo(hw * 0.25 + 3, eyeY - 3);
      ctx.lineTo(hw * 0.25 - 3, eyeY + 3);
      ctx.stroke();
    }

    // Nariz
    ctx.fillStyle = C.catNose;
    ctx.beginPath();
    ctx.ellipse(0, eyeY + 7, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bigodes
    ctx.strokeStyle = C.catDark;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(-2, eyeY + 8); ctx.lineTo(-hw * 0.8, eyeY + 6);
    ctx.moveTo(-2, eyeY + 10); ctx.lineTo(-hw * 0.8, eyeY + 12);
    ctx.moveTo(2, eyeY + 8); ctx.lineTo(hw * 0.8, eyeY + 6);
    ctx.moveTo(2, eyeY + 10); ctx.lineTo(hw * 0.8, eyeY + 12);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Bochechas
    ctx.fillStyle = C.catNose;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(-hw * 0.38, eyeY + 10, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hw * 0.38, eyeY + 10, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Patas (animação de corrida)
    drawLegs(hw, hh);

    // Cauda
    drawTail(hw, hh);

    ctx.restore();
  }

  function drawEar(ctx, ex, ey, angle, scale = 1) {
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-7 * scale, -14 * scale);
    ctx.lineTo(7 * scale, -10 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawLegs(hw, hh) {
    const legFrame = CAT.onGround ? CAT.frame : 2;
    const legAngles = [
      [0.2, -0.2, 0.3, -0.1],
      [0.3, -0.1, 0.1, -0.3],
      [0.1, -0.3, 0.4, -0.2],
      [0.4, -0.2, 0.2, -0.4],
    ];
    const [a1, a2, a3, a4] = legAngles[legFrame];

    ctx.strokeStyle = C.cat;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    // Pata traseira esquerda
    ctx.save();
    ctx.translate(-hw * 0.35, hh * 0.5);
    ctx.rotate(a1);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 14);
    ctx.stroke();
    ctx.restore();

    // Pata traseira direita
    ctx.save();
    ctx.translate(hw * 0.35, hh * 0.5);
    ctx.rotate(a2);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 14);
    ctx.stroke();
    ctx.restore();

    // Pata dianteira esquerda
    ctx.save();
    ctx.translate(-hw * 0.2, hh * 0.2);
    ctx.rotate(a3);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 12);
    ctx.stroke();
    ctx.restore();

    // Pata dianteira direita
    ctx.save();
    ctx.translate(hw * 0.2, hh * 0.2);
    ctx.rotate(a4);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 12);
    ctx.stroke();
    ctx.restore();
  }

  function drawTail(hw, hh) {
    const wag = Math.sin(frameCount * 0.18) * 0.4;
    ctx.save();
    ctx.translate(hw * 0.65, hh * 0.2);
    ctx.rotate(wag);
    ctx.strokeStyle = C.cat;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(10, -5, 18, -18, 10, -28);
    ctx.stroke();
    ctx.restore();
  }

  /* Utilitário: rect arredondado */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return { init, start, stop, reset, jump };
})();
