// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

function setMenuOpen(open) {
  mobileMenu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

navToggle.addEventListener('click', () => {
  setMenuOpen(!mobileMenu.classList.contains('open'));
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenuOpen(false));
});

// Nav background on scroll
const nav = document.getElementById('nav');
if (nav) {
  const updateNav = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 80);
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

// Scroll progress bar
const progressBar = document.getElementById('progressBar');
if (progressBar) {
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = pct + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal-fade');

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => io.observe(el));

// Animated stat counters
const statEls = document.querySelectorAll('.stat strong');
const counterIo = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    counterIo.unobserve(entry.target);
    const el = entry.target;
    const match = el.textContent.match(/^(\d+)(.*)$/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}, { threshold: 0.4 });

statEls.forEach(el => counterIo.observe(el));

// Custom 2-layer cursor (desktop only)
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (canHover && cursorDot && cursorRing) {
  window.addEventListener('mousemove', (e) => {
    const t = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    cursorDot.style.transform = t;
    cursorRing.style.transform = t;
  });

  function setCursorState(state) {
    cursorDot.classList.remove('cursor-dot--hover');
    cursorDot.textContent = '';
    cursorRing.classList.remove('cursor-ring--hidden');

    if (state === 'hover') {
      cursorDot.classList.add('cursor-dot--hover');
      cursorDot.textContent = 'CLICK';
      cursorRing.classList.add('cursor-ring--hidden');
    } else if (state === 'view') {
      cursorDot.classList.add('cursor-dot--hover');
      cursorDot.textContent = 'AJA';
      cursorRing.classList.add('cursor-ring--hidden');
    }
  }

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => setCursorState('hover'));
    el.addEventListener('mouseleave', () => setCursorState('default'));
  });

  document.querySelectorAll('.work__thumb, .testimonial, .about__photo').forEach(el => {
    el.addEventListener('mouseenter', () => setCursorState('view'));
    el.addEventListener('mouseleave', () => setCursorState('default'));
  });
}

// Dancing hero letters
const heroReveal = document.querySelector('.hero__title .reveal');
if (heroReveal) {
  heroReveal.addEventListener('animationend', () => {
    heroReveal.classList.add('overflow-visible');
  }, { once: true });
}

const danceClasses = ['dance-0', 'dance-1', 'dance-2', 'dance-3', 'dance-4', 'dance-5'];
document.querySelectorAll('.dance-letter').forEach((el, i) => {
  const cls = danceClasses[i % danceClasses.length];
  const play = () => {
    el.classList.remove(...danceClasses);
    void el.offsetWidth; // force reflow so the animation can replay
    el.classList.add(cls);
  };
  el.addEventListener('mouseenter', play);
  el.addEventListener('click', play);
  el.addEventListener('animationend', () => el.classList.remove(cls));
});

