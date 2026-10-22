// Site nav: every page has an empty <nav class="site-nav"></nav>, and this
// script fills it in — so the links live in one place — then highlights
// the current section and wires up the slide-out menu.
const NAV_LINKS = [
  { href: 'projects.html', label: 'PROJECTS' },
  { href: 'designs.html',  label: 'DESIGNS' },
  { href: 'about.html',    label: 'ABOUT' },
  { href: 'contact.html',  label: 'CONTACT' },
];

document.addEventListener('DOMContentLoaded', function () {
  const nav = document.querySelector('nav.site-nav');
  if (!nav) return;

  // Project detail pages count as being inside PROJECTS.
  let page = location.pathname.split('/').pop() || 'index.html';
  if (page.startsWith('project-')) page = 'projects.html';

  nav.setAttribute('aria-label', 'Main');
  nav.innerHTML = `
    <a class="brand" href="index.html">Number<span>9</span>3852</a>
    <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="navMenu">
      <span></span><span></span><span></span>
    </button>
    <div class="nav-overlay" id="navOverlay"></div>
    <div class="nav-right" id="navMenu">
      ${NAV_LINKS.map(l => {
        const active = l.href === page;
        return `<a href="${l.href}"${active ? ' class="is-active" aria-current="page"' : ''}>${l.label}</a>`;
      }).join('')}
    </div>`;

  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const overlay = document.getElementById('navOverlay');

  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    overlay.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
    menu.classList.add('open');
    toggle.classList.add('open');
    overlay.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }
  toggle.addEventListener('click', function () {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });
  overlay.addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
});
