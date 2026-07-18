/* ============================================================
   Wires every `<form class="newsletter-form" data-source="...">`
   on the page to POST /api/subscribe. Shared by ai-workforce-report.html
   and research.html so the logic lives in one place.
   ============================================================ */

function wireNewsletterForm(form) {
  const source = form.dataset.source || null;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = (form.querySelector('[name="email"]')?.value || '').trim();
    const company = (form.querySelector('[name="company"]')?.value || '').trim(); // honeypot

    const okMsg = form.querySelector('.ok-msg');
    const errMsg = form.querySelector('.err-msg');
    const button = form.querySelector('button[type="submit"]');

    if (button) button.disabled = true;

    let ok = false;
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, company }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }

    if (button) button.disabled = false;

    if (ok) {
      if (errMsg) errMsg.style.display = 'none';
      if (okMsg) okMsg.style.display = 'block';
      form.reset();
    } else {
      if (okMsg) okMsg.style.display = 'none';
      if (errMsg) errMsg.style.display = 'block';
    }
  });
}

function init() {
  document.querySelectorAll('form.newsletter-form').forEach(wireNewsletterForm);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
