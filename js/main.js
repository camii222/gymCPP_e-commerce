/* Datos de productos con categoría para filtros */
const productos = [
  { id: 1, nombre: "BCAA 2:1:1", precio: 45000, img: "../img/bcaa.jpg", categoria: "Suplementos" },
  { id: 2, nombre: "Bandas de Resistencia", precio: 25000, img: "../img/bandas.jpg", categoria: "Accesorios" },
  { id: 3, nombre: "Colchoneta de Yoga", precio: 20000, img: "../img/yoga.jpg", categoria: "Accesorios" },
  { id: 4, nombre: "Straps", precio: 5000, img: "../img/straps.jpg", categoria: "Accesorios" },
  { id: 5, nombre: "Botella Térmica", precio: 20000, img: "../img/botellas.jpg", categoria: "Accesorios" },
  { id: 6, nombre: "Guantes de Entrenamiento", precio: 13000, img: "../img/guantes.jpg", categoria: "Accesorios" },
  { id: 7, nombre: "Creatina Monohidratada", precio: 60000, img: "../img/creatina.jpg", categoria: "Suplementos" },
  { id: 8, nombre: "Proteína Whey", precio: 85000, img: "../img/proteina.jpg", categoria: "Suplementos" },
  { id: 9, nombre: "Pre-entreno Explosive Pump", precio: 55000, img: "../img/preentreno.jpg", categoria: "Suplementos" },
  { id: 10, nombre: "Multivitamínico Premium", precio: 30000, img: "../img/multivitaminico.jpg", categoria: "Suplementos" },
  { id: 11, nombre: "Omega 3 Fish Oil", precio: 40000, img: "../img/omega3.jpg", categoria: "Suplementos" },
  { id: 12, nombre: "Mancuernas Ajustables", precio: 150000, img: "../img/mancuernas.jpg", categoria: "Equipamiento" }
];

let carrito = JSON.parse(localStorage.getItem("carritoGym")) || [];
let filtroActivo = "Todos";

document.addEventListener("DOMContentLoaded", () => {
  generarProductos(productos);
  actualizarContadorCarrito();
  configurarEventos();
  configurarFiltros();
  configurarScrollAnimations();
});

