// -----------------------------
// VARIABLES GLOBALES
// -----------------------------
const cursosContainer = document.getElementById("cursosContainer");
const presetsContainer = document.getElementById("presetsContainer");

const carritoCount = document.getElementById("carritoCount");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalVideo = document.getElementById("modalVideo");
const modalImg = document.getElementById("modalImg");

const carritoModal = document.getElementById("carritoModal");
const closeCarrito = document.getElementById("closeCarrito");
const carritoItems = document.getElementById("carritoItems");
const totalCarrito = document.getElementById("totalCarrito");
const btnComprar = document.getElementById("btnComprar");

// Arrays para productos
let cursos = [];
let presets = [];

// Carrito desde localStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
if (carritoCount) carritoCount.textContent = carrito.length;

// -----------------------------
// FUNCIONES DE CARRITO
// -----------------------------
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  if (carritoCount) carritoCount.textContent = carrito.length;
}

function agregarCarrito(id, tipo = "curso") {
  carrito.push({ id, tipo });
  guardarCarrito();
  alert(`${tipo === "curso" ? "Curso" : "Preset"} agregado al carrito ✅`);
  renderCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  renderCarrito();
}

function renderCarrito() {
  carritoItems.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    const producto = item.tipo === "curso"
      ? cursos.find(c => c.id === item.id)
      : presets.find(p => p.id === item.id);

    if (producto) {
      total += parseFloat(producto.precio);
      const div = document.createElement("div");
      div.classList.add("carrito-item");
      div.innerHTML = `
        <p>${producto.titulo} - $${producto.precio}</p>
        <button onclick="eliminarDelCarrito(${index})" class="btn">Eliminar</button>
      `;
      carritoItems.appendChild(div);
    }
  });

  totalCarrito.innerHTML = `<strong>Total:</strong> $${total}`;
}

// -----------------------------
// MODAL DESCRIPCIÓN
// -----------------------------
function verDescripcion(id, tipo = "curso") {
  const item = tipo === "curso"
    ? cursos.find(c => c.id === id)
    : presets.find(p => p.id === id);

  if (!item) return;

  modalTitle.textContent = item.titulo;
  modalDesc.textContent = item.desc;

  if (item.video) {
    modalVideo.src = item.video;
    modalVideo.style.display = "block";
    modalImg.style.display = "none";
  } else if (item.img) {
    modalImg.src = item.img;
    modalImg.style.display = "block";
    modalVideo.style.display = "none";
  } else {
    modalVideo.style.display = "none";
    modalImg.style.display = "none";
  }

  modal.style.display = "flex";
}

if (closeModal) {
  closeModal.onclick = () => {
    modal.style.display = "none";
    modalVideo.pause();
  };
}

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    modalVideo.pause();
  }
  if (e.target === carritoModal) {
    carritoModal.style.display = "none";
  }
};

// -----------------------------
// EVENTOS CARRITO
// -----------------------------
document.querySelector(".carrito").addEventListener("click", () => {
  renderCarrito();
  carritoModal.style.display = "flex";
});

if (closeCarrito) closeCarrito.onclick = () => carritoModal.style.display = "none";

// -----------------------------
// PAYPAL
// -----------------------------
btnComprar.onclick = () => {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío ❌");
    return;
  }

  const total = carrito.reduce((sum, item) => {
    const producto = item.tipo === "curso"
      ? cursos.find(c => c.id === item.id)
      : presets.find(p => p.id === item.id);
    return sum + (producto ? parseFloat(producto.precio) : 0);
  }, 0);

  document.getElementById("paypal-button-container").innerHTML = "";

  paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
    createOrder: (data, actions) => {
      return actions.order.create({
        purchase_units: [{
          description: `Compra de ${carrito.length} items en OFFSZN Academy`,
          amount: { currency_code: "USD", value: total },
          payee: { email_address: "willie2008garay@gmail.com" }
        }]
      });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then(details => {
        alert(`Pago realizado ✅\nGracias ${details.payer.name.given_name}`);
        carrito = [];
        guardarCarrito();
        carritoModal.style.display = "none";
      });
    },
    onError: (err) => {
      console.error(err);
      alert("Hubo un error con PayPal ❌");
    }
  }).render("#paypal-button-container");
};

// -----------------------------
// RENDER DE CURSOS Y PRESETS
// -----------------------------
function renderCursos() {
  if (!cursosContainer) return;
  cursosContainer.innerHTML = "";

  if (cursos.length === 0) {
    cursosContainer.innerHTML = "<p>No se pudieron cargar los cursos 😕</p>";
    return;
  }

  cursos.forEach(curso => {
    const card = document.createElement("div");
    card.classList.add("course-card");
    card.innerHTML = `
      <img src="${curso.img}" alt="${curso.titulo}">
      <h3>${curso.titulo}</h3>
      <p>$${curso.precio}</p>
      <button class="btn-ver" onclick="verDescripcion(${curso.id}, 'curso')">Ver descripción</button>
      <button class="btn-carrito" onclick="agregarCarrito(${curso.id}, 'curso')">Agregar al carrito</button>
    `;
    cursosContainer.appendChild(card);
  });
}

function renderPresets() {
  if (!presetsContainer) return;
  presetsContainer.innerHTML = "";

  if (presets.length === 0) {
    presetsContainer.innerHTML = "<p>No se pudieron cargar los presets 😕</p>";
    return;
  }

  presets.forEach(preset => {
    const card = document.createElement("div");
    card.classList.add("course-card");
    card.innerHTML = `
      <img src="${preset.img}" alt="${preset.titulo}">
      <h3>${preset.titulo}</h3>
      <p>$${preset.precio}</p>
      <button class="btn-ver" onclick="verDescripcion(${preset.id}, 'preset')">Ver descripción</button>
      <button class="btn-carrito" onclick="agregarCarrito(${preset.id}, 'preset')">Agregar al carrito</button>
    `;
    presetsContainer.appendChild(card);
  });
}

// -----------------------------
// FETCH AL BACKEND
// -----------------------------
fetch("https://willie.lovestoblog.com/api/getProductos.php")
  .then(res => {
    if (!res.ok) throw new Error("Error HTTP " + res.status);
    return res.json();
  })
  .then(data => {
    cursos = data.filter(p => p.categoria === "curso");
    presets = data.filter(p => p.categoria === "preset");

    renderCursos();
    renderPresets();
  })
  .catch(err => {
    console.error("Error al cargar productos:", err);
    if (cursosContainer) cursosContainer.innerHTML = "<p>Error al cargar cursos 😕</p>";
    if (presetsContainer) presetsContainer.innerHTML = "<p>Error al cargar presets 😕</p>";
  });
