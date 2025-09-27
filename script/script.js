// -----------------------------
// ELEMENTOS DEL DOM
// -----------------------------
const carritoCount = document.getElementById("carritoCount");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalVideo = document.getElementById("modalVideo");

const carritoModal = document.getElementById("carritoModal");
const closeCarrito = document.getElementById("closeCarrito");
const carritoItems = document.getElementById("carritoItems");
const totalCarrito = document.getElementById("totalCarrito");
const btnComprar = document.getElementById("btnComprar");

// -----------------------------
// VARIABLES
// -----------------------------
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Actualizar contador al cargar
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

// -----------------------------
// MODAL DE DESCRIPCIÓN
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
  } else {
    modalVideo.style.display = "none";
  }

  modal.style.display = "flex";
}

if (closeModal) {
  closeModal.onclick = () => {
    modal.style.display = "none";
    if(modalVideo) modalVideo.pause();
  };
}

window.onclick = (e) => {
  if (modal && e.target === modal) {
    modal.style.display = "none";
    modalVideo.pause();
  }
  if (carritoModal && e.target === carritoModal) {
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

closeCarrito.onclick = () => carritoModal.style.display = "none";

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
    return sum + (producto ? producto.precio : 0);
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
