document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('admin-logout-button');

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('adminAuthToken');
            alert('Has cerrado sesión del panel de administrador.');
            window.location.replace('/pages/login.html');
        });
    }

    // Aquí añadiremos la lógica para cargar contenido dinámicamente
    // loadContent('dashboard'); // Ejemplo
});