// Hero globe: 3D rotating tag-cloud sphere
const globeCanvas = document.getElementById('heroGlobe');
if (globeCanvas) {
  const ctx = globeCanvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words = [
    '--psych-bias', '--psych-empathy', '--psych-behavior', '--psych-cognition',
    '--psych-decision', '--psych-influence',
    '--strategy-growth', '--strategy-insight', '--strategy-alignment',
    '--strategy-consumer', '--strategy-brand', '--strategy-market',
    '--comms-framing', '--comms-narrative', '--comms-persuasion',
    '--comms-storytelling', '--comms-trust', '--comms-message',
    '--learn-curriculum', '--learn-workshop', '--learn-facilitation',
    '--learn-experience', '--learn-training', '--learn-design',
    '--ai-workflow', '--ai-integration', '--ai-collaboration',
    '--ai-tools', '--ai-assist', '--ai-prompt',
    '--speak-keynote', '--speak-public', '--speak-workshop',
    '--speak-stage', '--speak-voice', '--speak-coach'
  ];

  // Points laid out on latitude rings, randomly placed in longitude within
  // each ring. Rows are weighted by cos(latitude) so density stays even
  // across the sphere's surface instead of clumping near the poles (a plain
  // lat/long grid has the same point count per row even though rings near
  // the poles cover far less actual surface area).
  const targetCount = 160;
  const rows = [];
  for (let lat = -78; lat <= 78; lat += 6) rows.push(lat);
  const rowWeights = rows.map(lat => Math.cos(lat * Math.PI / 180));
  const totalWeight = rowWeights.reduce((a, b) => a + b, 0);

  const points = [];
  let wordIndex = 0;
  rows.forEach((lat, i) => {
    const latRad = lat * Math.PI / 180;
    const rowCount = Math.max(1, Math.round(targetCount * rowWeights[i] / totalWeight));
    const lons = [];
    for (let lon = 0; lon < 360; lon += 6) lons.push(lon);
    for (let j = lons.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [lons[j], lons[k]] = [lons[k], lons[j]];
    }
    lons.slice(0, Math.min(rowCount, lons.length)).forEach(lon => {
      const lonRad = lon * Math.PI / 180;
      points.push({
        x: Math.cos(latRad) * Math.cos(lonRad),
        y: Math.sin(latRad),
        z: Math.cos(latRad) * Math.sin(lonRad),
        word: words[wordIndex % words.length]
      });
      wordIndex++;
    });
  });
  const order = points.map((_, i) => i);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let cx = 0, cy = 0, sphereRadius = 0;

  function resizeGlobe() {
    const rect = globeCanvas.getBoundingClientRect();
    globeCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    globeCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = rect.width / 2;
    cy = rect.height / 2;
    sphereRadius = Math.min(rect.width, rect.height) * 0.42;
  }
  window.addEventListener('resize', () => {
    resizeGlobe();
    // Belt-and-suspenders alongside the MediaQueryList 'change' listener
    // below: some environments update matchMedia() state on resize without
    // firing a 'change' event on the MediaQueryList itself.
    if (desktopMQ.matches) startGlobe(); else stopGlobe();
  });

  let pointerX = 0, pointerY = 0, smoothX = 0, smoothY = 0;
  if (!reduceMotion) {
    window.addEventListener('pointermove', (e) => {
      pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  const CAMERA = 2.5;

  function renderFrame(t) {
    smoothX += (pointerX - smoothX) * 0.045;
    smoothY += (pointerY - smoothY) * 0.045;

    const yaw = t * 7e-5 + 0.5 * Math.sin(t * 5e-5) + smoothX * 0.38;
    const pitch = 0.22 * Math.sin(t * 7e-5 + 0.5) + 0.12 * Math.sin(t * 17e-5) + smoothY * 0.26;
    const roll = 0.14 * Math.sin(t * 4e-5 + 2.1) + smoothX * 0.05;
    const cosYaw = Math.cos(yaw), sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
    const cosRoll = Math.cos(roll), sinRoll = Math.sin(roll);

    ctx.clearRect(0, 0, cx * 2, cy * 2);

    for (const i of order) {
      const p = points[i];
      const h1 = p.x * cosYaw + p.z * sinYaw;
      const n1 = -p.x * sinYaw + p.z * cosYaw;
      const p1 = p.y * cosPitch - n1 * sinPitch;
      const depth = p.y * sinPitch + n1 * cosPitch;
      const rx = h1 * cosRoll - p1 * sinRoll;
      const ry = h1 * sinRoll + p1 * cosRoll;
      const perspectiveScale = CAMERA / (CAMERA - depth);
      p.screenX = cx + rx * sphereRadius * perspectiveScale;
      p.screenY = cy + ry * sphereRadius * perspectiveScale;
      p.depth = depth;
      p.perspectiveScale = perspectiveScale;
    }

    order.sort((a, b) => points[a].depth - points[b].depth);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const i of order) {
      const p = points[i];
      const normDepth = (p.depth + 1) / 2;
      ctx.globalAlpha = 0.05 + Math.pow(normDepth, 1.5) * 0.8;
      const fontSize = sphereRadius * 0.0117 * (1 + normDepth) * p.perspectiveScale;
      ctx.font = `500 ${fontSize}px Kanit, sans-serif`;
      ctx.fillStyle = '#6E6E72';
      ctx.fillText(p.word, p.screenX, p.screenY);
    }
    ctx.globalAlpha = 1;

    if (!reduceMotion && running) requestAnimationFrame(renderFrame);
  }

  // The globe is only meant to show at desktop widths (matches the CSS
  // breakpoint). Rather than checking this once at page load — which would
  // leave the canvas blank forever if the window is later resized wider
  // without a reload — listen for the breakpoint being crossed live.
  const desktopMQ = window.matchMedia('(min-width: 1100px)');
  let running = false;
  function startGlobe() {
    if (running) return;
    running = true;
    resizeGlobe();
    if (reduceMotion) {
      renderFrame(8000);
    } else {
      requestAnimationFrame(renderFrame);
    }
  }
  function stopGlobe() { running = false; }
  desktopMQ.addEventListener('change', (e) => { if (e.matches) startGlobe(); else stopGlobe(); });
  if (desktopMQ.matches) startGlobe();
}

// Magnetic buttons
if (canHover) {
  document.querySelectorAll('.btn, .nav__cta').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = (e.clientX - cx) * 0.35;
      const y = (e.clientY - cy) * 0.35;
      btn.classList.remove('magnetic-snap');
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.classList.add('magnetic-snap');
      btn.style.transform = 'translate(0, 0)';
    });
  });
}
