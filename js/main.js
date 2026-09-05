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
