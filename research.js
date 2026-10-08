/* ============================================================
   Research page: filter the publications list by type.
   Without JS every publication is simply listed.
   ============================================================ */

function initPublicationFilters() {
  const buttons = document.querySelectorAll('.pub-filter');
  const pubs = document.querySelectorAll('#pubs .pub');
  const empty = document.getElementById('pubsEmpty');
  if (!buttons.length || !pubs.length) return;

  function apply(filter) {
    let shown = 0;
    pubs.forEach(pub => {
      const match = filter === 'all' || pub.dataset.type === filter;
      pub.hidden = !match;
      if (match) shown++;
    });
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    if (empty) empty.hidden = shown > 0;
  }

  buttons.forEach(b => b.addEventListener('click', () => apply(b.dataset.filter)));

  const reset = document.querySelector('[data-filter-reset]');
  if (reset) reset.addEventListener('click', () => apply('all'));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPublicationFilters);
} else {
  initPublicationFilters();
}
