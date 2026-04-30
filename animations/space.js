// animations/space.js
(function () {
  'use strict';

  /* ─── Config ─────────────────────────────────────────────── */
  const config = {
    starCount: 450,           // More stars for a fuller feel
    bgTop: '#020617',         // Deep dark sky top
    bgBottom: '#0f172a',      // Sky bottom (Matches --bg-primary)
    lightBgTop: '#fffbeb',    // Very light amber
    lightBgBottom: '#faf8f5'  // Matches --bg-primary in light mode
  };

  /* ─── State ──────────────────────────────────────────────── */
  let stars = [];
  let scrollPct = 0;
  let lastTime = 0;

  /* ─── Helpers ─────────────────────────────────────────────── */
  function rand(min, max) { return min + Math.random() * (max - min); }
  
  function pickStarColor() {
    const palette = [
      'rgba(255,255,255,',
      'rgba(255,240,180,', // Amber tint
      'rgba(255,220,150,', // Stronger amber
      'rgba(245,158,11,',  // Theme accent
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  /* ─── Init Functions ──────────────────────────────────────── */
  function initStars() {
    stars = [];
    for (let i = 0; i < config.starCount; i++) {
      const r = rand(0.4, 2.2);
      stars.push({
        x: rand(0, 1),
        y: rand(0, 2), // Spread over twice the screen height for smooth parallax
        r: r,
        parallax: r * 0.15 + rand(0.02, 0.05), // Bigger stars move faster
        alpha: rand(0.3, 1.0),
        twinkleSpeed: rand(0.002, 0.008),
        twinklePhase: rand(0, Math.PI * 2),
        color: pickStarColor(),
      });
    }
  }

  /* ─── Draw Functions ──────────────────────────────────────── */
  function drawSky(ctx, width, height, isDark) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    if (isDark) {
      grad.addColorStop(0, config.bgTop);
      grad.addColorStop(1, config.bgBottom);
    } else {
      grad.addColorStop(0, config.lightBgTop);
      grad.addColorStop(1, config.lightBgBottom);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  function drawStars(ctx, width, height, t) {
    for (const s of stars) {
      const twinkle = 0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
      const a = s.alpha * (0.5 + 0.5 * twinkle);
      
      const px = s.x * width;
      // Apply parallax based on scroll
      // We use modulo to keep stars looping smoothly
      let py = (s.y * height - (scrollPct * s.parallax * height)) % (height * 2);
      if (py < 0) py += height * 2;
      
      // Only draw if on screen
      if (py < height) {
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color + a.toFixed(3) + ')';
        ctx.fill();
        
        // Add subtle glow to larger stars
        if (s.r > 1.5) {
          ctx.shadowColor = s.color + '0.5)';
          ctx.shadowBlur = s.r * 2;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  /* ─── Registration ────────────────────────────────────────── */
  window.bgAnimations = window.bgAnimations || {};
  window.bgAnimations['space'] = {
    setup: function (canvas, ctx, width, height) {
      initStars();
      lastTime = performance.now();

      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollPct = Math.min(1, scrollY / scrollMax);
    },
    draw: function (ctx, width, height, isDark) {
      const now = performance.now();
      lastTime = now;

      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollPct = Math.min(1, scrollY / scrollMax);

      ctx.clearRect(0, 0, width, height);
      drawSky(ctx, width, height, isDark);
      drawStars(ctx, width, height, now);
    }
  };

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    scrollPct = Math.min(1, scrollY / scrollMax);
  }, { passive: true });

})();
