document.addEventListener('DOMContentLoaded', async () => {

    const welcomeText = document.querySelector('.welcome-text');
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-name');
    const walletAmount = document.querySelector('.wallet-amount');
    const statsGrid = document.querySelector('.stats-grid');
    const productsGrid = document.querySelector('.products-grid');
    const uploadButton = document.querySelector('.upload-btn');
    const token = localStorage.getItem('authToken');

    let API_URL = '';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        API_URL = 'http://localhost:3000/api';
    } else {
        API_URL = 'https://offszn-academy.onrender.com/api';
    }

    if (!token) {
        console.error("Dashboard: No hay token, redirigiendo al login.");
        window.location.replace('/pages/login.html');
        return;
    }

    async function loadDashboardData() {
        try {
            const userResponse = await fetch(`${API_URL}/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!userResponse.ok) {
                localStorage.removeItem('authToken');
                throw new Error(`Error ${userResponse.status}: No se pudieron obtener los datos del usuario.`);
            }
            const userData = await userResponse.json();
            console.log("Datos del usuario:", userData);

            if (welcomeText) welcomeText.textContent = `Bienvenido, ${userData.nickname || userData.first_name || 'Usuario'}`;
            if (profileName) profileName.textContent = `${userData.first_name || ''} ${userData.lastName || ''}`.trim() || userData.nickname;
            if (profileAvatar) {
                const initial = (userData.first_name || userData.nickname || 'U').charAt(0).toUpperCase();
                profileAvatar.textContent = initial;
            }

            if (userData.is_producer === true) {
                console.log("Usuario es productor. Cargando datos de productor...");
                document.querySelectorAll('.producer-only').forEach(el => el.style.display = '');

                if (walletAmount) walletAmount.textContent = '$0.00';

                if (productsGrid) {
                    await loadProducerProducts(userData.id);
                }

                // El botón ya tiene onclick="window.location.href='subir-kit.html'" en el HTML
                // No necesitamos modificarlo aquí

            } else {
                console.log("Usuario NO es productor.");
                document.querySelectorAll('.producer-only').forEach(el => el.style.display = 'none');
                if (document.querySelector('.main-content')) {
                    document.querySelector('.main-content').innerHTML = `
                           <h1>Bienvenido ${userData.nickname || 'Usuario'}</h1>
                           <p>Explora el marketplace o revisa tus compras.</p>
                           <a href="/pages/my-products.html" class="btn">Ver Mis Productos</a>
                           <a href="/pages/presets-v2.html" class="btn btn-secondary">Ir al Marketplace</a>
                      `;
                }
            }

        } catch (error) {
            console.error("Error al cargar datos del dashboard:", error);
            if (error.message.includes('401') || error.message.includes('403')) {
                localStorage.removeItem('authToken');
                window.location.replace('/pages/login.html');
            } else if (document.querySelector('.main-content')) {
                document.querySelector('.main-content').innerHTML = `<h1 style="color:red;">Error al cargar dashboard</h1><p>${error.message}</p>`;
            }
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId || 'modal');
        if (modal) modal.classList.remove('active');
    }

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.onclick = null;
            closeBtn.addEventListener('click', () => closeModal(modal.id));
        }
    });

    async function loadProducerProducts(userId) {
        productsGrid.innerHTML = '<p>Cargando tus productos...</p>';
        try {
            const response = await fetch(`${API_URL}/me/products`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudieron cargar tus productos.');
            const myProducts = await response.json();

            if (myProducts.length === 0) {
                productsGrid.innerHTML = '<p>Aún no has subido ningún producto.</p>';
                return;
            }

            let productsHTML = '';
            myProducts.slice(0, 3).forEach(product => {
                productsHTML += `
                     <div class="product-card">
                         <div class="product-image" style="${product.image_url ? `background-image: url(${product.image_url}); background-size:cover;` : ''}">
                             ${!product.image_url ? '<i class="fas fa-music"></i>' : ''}
                             <span class="product-badge">${product.product_type || 'Preset'}</span>
                         </div>
                         <div class="product-info">
                             <div class="product-title">${product.name}</div>
                             <div class="product-meta">
                             </div>
                             <div class="product-price">$${product.price}</div>
                             <div class="product-stats">
                                 <div><i class="fas fa-shopping-bag"></i> --</div>
                                 <div><i class="fas fa-eye"></i> --</div>
                             </div>
                         </div>
                     </div>
                 `;
            });
            productsGrid.innerHTML = productsHTML;

        } catch (error) {
            console.error("Error cargando productos del productor:", error);
            productsGrid.innerHTML = `<p style="color:red;">Error al cargar tus productos: ${error.message}</p>`;
        }
    }


    loadDashboardData();

    const sidebarLogoutButton = document.querySelector('.logout-btn');
    if (sidebarLogoutButton) {
        sidebarLogoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            alert('¡Has cerrado sesión!');
            window.location.replace('/pages/login.html');
        });
    }


});
