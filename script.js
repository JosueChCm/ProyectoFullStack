/* ===== Utilidades generales ===== */
document.getElementById('year').textContent = new Date().getFullYear();

// Abrir/cerrar sidebar en móvil
const sidebar = document.getElementById('sidebar');
const btnSidebar = document.getElementById('btnSidebar');
btnSidebar.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  btnSidebar.setAttribute('aria-expanded', sidebar.classList.contains('open'));
});

// Enlaces del sidebar
const links = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('.section');

function showSection(id){
  sections.forEach(s => s.classList.toggle('visible', s.id === id));
  links.forEach(l => l.classList.toggle('active', l.dataset.section === id));
  // Cierra el sidebar en móvil
  if (window.matchMedia('(max-width: 840px)').matches) {
    sidebar.classList.remove('open');
    btnSidebar.setAttribute('aria-expanded', 'false');
  }
  window.scrollTo({top:0, behavior:'smooth'});
}
function routeFromHash(){
  const id = location.hash.replace('#','') || 'maquetacion';
  const exists = [...sections].some(s => s.id === id);
  showSection(exists ? id : 'maquetacion');
}
window.addEventListener('hashchange', routeFromHash);
routeFromHash();

/* ===== Demo: Maquetación (Grid) ===== */
const grid = document.getElementById('layoutGrid');
document.querySelectorAll('#maquetacion .btn[data-cols]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const cols = btn.getAttribute('data-cols');
    grid.classList.remove('cols-2','cols-3','cols-4');
    grid.classList.add(`cols-${cols}`);
  });
});

/* ===== Demo: CSS3 (variables) ===== */
const radiusRange = document.getElementById('radiusRange');
const primarySelect = document.getElementById('primarySelect');

radiusRange.addEventListener('input', (e)=>{
  const value = e.target.value;
  document.documentElement.style.setProperty('--radius', `${value}px`);
});

primarySelect.addEventListener('change', (e)=>{
  const color = e.target.value;
  document.documentElement.style.setProperty('--primary', color);
  // genera un tono más oscuro básico para hover/bordes
  // (no perfecto, pero suficiente para la demo)
  document.documentElement.style.setProperty('--primary-600', color);
});

/* ===== Demo: JavaScript (contador + reloj) ===== */
const countEl = document.getElementById('count');
let count = 0;
const setCount = (n)=>{ count = n; countEl.textContent = count; };

document.getElementById('inc').addEventListener('click', ()=> setCount(count + 1));
document.getElementById('dec').addEventListener('click', ()=> setCount(count - 1));
document.getElementById('reset').addEventListener('click', ()=> setCount(0));

function pad(n){ return String(n).padStart(2,'0'); }
function tickClock(){
  const d = new Date();
  const t = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  document.getElementById('clock').textContent = t;
}
tickClock();
setInterval(tickClock, 1000);
