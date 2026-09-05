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

// Custom cursor dot (desktop only)
const cursorDot = document.getElementById('cursorDot');
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  window.addEventListener('mousemove', (e) => {
    cursorDot.style.opacity = '1';
    cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
  });

  document.querySelectorAll('a, button, .work__item, .testimonial').forEach(el => {
    el.addEventListener('mouseenter', () => cursorDot.classList.add('cursor-dot--hover'));
    el.addEventListener('mouseleave', () => cursorDot.classList.remove('cursor-dot--hover'));
  });
}
