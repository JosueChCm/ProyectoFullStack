// Botón abrir/cerrar en móvil
const btnToggle = document.getElementById('sidebarToggle');
const sidebar   = document.getElementById('sidebar');
const collapse  = document.getElementById('collapseSidebar');
const links     = Array.from(document.querySelectorAll('.nav-link'));

// Abrir/cerrar drawer móvil
btnToggle.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  btnToggle.setAttribute('aria-expanded', String(open));
});

// Cerrar el sidebar tras navegar (solo en móvil)
links.forEach(a => {
  a.addEventListener('click', e => {
    // scroll suave con scrollIntoView para evitar "salto"
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // cerrar drawer en móviles
    if (window.matchMedia('(max-width: 900px)').matches) {
      sidebar.classList.remove('open');
      btnToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// Scrollspy con IntersectionObserver
const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.id;
    const link = map.get(id);
    if (!link) return;
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      history.replaceState(null, '', `#${id}`); // actualiza hash sin saltar
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0.01 });

document.querySelectorAll('main .section').forEach(sec => observer.observe(sec));

// Atajo de teclado: Ctrl/Cmd + B para abrir/cerrar en móvil
window.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'b') {
    e.preventDefault();
    const open = sidebar.classList.toggle('open');
    btnToggle.setAttribute('aria-expanded', String(open));
  }
});

// Contraer/expandir sidebar en desktop
collapse.addEventListener('click', (e) => {
  e.preventDefault();
  document.body.classList.toggle('sidebar-collapsed');
});
