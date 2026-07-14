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

  const s = document.createElement('script');
  s.src = 'https://assets.calendly.com/assets/external/widget.js';
  s.async = true;
  document.body.appendChild(s);
}

function initFallbackForm() {
  const form = document.getElementById('bookForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const val = id => (document.getElementById(id)?.value || '').trim();

    const name = val('name');
    const email = val('email');
    const service = val('service');
    const field = val('field');
    const msg = val('msg');

    const subject = encodeURIComponent('Appointment request — ' + (service || 'general'));
    const body = encodeURIComponent(
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Service: ' + service + '\n' +
      'Field/Industry: ' + field + '\n\n' +
      'Goals:\n' + msg
    );

    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;

    const ok = document.getElementById('okMsg');
    if (ok) {
      ok.style.display = 'block';
      ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

function init() {
  initScheduler();
  initFallbackForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
