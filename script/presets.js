// Espera a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. CONFIGURACIÓN ---
  
  // Lógica para detectar si estamos en local o producción
  let API_URL = '';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
    API_URL = 'http://localhost:3001/api';
  } else {
    API_URL = 'https://offszn-academy.onrender.com/api';
  }

  // Obtenemos el token de login. ¡El usuario DEBE estar logueado para comprar!
  const authToken = localStorage.getItem('authToken');
  const productGrid = document.getElementById('product-grid');

  // --- 2. FUNCIÓN PARA CARGAR PRODUCTOS ---
  
  async function loadProducts() {
    if (!productGrid) return; // Si no estamos en la página de presets, no hagas nada
    
    try {
      // Pedimos los productos a nuestro backend
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error('No se pudieron cargar los productos.');
      }
      
      const products = await response.json();
      
      // Si no hay productos, muestra un mensaje
      if (products.length === 0) {
        productGrid.innerHTML = '<p>No hay productos disponibles en este momento.</p>';
        return;
      }
      
      // Generamos el HTML para cada producto
      let productHTML = '';
      products.forEach(product => {
        productHTML += `
          <div class="product-card">
            <img src="${product.image_url}" alt="${product.name}">
            <div class="product-content">
              <h3>${product.name}</h3>
              <p>${product.description}</p>
              <div class="product-price">$${product.price}</div>
              
              <div class="paypal-button-container" data-product-id="${product.id}"></div>
            </div>
          </div>
        `;
      });
      
      // Inyectamos el HTML en la cuadrícula
      productGrid.innerHTML = productHTML;
      
      // ¡Ahora que los botones existen, los inicializamos!
      initializePayPalButtons();
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
      productGrid.innerHTML = '<p>Error al cargar productos. Intenta recargar la página.</p>';
    }
  }

  // --- 3. FUNCIÓN PARA INICIALIZAR PAYPAL ---
  // (Este es el código que ya teníamos, pero ahora dentro de una función)
  
  function initializePayPalButtons() {
    // Buscamos TODOS los contenedores de botones que acabamos de crear
    document.querySelectorAll('.paypal-button-container').forEach(buttonContainer => {
      
      const productId = buttonContainer.dataset.productId;

      // Renderizamos un botón de PayPal para CADA producto
      paypal.Buttons({

        // 1. Llamar a nuestro backend para CREAR la orden
        createOrder: async () => {
          if (!authToken) {
            alert('Debes iniciar sesión para poder comprar.');
            window.location.href = '/pages/login.html'; // Redirige al login
            return;
          }

          try {
            const res = await fetch(`${API_URL}/orders/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ productId: productId })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data.orderID; // Devuelve el ID de la orden a PayPal

          } catch (error) {
            console.error('Error al crear la orden:', error);
            alert(`Error al crear la orden: ${error.message}`);
          }
        },

        // 2. Llamar a nuestro backend para CAPTURAR el pago
        onApprove: async (data, actions) => {
          try {
            const res = await fetch(`${API_URL}/orders/capture`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({ orderID: data.orderID })
            });

            const captureData = await res.json();
            if (!res.ok) throw new Error(captureData.error);
            
            console.log('Pago capturado:', captureData);
            alert('¡Gracias por tu compra!');
            
            // Redirigir a la página de "Mis Productos"
            // (¡Deberíamos crear esta página pronto!)
            window.location.href = '/pages/my-products.html';

          } catch (error) {
            console.error('Error al capturar el pago:', error);
            alert('Error al finalizar el pago.');
          }
        },
        
        onError: (err) => {
          console.error('Error de PayPal:', err);
          alert('Ha ocurrido un error con PayPal.');
        }

      }).render(buttonContainer); // Dibuja el botón
    });
  }

  // --- 4. EJECUTAR TODO ---
  loadProducts();

});