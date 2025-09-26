// app.js
document.addEventListener('DOMContentLoaded', () => {
  cargarItems('curso');
  cargarItems('preset');
});

function cargarItems(tipo){
  fetch(`api/get_items.php?tipo=${tipo}`)
  .then(res => res.json())
  .then(data => {
      const tableBody = document.querySelector(`#${tipo}sTable tbody`);
      tableBody.innerHTML = '';
      data.forEach(item => {
          const precioConDescuento = item.precio - (item.precio * item.descuento / 100);
          tableBody.innerHTML += `
              <tr>
                  <td>${item.id}</td>
                  <td>${item.titulo}</td>
                  <td>${item.precio}</td>
                  <td>${precioConDescuento.toFixed(2)}</td>
                  <td><img src="${item.imagen}" width="50"></td>
                  <td>${item.descripcion}</td>
                  <td>
                      ${item.video ? `<video width="100" controls><source src="${item.video}" type="video/mp4"></video>` : ''}
                  </td>
                  <td>
                      <button onclick="editarItem(${item.id})" class="bg-yellow-500 text-white px-2 rounded">Editar</button>
                      <button onclick="eliminarItem(${item.id})" class="bg-red-500 text-white px-2 rounded">Eliminar</button>
                  </td>
              </tr>
          `;
      });
  });
}

function agregarItem(){
  const formData = new FormData();
  formData.append('tipo', document.getElementById('tipoItem').value);
  formData.append('titulo', document.getElementById('titulo').value);
  formData.append('precio', document.getElementById('precio').value);
  formData.append('descuento', document.getElementById('descuento').value);
  formData.append('desc', document.getElementById('desc').value);
  formData.append('img', document.getElementById('img').files[0]);
  formData.append('video', document.getElementById('video').files[0]);

  fetch('api/add_item.php', {
      method: 'POST',
      body: formData
  })
  .then(res => res.json())
  .then(data => {
      if(data.success){
          alert('Item agregado!');
          cargarItems(document.getElementById('tipoItem').value);
      }else{
          alert('Error: ' + data.error);
      }
  });
}
