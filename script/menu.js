document.addEventListener('DOMContentLoaded', () => {

  const menuToggle = document.getElementById('menuToggle');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) { 
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show'); 
      document.body.classList.toggle('menu-open'); 
    });
  }

  if (menuCloseBtn && navMenu) {
    menuCloseBtn.addEventListener('click', () => {
      navMenu.classList.remove('show');
      document.body.classList.remove('menu-open');
    });
  }

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

});