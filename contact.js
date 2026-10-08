/* ============================================================
   Contact page behaviour:
   1. Loads a Calendly inline scheduler IF you've set your link.
   2. Otherwise shows a friendly placeholder with setup steps.
   3. Wires the fallback "prefer email" form to a prefilled mailto.
   ============================================================ */

// 👉 Paste your Calendly (or Cal.com) scheduling link here to go live.
//    Example: 'https://calendly.com/your-name/consultation'
const SCHEDULER_URL = 'https://calendly.com/YOUR-LINK/consultation';

// Must match the email in components.js (SITE.email)
const CONTACT_EMAIL = 'hello@northfront.ai';

function initScheduler() {
  const mount = document.getElementById('scheduler');
  if (!mount) return;

  const isPlaceholder = SCHEDULER_URL.includes('YOUR-LINK');

  if (isPlaceholder) {
    mount.classList.add('scheduler-placeholder');
    mount.innerHTML =
      '<div>' +
        '<div class="big">📅</div>' +
        '<h3 style="margin-bottom:10px">Your scheduler goes here</h3>' +
        '<p style="max-width:420px;margin:0 auto 14px">' +
          'Create a free <b>Calendly</b> or <b>Cal.com</b> account, then paste your booking link into ' +
          '<code>contact.js</code> (the <code>SCHEDULER_URL</code> value). Visitors will then pick a time right here.' +
        '</p>' +
        '<p style="font-size:.86rem">Until then, use the form below — it emails us your request.</p>' +
      '</div>';
    return;
  }

  // Real link present → load Calendly's inline widget.
  mount.classList.add('calendly-inline-widget');
  mount.setAttribute('data-url', SCHEDULER_URL);

  // Note: Calendly does not publish a stable Subresource Integrity hash for
  // this asset (it updates it without notice), so a pinned `integrity`
  // attribute isn't practical here — it would break the widget on their next
  // deploy. `crossorigin` is set so the load is at least CORS-checked.
  const s = document.createElement('script');
  s.src = 'https://assets.calendly.com/assets/external/widget.js';
  s.async = true;
  s.crossOrigin = 'anonymous';
  document.body.appendChild(s);
}

function initFallbackForm() {
  const form = document.getElementById('bookForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const val = id => (document.getElementById(id)?.value || '').trim();

    const name = val('name');
    const email = val('email');
    const service = val('service');
    const field = val('field');
    const msg = val('msg');
    const company = val('company'); // honeypot — real visitors leave this blank

    const subject = encodeURIComponent('Appointment request — ' + (service || 'general'));
    const body = encodeURIComponent(
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Service: ' + service + '\n' +
      'Field/Industry: ' + field + '\n\n' +
      'Goals:\n' + msg
    );
    const mailtoUrl = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;

    const okMsg = document.getElementById('okMsg');
    const errMsg = document.getElementById('errMsg');

    let saved = false;
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, service, field, msg, company }),
      });
      saved = res.ok;
    } catch {
      saved = false;
    }

    // Always open the mailto link too — redundant delivery, no single point of failure.
    window.location.href = mailtoUrl;

    if (saved) {
      if (errMsg) errMsg.style.display = 'none';
      if (okMsg) {
        okMsg.style.display = 'block';
        okMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      if (okMsg) okMsg.style.display = 'none';
      if (errMsg) {
        errMsg.style.display = 'block';
        errMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}

// "Who are you?" buttons preselect the matching service in the form.
// A link like contact.html?audience=institution preselects on arrival.
function initAudiencePicker() {
  const buttons = document.querySelectorAll('.aud[data-audience]');
  const select = document.getElementById('service');
  if (!buttons.length || !select) return;

  function choose(btn, scroll) {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    select.value = btn.dataset.service;
    if (scroll) {
      document.getElementById('message')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('name')?.focus({ preventScroll: true });
    }
  }

  buttons.forEach(b => b.addEventListener('click', () => choose(b, true)));

  const wanted = new URLSearchParams(window.location.search).get('audience');
  const match = Array.from(buttons).find(b => b.dataset.audience === wanted);
  if (match) choose(match, false);
}

function init() {
  initScheduler();
  initFallbackForm();
  initAudiencePicker();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
