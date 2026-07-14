/* ============================================================
   Shared site chrome (header + footer) for every page.
   Injected with JS so there's a single source of truth and
   it works even when pages are opened directly from disk.
   ============================================================ */

// ---- Configuration you can edit in one place ----
const SITE = {
  email: 'hello@northfront.ai',          // <-- your real contact email
  brand: 'Northfront',
  brandAccent: 'AI',
};

// Primary navigation: label + target file
const NAV = [
  { label: 'Services', href: 'services.html' },
  { label: 'Research', href: 'research.html' },
  { label: 'Pricing',  href: 'pricing.html' },
  { label: 'About',    href: 'about.html' },
  { label: 'Contact',  href: 'contact.html' },
];

// Footer column definitions
const FOOT_LINKS = [
  {
    title: 'Services',
    links: [
      { label: 'AI Research',        href: 'ai-research.html' },
      { label: 'Career Consulting',  href: 'career-consulting.html' },
      { label: 'Small-Business AI',  href: 'small-business.html' },
      { label: 'AI Consulting',      href: 'ai-consulting.html' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About',    href: 'about.html' },
      { label: 'Research', href: 'research.html' },
      { label: 'Pricing',  href: 'pricing.html' },
      { label: 'Contact',  href: 'contact.html' },
    ],
  },
];

// Current page filename (e.g. "services.html"); defaults to index.
function currentPage() {
  const path = window.location.pathname.split('/').pop();
  return path && path.length ? path : 'index.html';
}

function buildHeader() {
  const here = currentPage();
  const logo = `<a href="index.html" class="logo"><span class="mark">N</span> ${SITE.brand}<span class="logo-accent">${SITE.brandAccent}</span></a>`;

  const navItems = NAV.map(item => {
    const active = item.href === here ? ' class="active"' : '';
    return `<a href="${item.href}"${active}>${item.label}</a>`;
  }).join('\n        ');

  return `
  <div class="wrap nav-inner">
    ${logo}
    <nav class="nav-links" id="navlinks">
        ${navItems}
    </nav>
    <div class="nav-cta">
      <a href="research.html" class="btn btn-ghost">Read our research</a>
      <a href="contact.html" class="btn btn-primary">Book a consultation</a>
      <button class="burger" id="burger" aria-label="Toggle menu" aria-expanded="false">☰</button>
    </div>
  </div>`;
}

function buildFooter() {
  const cols = FOOT_LINKS.map(col => `
        <div>
          <h4>${col.title}</h4>
          <ul>
            ${col.links.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('\n            ')}
          </ul>
        </div>`).join('');

  return `
  <div class="wrap">
    <div class="foot-grid">
      <div style="max-width:320px">
        <div class="logo"><span class="mark">N</span> ${SITE.brand}<span class="logo-accent">${SITE.brandAccent}</span></div>
        <p>Canada's AI transition partner. Putting Canadians on the front line of innovation.</p>
      </div>
      <div class="foot-links">${cols}
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
            <li>Canada · EN / FR</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© <span id="yr"></span> ${SITE.brand} ${SITE.brandAccent}. All rights reserved.</span>
      <span class="disclaim">Working draft site. Brand name, contact email and pricing are placeholders — edit components.js and the page content.</span>
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
