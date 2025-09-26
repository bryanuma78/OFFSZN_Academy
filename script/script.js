// -----------------------------
// ELEMENTOS DEL DOM
// -----------------------------
const cursosContainer = document.getElementById("cursosContainer");
const presetsContainer = document.getElementById("presetsContainer");
const carritoCount = document.getElementById("carritoCount");

// Modal de descripción (solo cursos)
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalVideo = document.getElementById("modalVideo");

// Modal de carrito
const carritoModal = document.getElementById("carritoModal");
const closeCarrito = document.getElementById("closeCarrito");
const carritoItems = document.getElementById("carritoItems");
const totalCarrito = document.getElementById("totalCarrito");
const btnComprar = document.getElementById("btnComprar");

// -----------------------------
// VARIABLES
// -----------------------------
let carrito = []; // [{id, tipo}]

// -----------------------------
// RENDERIZAR CURSOS
// -----------------------------
function renderCursos() {
  if (!cursosContainer) return;
  cursosContainer.innerHTML = "";
  cursos.forEach(curso => {
    const card = document.createElement("div");
    card.classList.add("course-card");
    card.innerHTML = `
      <img src="${curso.img}" alt="${curso.titulo}">
      <h3>${curso.titulo}</h3>
      <p>$${curso.precio}</p>
      <button class="btn-ver" onclick="verDescripcion(${curso.id})">Ver descripción</button>
      <button class="btn-carrito" onclick="agregarCarrito(${curso.id}, 'curso')">Agregar al carrito</button>
    `;
    cursosContainer.appendChild(card);
  });
}

// -----------------------------
// RENDERIZAR PRESETS
// -----------------------------
function renderPresets() {
  if (!presetsContainer) return;
  presetsContainer.innerHTML = "";
  presets.forEach(preset => {
    const card = document.createElement("div");
    card.classList.add("course-card");
    card.innerHTML = `
      <img src="${preset.img}" alt="${preset.titulo}">
      <h3>${preset.titulo}</h3>
      <p>$${preset.precio}</p>
      <button class="btn-carrito" onclick="agregarCarrito(${preset.id}, 'preset')">Agregar al carrito</button>
    `;
    presetsContainer.appendChild(card);
  });
}

// -----------------------------
// MODAL DE DESCRIPCIÓN (cursos y presets)
// -----------------------------
function verDescripcion(id, tipo = "curso") {
  let item;

  if (tipo === "curso") {
    item = cursos.find(c => c.id === id);
  } else if (tipo === "preset") {
    item = presets.find(p => p.id === id);
  }

  if (!item) return;

  modalTitle.textContent = item.titulo;
  modalDesc.textContent = item.desc;

  // Si tiene video lo muestra, si no lo oculta
  if (item.video) {
    modalVideo.src = item.video;
    modalVideo.style.display = "block";
  } else {
    modalVideo.style.display = "none";
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
  if (modal && e.target === modal) {
    modal.style.display = "none";
    modalVideo.pause();
  }
  if (e.target === carritoModal) {
    carritoModal.style.display = "none";
  }
};


// -----------------------------
// CARRITO
// -----------------------------
function agregarCarrito(id, tipo = "curso") {
  carrito.push({ id, tipo });
  carritoCount.textContent = carrito.length;
  alert(`${tipo === "curso" ? "Curso" : "Preset"} agregado al carrito ✅`);
}

document.querySelector(".carrito").addEventListener("click", () => {
  renderCarrito();
  carritoModal.style.display = "flex";
});

closeCarrito.onclick = () => {
  carritoModal.style.display = "none";
};

function renderCarrito() {
  carritoItems.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    let producto = item.tipo === "curso"
      ? cursos.find(c => c.id === item.id)
      : presets.find(p => p.id === item.id);

    if (producto) {
      total += producto.precio;
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

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  carritoCount.textContent = carrito.length;
  renderCarrito();
}

// -----------------------------
// BOTÓN DE COMPRA
// -----------------------------
btnComprar.onclick = () => {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío ❌");
    return;
  }

  let total = carrito.reduce((sum, item) => {
    const producto = item.tipo === "curso"
      ? cursos.find(c => c.id === item.id)
      : presets.find(p => p.id === item.id);
    return sum + (producto ? producto.precio : 0);
  }, 0);

  document.getElementById("paypal-button-container").innerHTML = "";

  paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'paypal'
    },
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
      return actions.order.capture().then((details) => {
        alert(`Pago realizado ✅\nGracias ${details.payer.name.given_name}`);
        carrito = [];
        carritoCount.textContent = "0";
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
// INICIALIZAR
// -----------------------------
renderCursos();
renderPresets();


// -----------------------------
// RENDERIZAR CURSOS
// -----------------------------
function renderCursos() {
  if (!cursosContainer) return;
  cursosContainer.innerHTML = "";
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

// -----------------------------
// RENDERIZAR PRESETS
// -----------------------------
function renderPresets() {
  if (!presetsContainer) return;
  presetsContainer.innerHTML = "";
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
