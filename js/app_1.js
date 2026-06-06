/* ========================================
   AURENZA TRAVEL - Lógica principal
   Arquitectura Jason-driven
   Todo el contenido viene de /datos/*.json
   ======================================== */

// Estado global de la aplicación
const estado = {
  tours: [],
  paquetes: [],
  filtroActual: 'todos'
};

// Utilidad: crear elemento con clases
function crearElemento(etiqueta, clases = '', texto = '') {
  const el = document.createElement(etiqueta);
  if (clases) el.className = clases;
  if (texto) el.textContent = texto;
  return el;
}

// Cargar datos JSON
async function cargarDatos() {
  try {
    const [toursRes, paquetesRes] = await Promise.all([
      fetch('datos/tours.json'),
      fetch('datos/paquetes.json')
    ]);
    estado.tours = await toursRes.json();
    estado.paquetes = await paquetesRes.json();
    inicializar();
  } catch (error) {
    console.error('Error cargando datos:', error);
  }
}

// Inicializar componentes
function inicializar() {
  renderizarHero();
  renderizarDestinos();
  renderizarTours();
  renderizarPaquetes();
  configurarMenu();
  configurarFiltros();
  configurarModal();
  configurarFormulario();
}

// Hero slider
function renderizarHero() {
  const slider = document.getElementById('hero-slider');
  const imagenes = [
    'imagenes/machu_picchu.jpg',
    'imagenes/valle_sagrado.jpg',
    'imagenes/salar_uyuni.jpg',
    'imagenes/paracas.jpg',
    'imagenes/humantay.jpg'
  ];
  imagenes.forEach((src, i) => {
    const slide = crearElemento('div', 'hero__slide' + (i === 0 ? ' activo' : ''));
    slide.style.backgroundImage = `url(${src})`;
    slider.appendChild(slide);
  });
  // Rotación automática
  let indice = 0;
  setInterval(() => {
    const slides = slider.querySelectorAll('.hero__slide');
    slides[indice].classList.remove('activo');
    indice = (indice + 1) % slides.length;
    slides[indice].classList.add('activo');
  }, 6000);
}

// Destinos imperdibles
function renderizarDestinos() {
  const contenedor = document.getElementById('grid-destinos');
  const destinos = [
    { nombre: 'Uros - Taquile', imagen: 'imagenes/humantay.jpg' },
    { nombre: 'Salar de Uyuni', imagen: 'imagenes/salar_uyuni.jpg' },
    { nombre: 'Valle Sagrado VIP', imagen: 'imagenes/valle_sagrado.jpg' }
  ];
  destinos.forEach(d => {
    const tarjeta = crearElemento('article', 'tarjeta');
    tarjeta.innerHTML = `
      <img src="${d.imagen}" alt="${d.nombre}" class="tarjeta__imagen" loading="lazy">
      <div class="tarjeta__cuerpo">
        <h3 class="tarjeta__titulo">${d.nombre}</h3>
        <a href="#tours" class="boton boton--secundario">VER MÁS</a>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });
}

// Renderizar tours con filtro
function renderizarTours() {
  const contenedor = document.getElementById('grid-tours');
  contenedor.innerHTML = '';
  const lista = estado.filtroActual === 'todos'
    ? estado.tours
    : estado.tours.filter(t => t.ciudad === estado.filtroActual);
  
  lista.forEach(tour => {
    const tarjeta = crearElemento('article', 'tarjeta');
    tarjeta.tabIndex = 0;
    tarjeta.setAttribute('role', 'button');
    tarjeta.setAttribute('aria-label', `Ver detalles de ${tour.nombre}`);
    tarjeta.innerHTML = `
      <img src="${tour.imagen}" alt="${tour.nombre}" class="tarjeta__imagen" loading="lazy">
      <div class="tarjeta__cuerpo">
        <h3 class="tarjeta__titulo">${tour.nombre}</h3>
        <p class="tarjeta__meta">${tour.ciudad} • ${tour.tipo} • ${tour.duracion}</p>
        <p>${tour.resumen}</p>
        <button class="boton boton--primario" data-id="${tour.id}">VER DETALLE</button>
      </div>
    `;
    tarjeta.querySelector('button').addEventListener('click', () => abrirModalTour(tour.id));
    tarjeta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') abrirModalTour(tour.id);
    });
    contenedor.appendChild(tarjeta);
  });
}

// Renderizar paquetes
function renderizarPaquetes() {
  const contenedor = document.getElementById('grid-paquetes');
  estado.paquetes.forEach(p => {
    const tarjeta = crearElemento('article', 'tarjeta');
    tarjeta.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" class="tarjeta__imagen" loading="lazy">
      <div class="tarjeta__cuerpo">
        <h3 class="tarjeta__titulo">${p.nombre}</h3>
        <p class="tarjeta__meta">${p.duracion}</p>
        <p>${p.resumen}</p>
        <button class="boton boton--secundario" data-id="${p.id}">VER ITINERARIO</button>
      </div>
    `;
    tarjeta.querySelector('button').addEventListener('click', () => abrirModalPaquete(p.id));
    contenedor.appendChild(tarjeta);
  });
}

