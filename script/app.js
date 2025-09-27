// -----------------------------
// VARIABLES GLOBALES
// -----------------------------
const cursosContainer = document.getElementById("cursosContainer");
const presetsContainer = document.getElementById("presetsContainer");

let cursos = [];
let presets = [];

// -----------------------------
// FUNCIONES DE RENDER
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

// -----------------------------
// FETCH A BACKEND
// -----------------------------
fetch("https://willie.lovestoblog.com/api/getProductos.php")
  .then(res => res.json())
  .then(data => {
    cursos = data.filter(p => p.categoria === "curso");
    presets = data.filter(p => p.categoria === "preset");

    renderCursos();
    renderPresets();
  })
  .catch(err => console.error("Error al cargar productos:", err));