/* ---- Generación de cards (acepta array filtrado) ---- */
function generarProductos(lista) {
  const grid = document.getElementById("gridProductos");
  grid.innerHTML = "";
  lista.forEach((p) => {
    const card = document.createElement("article");
    card.className = "producto-card";
    card.setAttribute("data-categoria", p.categoria);
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}" loading="lazy">
      <h3>${p.nombre}</h3>
      <p class="precio">$${Number(p.precio).toLocaleString('es-AR')}</p>
      <button class="btn-agregar" aria-label="Agregar ${p.nombre}" data-id="${p.id}">Agregar</button>
    `;
    grid.appendChild(card);
  });

  // conectar botones "Agregar" recién creados
  document.querySelectorAll(".btn-agregar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = Number(e.currentTarget.dataset.id);
      agregarAlCarrito(id);
    });
  });

  // re-observamos las nuevas cards para animación sutil
  observeProductCards();
}

/* ---- Carrito: agregar, quitar, limpiar, actualizar contador ---- */
function agregarAlCarrito(id) {
  const producto = productos.find((p) => p.id === id);
  const item = carrito.find((c) => c.id === id);

  if (item) item.cantidad++;
  else carrito.push({ ...producto, cantidad: 1 });

  localStorage.setItem("carritoGym", JSON.stringify(carrito));
  actualizarContadorCarrito();
  mostrarMensajeCarrito("Producto agregado al carrito", "success");
}

function quitarDelCarrito(id) {
  const item = carrito.find((i) => i.id === id);
  if (!item) return;
  if (item.cantidad > 1) item.cantidad--;
  else carrito = carrito.filter((i) => i.id !== id);

  localStorage.setItem("carritoGym", JSON.stringify(carrito));
  actualizarModalCarrito();
  actualizarContadorCarrito();
}

function limpiarCarrito() {
  carrito = [];
  localStorage.setItem("carritoGym", JSON.stringify(carrito));
  actualizarModalCarrito();
  actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
  const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  const el = document.getElementById("contadorCarrito");
  if (el) el.textContent = total;
}

/* ---- Modal carrito ---- */
function abrirModalCarrito() {
  const modal = document.getElementById("modalCarrito");
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "block";
  actualizarModalCarrito();
  document.body.style.overflow = "hidden";
}
function cerrarModalCarrito() {
  const modal = document.getElementById("modalCarrito");
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  document.body.style.overflow = "";
}

function actualizarModalCarrito() {
  const contenido = document.getElementById("contenidoCarrito");
  const subtotalEl = document.getElementById("subtotal");
  const descuentoEl = document.getElementById("descuento");
  const envioEl = document.getElementById("envio");
  const totalFinalEl = document.getElementById("totalFinal");
  const totalItemsEl = document.getElementById("totalItems");
  const btnFinalizar = document.getElementById("btnFinalizarCompra");

  contenido.innerHTML = "";
  let subtotal = 0;
  let totalItems = 0;

  if (carrito.length === 0) {
    contenido.innerHTML = '<p style="text-align:center;color:#aaa;">Tu carrito está vacío.</p>';
    if (subtotalEl) subtotalEl.textContent = "Subtotal: $0";
    if (totalFinalEl) totalFinalEl.textContent = "Total: $0";
    if (btnFinalizar) btnFinalizar.disabled = true;
    return;
  }

  carrito.forEach((item) => {
    const div = document.createElement("div");
    div.className = "item-carrito";
    div.innerHTML = `
      <div>
        <h4>${item.nombre}</h4>
        <p>$${Number(item.precio).toLocaleString('es-AR')} x ${item.cantidad} = $${Number(item.precio * item.cantidad).toLocaleString('es-AR')}</p>
      </div>
      <div>
        <button class="btn-secundario" data-action="minus" data-id="${item.id}">-</button>
      </div>
    `;
    contenido.appendChild(div);
    subtotal += item.precio * item.cantidad;
    totalItems += item.cantidad;
  });

  totalItemsEl.textContent = `Items: ${totalItems}`;
  subtotalEl.textContent = `Subtotal: $${subtotal.toFixed(2)}`;

  const descuento = carrito.length > 2 ? subtotal * 0.2 : 0;
  if (descuento > 0) {
    descuentoEl.textContent = `Descuento (20%): -$${descuento.toFixed(2)}`;
    descuentoEl.classList.remove("descuento-oculto");
  } else descuentoEl.classList.add("descuento-oculto");

  const envio = 4000;
  envioEl.textContent = `Envío: $${envio}`;
  const totalFinal = subtotal - descuento + envio;
  totalFinalEl.textContent = `Total: $${totalFinal.toFixed(2)}`;
  btnFinalizar.disabled = false;

  // conectar botones de quitar dentro del modal
  contenido.querySelectorAll('button[data-action="minus"]').forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = Number(e.currentTarget.dataset.id);
      quitarDelCarrito(id);
    });
  });
}

/* ---- Modal usuario / finalizar compra ---- */
function abrirModalUsuario() {
  const modal = document.getElementById("modalUsuario");
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}
function cerrarModalUsuario() {
  const modal = document.getElementById("modalUsuario");
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  document.body.style.overflow = "";
}

function finalizarCompraConUsuario(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const dni = document.getElementById("dni").value.trim();
  const direccion = document.getElementById("direccion").value.trim();

  if (!nombre || !apellido || !dni || !direccion)
    return mostrarMensajeUsuario("Todos los campos son obligatorios", "error");

  const subtotal = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const descuento = carrito.length > 2 ? subtotal * 0.2 : 0;
  const envio = 4000;
  const total = subtotal - descuento + envio;

  Swal.fire({
    title: "¡Compra finalizada!",
    html: `
      <p><strong>${nombre} ${apellido}</strong></p>
      <p>DNI: ${dni}</p>
      <p>Dirección: ${direccion}</p>
      <hr>
      <p>Subtotal: $${subtotal.toFixed(2)}</p>
      ${descuento > 0 ? `<p>Descuento: -$${descuento.toFixed(2)}</p>` : ""}
      <p>Envío: +$${envio}</p>
      <h3>Total: $${total.toFixed(2)}</h3>
      <p>¡Gracias por tu compra!</p>
    `,
    icon: "success",
  }).then(() => {
    carrito = [];
    localStorage.setItem("carritoGym", JSON.stringify(carrito));
    actualizarContadorCarrito();
    cerrarModalUsuario();
    cerrarModalCarrito();
  });
}

/* ---- Configuración de eventos UI ---- */
function configurarEventos() {
  // carrito
  const carritoIcon = document.getElementById("carritoIcon");
  if (carritoIcon) carritoIcon.addEventListener("click", abrirModalCarrito);

  const cerrarModalCarritoBtn = document.getElementById("cerrarModalCarrito");
  if (cerrarModalCarritoBtn) cerrarModalCarritoBtn.addEventListener("click", cerrarModalCarrito);

  const btnLimpiar = document.getElementById("btnLimpiarCarrito");
  if (btnLimpiar) btnLimpiar.addEventListener("click", limpiarCarrito);

  const btnFinalizar = document.getElementById("btnFinalizarCompra");
  if (btnFinalizar) btnFinalizar.addEventListener("click", () => {
    if (carrito.length === 0) return;
    abrirModalUsuario();
  });

  const cerrarModalUsuarioBtn = document.getElementById("cerrarModalUsuario");
  if (cerrarModalUsuarioBtn) cerrarModalUsuarioBtn.addEventListener("click", cerrarModalUsuario);

  const btnCancelarUsuario = document.getElementById("btnCancelarUsuario");
  if (btnCancelarUsuario) btnCancelarUsuario.addEventListener("click", cerrarModalUsuario);

  const formUsuario = document.getElementById("formUsuario");
  if (formUsuario) formUsuario.addEventListener("submit", finalizarCompraConUsuario);

  // navegación: marcar link activo al hacer click
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-links a').forEach(x => x.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });
    // Click en el logo → volver al inicio
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('#inicio').scrollIntoView({ behavior: 'smooth' });
      // Actualiza el estado activo del menú
      document.querySelectorAll('.nav-links a').forEach(x => x.classList.remove('active'));
      document.querySelector('.nav-links a[href="#inicio"]').classList.add('active');
    });
  }

}

/* ---- Mensajes breves ---- */
function mostrarMensajeCarrito(msg, tipo = "info") {
  const el = document.getElementById("mensajeCarrito");
  if (!el) return;
  el.textContent = msg;
  el.className = `mensaje ${tipo}`;
  setTimeout(() => (el.textContent = ""), 2000);
}

function mostrarMensajeUsuario(msg, tipo = "info") {
  const el = document.getElementById("mensajeUsuario");
  if (!el) return;
  el.textContent = msg;
  el.className = `mensaje ${tipo}`;
  setTimeout(() => (el.textContent = ""), 2000);
}

/* ---- FILTROS ---- */
function configurarFiltros() {
  const botones = document.querySelectorAll('.filtro-btn');
  botones.forEach(btn => btn.addEventListener('click', () => {
    botones.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroActivo = btn.dataset.filter;
    aplicarFiltro();
  }));
}

function aplicarFiltro() {
  if (filtroActivo === "Todos") {
    generarProductos(productos);
    return;
  }
  const filtrados = productos.filter(p => p.categoria === filtroActivo);
  generarProductos(filtrados);
}

/* ---- IntersectionObserver para animaciones sutiles ---- */
function configurarScrollAnimations() {
  const animables = document.querySelectorAll('.animate-on-scroll');
  const opciones = { root: null, rootMargin: '0px', threshold: 0.12 };
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, opciones);

  animables.forEach(el => observer.observe(el));
}

/* Observa las product cards para que aparezcan sutilmente */
let cardObserver;
function observeProductCards() {
  const cards = document.querySelectorAll('.producto-card');
  if (cardObserver) {
    cards.forEach(card => cardObserver.observe(card));
    return;
  }
  const options = { root: null, rootMargin: '0px', threshold: 0.12 };
  cardObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, options);
  cards.forEach(card => cardObserver.observe(card));
}
