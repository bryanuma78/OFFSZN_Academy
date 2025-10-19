// Código corregido y seguro
document.addEventListener('DOMContentLoaded', () => { // Asegúrate que todo esté dentro de aquí

  const menuToggle = document.getElementById('menuToggle');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const navMenu = document.getElementById('navMenu');

  // Verifica si el botón toggle existe antes de añadirle el listener
  if (menuToggle && navMenu) { 
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show'); // O la clase que uses para mostrar/ocultar
      document.body.classList.toggle('menu-open'); 
    });
  }

  // Verifica si el botón close existe antes de añadirle el listener
  if (menuCloseBtn && navMenu) {
    menuCloseBtn.addEventListener('click', () => {
      navMenu.classList.remove('show');
      document.body.classList.remove('menu-open');
    });
  }

  // --- AQUÍ VA LA LÓGICA DE LOGIN QUE YA TENÍAS ---
  const authToken = localStorage.getItem('authToken');
  const body = document.body;
  const globalLogoutButton = document.getElementById('global-logout-button');

  if (authToken) {
    body.classList.add('user-logged-in');
  } else {
    body.classList.remove('user-logged-in');
  }

  if (globalLogoutButton) {
    globalLogoutButton.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      alert('¡Has cerrado sesión!');
      window.location.replace('/index.html');
    });
  }
  // --- FIN LÓGICA LOGIN ---

}); // Cierre del DOMContentLoaded