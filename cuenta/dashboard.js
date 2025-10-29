document.addEventListener('DOMContentLoaded', async () => {

    const welcomeText = document.querySelector('.welcome-text');
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-name');
    const walletAmount = document.querySelector('.wallet-amount');
    const statsGrid = document.querySelector('.stats-grid');
    const productsGrid = document.querySelector('.products-grid');
    const uploadButton = document.querySelector('.upload-btn');
    const token = localStorage.getItem('authToken');
    const uploadModal = document.getElementById('upload-modal');
    const uploadForm = document.getElementById('upload-product-form');
    const uploadMessageDiv = document.getElementById('upload-message');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const uploadProgressText = document.getElementById('upload-progress-text');
    const uploadProgressContainer = document.querySelector('.upload-progress');

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

                if (uploadButton) {
                    uploadButton.disabled = false;
                    uploadButton.onclick = null;
                    uploadButton.addEventListener('click', () => {
                        if (uploadModal) uploadModal.classList.add('active');
                    });
                }


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

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = uploadForm.querySelector('button[type="submit"]');

            const formData = new FormData(uploadForm);

            uploadMessageDiv.textContent = '';
            uploadMessageDiv.className = 'message';
            submitButton.disabled = true;
            submitButton.textContent = 'Subiendo...';
            if (uploadProgressContainer) uploadProgressContainer.style.display = 'block';
            if (uploadProgressBar) uploadProgressBar.value = 0;
            if (uploadProgressText) uploadProgressText.textContent = '0%';


            try {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        if (uploadProgressBar) uploadProgressBar.value = percentComplete;
                        if (uploadProgressText) uploadProgressText.textContent = `${percentComplete}%`;
                    }
                });

                xhr.addEventListener('load', () => {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Subir Producto';
                    if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';

                    try {
                        const data = JSON.parse(xhr.responseText);

                        if (xhr.status >= 200 && xhr.status < 300) {
                            uploadMessageDiv.textContent = data.message || '¡Producto subido!';
                            uploadMessageDiv.classList.add('success');
                            uploadForm.reset();
                            setTimeout(() => {
                                closeModal('upload-modal');
                                loadDashboardData();
                            }, 2000);
                        } else {
                            throw new Error(data.error || `Error ${xhr.status}`);
                        }
                    } catch (parseError) {
                        console.error("Error parseando respuesta o error XHR:", parseError, xhr.status, xhr.responseText);
                        throw new Error(`Error del servidor (${xhr.status}). Revisa la consola.`);
                    }
                });

                xhr.addEventListener('error', () => {
                    console.error("Error de red XHR");
                    uploadMessageDiv.textContent = 'Error de red al subir el archivo.';
                    uploadMessageDiv.classList.add('error');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Subir Producto';
                    if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';
                });

                xhr.open('POST', `${API_URL}/products`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.send(formData);

            } catch (error) {
                console.error('Error configurando XHR:', error);
                uploadMessageDiv.textContent = `Error: ${error.message}`;
                uploadMessageDiv.classList.add('error');
                submitButton.disabled = false;
                submitButton.textContent = 'Subir Producto';
                if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';
            }
        });
    }

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