// Configurar menú responsive
function configurarMenu() {
  const toggle = document.querySelector('.menu__toggle');
  const menu = document.getElementById('menu-principal');
  toggle.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    toggle.setAttribute('aria-expanded', abierto);
  });
  // Cerrar al hacer click en enlace
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('abierto'));
  });
}

// Filtros de tours
function configurarFiltros() {
  document.querySelectorAll('.filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      estado.filtroActual = btn.dataset.filtro;
      renderizarTours();
    });
  });
  // Submenu rápido
  document.querySelectorAll('.submenu a').forEach(a => {
    a.addEventListener('click', (e) => {
      const filtro = a.dataset.filtro;
      if (filtro) {
        estado.filtroActual = filtro;
        document.querySelectorAll('.filtro').forEach(b => {
          b.classList.toggle('activo', b.dataset.filtro === filtro);
        });
        setTimeout(renderizarTours, 100);
      }
    });
  });
}

// Modal
function configurarModal() {
  const modal = document.getElementById('modal-tour');
  modal.querySelector('.modal__cerrar').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.close();
  });
}

function abrirModalTour(id) {
  const tour = estado.tours.find(t => t.id === id);
  if (!tour) return;
  const modal = document.getElementById('modal-tour');
  const contenedor = document.getElementById('modal-contenido');
  contenedor.innerHTML = `
    <img src="${tour.imagen}" alt="${tour.nombre}" style="width:100%;border-radius:12px;margin-bottom:1rem;">
    <h2 id="modal-titulo" style="font-family:var(--fuente-titulo)">${tour.nombre}</h2>
    <p><strong>${tour.ciudad}</strong> • ${tour.tipo} • ${tour.duracion}</p>
    <div class="tabs" role="tablist">
      <button class="tab activo" data-tab="itinerario">Itinerario</button>
      <button class="tab" data-tab="incluye">Incluye</button>
      <button class="tab" data-tab="recomendaciones">Qué llevar</button>
    </div>
    <div id="tab-contenido"></div>
  `;
  const tabs = contenedor.querySelectorAll('.tab');
  const contenido = contenedor.querySelector('#tab-contenido');
  function renderTab(tab) {
    tabs.forEach(t => t.classList.toggle('activo', t.dataset.tab === tab));
    if (tab === 'itinerario') {
      contenido.innerHTML = '<ol>' + tour.itinerario.map(p => `<li>${p}</li>`).join('') + '</ol>';
    } else if (tab === 'incluye') {
      contenido.innerHTML = `
        <h4>Incluye</h4>
        <ul>${tour.incluye.map(i => `<li>✓ ${i}</li>`).join('')}</ul>
        <h4 style="margin-top:1rem">No incluye</h4>
        <ul>${tour.noIncluye.map(i => `<li>✗ ${i}</li>`).join('')}</ul>
      `;
    } else {
      contenido.innerHTML = '<ul>' + tour.recomendaciones.map(r => `<li>• ${r}</li>`).join('') + '</ul>';
    }
  }
  tabs.forEach(t => t.addEventListener('click', () => renderTab(t.dataset.tab)));
  renderTab('itinerario');
  modal.showModal();
}

function abrirModalPaquete(id) {
  const p = estado.paquetes.find(x => x.id === id);
  if (!p) return;
  const modal = document.getElementById('modal-tour');
  const contenedor = document.getElementById('modal-contenido');
  contenedor.innerHTML = `
    <img src="${p.imagen}" alt="${p.nombre}" style="width:100%;border-radius:12px;margin-bottom:1rem;">
    <h2 id="modal-titulo" style="font-family:var(--fuente-titulo)">${p.nombre}</h2>
    <p>${p.duracion}</p>
    <h4>Itinerario</h4>
    <ol>${p.itinerario.map(i => `<li>${i}</li>`).join('')}</ol>
    <h4>Incluye</h4>
    <ul>${p.incluye.map(i => `<li>✓ ${i}</li>`).join('')}</ul>
  `;
  modal.showModal();
}

// Formulario
function configurarFormulario() {
  const form = document.getElementById('form-contacto');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form));
    alert(`Gracias por tu consulta. Te contactaremos pronto.\nFecha: ${datos.fecha}`);
    form.reset();
  });
}

// Iniciar carga
cargarDatos();

// Accesibilidad: cerrar modal con Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('modal-tour').close();
  }
});
