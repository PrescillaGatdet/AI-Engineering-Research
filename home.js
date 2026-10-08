/* ============================================================
   Homepage interactions:
   1. Service cards get a soft glow that follows the cursor.
   2. Service cards, research pillars and the report card fade up
      as they scroll in.
   Both are skipped for visitors who prefer reduced motion, and the
   page reads fine without this script.
   ============================================================ */

function initCardGlow() {
  document.querySelectorAll('.path').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}

function initReveal() {
  const items = document.querySelectorAll('.path, .pillar, .report-card');
  if (!('IntersectionObserver' in window)) return;

  items.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 80 + 'ms';
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      // Drop the stagger delay once revealed so hover effects stay instant.
      el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
      io.unobserve(el);
    });
  }, { threshold: 0.15 });

  items.forEach(el => io.observe(el));
}

function init() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  initCardGlow();
  initReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
