/* ============================================================
   Shared site chrome (header + footer) for every page.
   Injected with JS so there's a single source of truth and
   it works even when pages are opened directly from disk.
   ============================================================ */

// ---- Configuration you can edit in one place ----
const SITE = {
  email: 'hello@northfront.ai',          // <-- your real contact email
  brand: 'Cantana',
  wordmark: 'CANTANA',                  // how the name is set in the logo
  mark: 'C',
};

// Primary navigation: label + target file
const NAV = [
  { label: 'Research', href: 'research.html' },
  { label: 'Services', href: 'services.html' },
  { label: 'Insights', href: 'insights.html' },
  { label: 'About',    href: 'about.html' },
];

// Right-hand utility links (folded into the menu on small screens)
const NAV_UTIL = [
  { label: 'Contact', href: 'contact.html' },
  { label: 'Log in',  href: 'login.html' },
];

const NAV_CTA = { label: 'Work with us', short: 'Work with us', href: 'work-with-us.html' };

// Supabase keeps the session in localStorage under "sb-<project>-auth-token".
// Checking for it lets every page swap "Log in" for "Account" without
// loading the Supabase library. It's only a label: account.html and the
// API still verify the session properly.
function looksLoggedIn() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (/^sb-.+-auth-token$/.test(key) && localStorage.getItem(key)) return true;
    }
  } catch (e) { /* storage blocked: treat as logged out */ }
  return false;
}

function utilLinks() {
  return NAV_UTIL.map(item =>
    item.href === 'login.html' && looksLoggedIn() ? { label: 'Account', href: 'account.html' } : item
  );
}

// Footer column definitions
const FOOT_LINKS = [
  {
    title: 'Research',
    links: [
      { label: 'Research overview',          href: 'research.html' },
      { label: 'Publications',               href: 'research.html#publications' },
      { label: 'AI & the Canadian Workforce', href: 'ai-workforce-report.html' },
      { label: 'Insights',                   href: 'insights.html' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Career Consulting',  href: 'career-consulting.html' },
      { label: 'Small-Business AI',  href: 'small-business.html' },
      { label: 'Enterprise AI',      href: 'ai-consulting.html' },
      { label: 'Research Partnerships', href: 'ai-research.html' },
    ],
  },
  {
    title: 'Cantana',
    links: [
      { label: 'About',        href: 'about.html' },
      { label: 'Work with us', href: 'work-with-us.html' },
      { label: 'Contact',      href: 'contact.html' },
    ],
  },
];

// Current page filename (e.g. "services.html"); defaults to index.
function currentPage() {
  const path = window.location.pathname.split('/').pop();
  return path && path.length ? path : 'index.html';
}

// All values interpolated into the templates below are currently hardcoded
// constants (SITE/NAV/FOOT_LINKS), but they're still escaped before being
// injected via innerHTML — if this is ever parametrized with a URL query
// param, hash, or other visitor-controlled value, it stays XSS-safe.
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function buildHeader() {
  const here = currentPage();
  const logo = `<a href="index.html" class="logo"><span class="mark">${escapeHtml(SITE.mark)}</span> ${escapeHtml(SITE.wordmark)}</a>`;

  const navItems = NAV.map(item => {
    const active = item.href === here ? ' class="active"' : '';
    return `<a href="${escapeHtml(item.href)}"${active}>${escapeHtml(item.label)}</a>`;
  }).join('\n        ');

  // Utility links appear on the right on desktop, and inside the menu on mobile.
  const util = utilLinks();
  const utilItems = util.map(item => {
    const cls = 'nav-util' + (item.href === here ? ' active' : '');
    return `<a href="${escapeHtml(item.href)}" class="${cls}">${escapeHtml(item.label)}</a>`;
  }).join('\n      ');
  const utilInMenu = util.map(item =>
    `<a href="${escapeHtml(item.href)}" class="nav-secondary">${escapeHtml(item.label)}</a>`
  ).join('\n        ');

  return `
  <div class="wrap nav-inner">
    ${logo}
    <nav class="nav-links" id="navlinks">
        ${navItems}
        ${utilInMenu}
    </nav>
    <div class="nav-cta">
      ${utilItems}
      <a href="${escapeHtml(NAV_CTA.href)}" class="btn btn-primary"><span class="cta-long">${escapeHtml(NAV_CTA.label)} →</span><span class="cta-short">${escapeHtml(NAV_CTA.short)}</span></a>
      <button class="burger" id="burger" aria-label="Toggle menu" aria-expanded="false">☰</button>
    </div>
  </div>`;
}

function buildFooter() {
  const cols = FOOT_LINKS.map(col => `
        <div>
          <h4>${escapeHtml(col.title)}</h4>
          <ul>
            ${col.links.map(l => `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a></li>`).join('\n            ')}
          </ul>
        </div>`).join('');

  return `
  <div class="wrap">
    <div class="foot-grid">
      <div style="max-width:320px">
        <div class="logo"><span class="mark">${escapeHtml(SITE.mark)}</span> ${escapeHtml(SITE.wordmark)}</div>
        <p>A Canadian AI research and adoption organization. Canada leads in AI research. We help it lead in adoption.</p>
      </div>
      <div class="foot-links">${cols}
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:${escapeHtml(SITE.email)}">${escapeHtml(SITE.email)}</a></li>
            <li>Canada · EN / FR</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© <span id="yr"></span> ${escapeHtml(SITE.brand)}. All rights reserved.</span>
      <span>Research · Advisory · Adoption</span>
    </div>
  </div>`;
}

function mountChrome() {
  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'nav';
    header.innerHTML = buildHeader();
  }

  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.innerHTML = buildFooter();
  }

  // Stamp the year (footer is now in the DOM)
  const yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const burger = document.getElementById('burger');
  const links = document.getElementById('navlinks');
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      })
    );
  }
}

// Run as soon as the DOM is ready (script is loaded with `defer`,
// but guard anyway in case it's included differently).
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountChrome);
} else {
  mountChrome();
}
