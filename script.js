/* =============================================================
   SCRIPT PRINCIPAL — Optimizado, modular y comentado
   Bloques:
   - Footer dinámico (año)
   - Tema (toggle dark/light con persistencia)
   - Sidebar (móvil)
   - Submenú "Proyectos"
   - Submenú "Backend" (NUEVO)
   - Router por hash (#seccion)
   - Backend: Lectura (fetch) (NUEVO)
   - Backend: Insertar (POST fetch) (NUEVO)
   - Formulario "Contáctame"
   ============================================================= */

/* ===== Footer dinámico (año actual) ===== */
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ===== Tema (toggle dark/light con persistencia en localStorage) ===== */
(() => {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  const isDark = () => root.getAttribute('data-theme') === 'dark';
  const setIcon = () => { if (btn) btn.innerHTML = isDark() ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>'; };
  setIcon();
  btn?.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setIcon();
  });
})();

/* ===== Sidebar móvil: abrir/cerrar ===== */
(() => {
  const sidebar = document.getElementById('sidebar');
  const btnSidebar = document.getElementById('btnSidebar');
  if (!sidebar || !btnSidebar) return;
  btnSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    btnSidebar.setAttribute('aria-expanded', sidebar.classList.contains('open'));
  });
})();

/* ===== Submenú "Proyectos" (plegable) ===== */
(() => {
  const projToggle = document.getElementById('projToggle');
  const projMenu = document.getElementById('projMenu');
  if (!projToggle || !projMenu) return;
  projToggle.addEventListener('click', () => {
    const expanded = projToggle.getAttribute('aria-expanded') === 'true';
    projToggle.setAttribute('aria-expanded', String(!expanded));
    if (expanded) { projMenu.classList.remove('open'); setTimeout(()=>projMenu.setAttribute('hidden',''),220); }
    else { projMenu.removeAttribute('hidden'); projMenu.offsetHeight; projMenu.classList.add('open'); }
  });
})();

/* ===== Submenú "Backend" (plegable, NUEVO) ===== */
(() => {
  const toggle = document.getElementById('backendToggle');
  const menu = document.getElementById('backendMenu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    if (expanded) { menu.classList.remove('open'); setTimeout(()=>menu.setAttribute('hidden',''),220); }
    else { menu.removeAttribute('hidden'); menu.offsetHeight; menu.classList.add('open'); }
  });
})();

/* ===== Router simple por hash (#seccion) ===== */
(() => {
  const links = document.querySelectorAll('.menu-item');
  const sections = document.querySelectorAll('.section');
  const sidebar = document.getElementById('sidebar');
  const btnSidebar = document.getElementById('btnSidebar');

  const showSection = (id) => {
    sections.forEach(s => s.classList.toggle('visible', s.id === id));
    links.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    if (window.matchMedia('(max-width: 840px)').matches) {
      sidebar?.classList.remove('open');
      btnSidebar?.setAttribute('aria-expanded', 'false');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Disparadores al entrar a ciertas secciones
    if (id === 'backend-lectura') cargarVentas();
  };

  const routeFromHash = () => {
    const id = (location.hash.replace('#', '') || 'Presentacion');
    const exists = [...sections].some(s => s.id === id);
    showSection(exists ? id : 'Presentacion');
  };

  window.addEventListener('hashchange', routeFromHash);
  routeFromHash();
})();

/* =============================================================
   BACKEND — Lectura (fetch a api/ventas_list.php)
   - Renderiza tabla
   - Búsqueda cliente
   - Export CSV
   ============================================================= */
async function cargarVentas() {
  const msg = document.getElementById('ventasMsg');
  const tbody = document.querySelector('#tablaVentas tbody');
  const search = document.getElementById('ventasSearch');
  if (!tbody) return;

  // Estado inicial
  msg.textContent = 'Cargando…';
  tbody.innerHTML = '';

  try {
    const res = await fetch('api/ventas_list.php', { cache: 'no-store' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Error desconocido');

    // Render filas
    for (const r of json.data) {
      const tr = document.createElement('tr');
      let f = r.fechaventa || '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(f)) {
        const d = new Date(f + 'T00:00:00');
        f = String(d.getDate()).padStart(2,'0') + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + d.getFullYear();
      }
      tr.innerHTML = `
        <td><span class="badge">${r.id}</span></td>
        <td>${escapeHTML(r.vendedor)}</td>
        <td class="text-secondary">${escapeHTML(r.direccion)}</td>
        <td>${f}</td>
      `;
      tbody.appendChild(tr);
    }

    msg.textContent = json.data.length ? `Total: ${json.data.length}` : 'Sin registros';
    // Filtro en vivo
    if (search && !search.dataset.bound) {
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        for (const tr of tbody.rows) {
          tr.style.display = tr.innerText.toLowerCase().includes(q) ? '' : 'none';
        }
      });
      search.dataset.bound = '1';
    }

    // Botones
    document.getElementById('btnRefrescar')?.addEventListener('click', cargarVentas, { once: true });
    document.getElementById('btnCSV')?.addEventListener('click', exportCSV);

  } catch (e) {
    msg.textContent = 'Error: ' + e.message;
  }
}

// Util: escapar HTML
function escapeHTML(s){ return String(s ?? '').replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

// Exportar CSV respetando filtro
function exportCSV() {
  const tbody = document.querySelector('#tablaVentas tbody');
  if (!tbody) return;
  const rows = [['ID','Vendedor','Dirección','Fecha venta']];
  for (const tr of tbody.rows) {
    if (tr.style.display === 'none') continue;
    const tds = tr.querySelectorAll('td');
    if (tds.length >= 4) rows.push([tds[0].innerText.trim(), tds[1].innerText.trim(), tds[2].innerText.trim(), tds[3].innerText.trim()]);
  }
  const csv = rows.map(r => r.map(v => `"${v.replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'ventas.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* =============================================================
   BACKEND — Insertar (POST a api/ventas_insert.php)
   - Valida HTML5
   - Envía por fetch
   - Da feedback
   - Refresca listado si procede
   ============================================================= */
(() => {
  const form = document.getElementById('formInsertar');
  const msg  = document.getElementById('insertMsg');
  if (!form || !msg) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    if (!form.checkValidity()) {
      msg.textContent = 'Completa todos los campos.';
      msg.style.color = 'var(--error)';
      return;
    }

    try {
      const fd = new FormData(form);
      const res = await fetch('api/ventas_insert.php', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Error en inserción');

      msg.textContent = '✅ Insertado correctamente';
      msg.style.color = 'var(--primary)';
      form.reset();

      // Si el usuario tenía abierto el listado, refrescar
      if (location.hash.replace('#','') === 'backend-lectura') {
        cargarVentas();
      }
    } catch (err) {
      msg.textContent = '❌ ' + err.message;
      msg.style.color = 'var(--error)';
    }
  });
})();

/* ===== Formulario "Contáctame": validación + feedback ===== */
(() => {
  const form = document.getElementById('contactameForm');
  const msg = document.getElementById('contactameMsg');
  if (!form || !msg) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      msg.textContent = 'Por favor completa todos los campos correctamente.';
      msg.style.color = 'var(--error)';
      return;
    }
    msg.textContent = '¡Mensaje enviado correctamente!';
    msg.style.color = 'var(--primary)';
    form.reset();
  });
})();
