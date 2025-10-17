// MENU MÓVIL - VERSIÓN SIMPLE Y FUNCIONAL
(function() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('nav#navMenu');
  const menuCloseBtn = document.querySelector('.menu-close-btn');
  const body = document.body;

  if (!menuToggle || !navMenu) return;

  // Abrir menú
  menuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    navMenu.classList.add('active');
    body.classList.add('menu-open');
    menuToggle.classList.add('active');
  });

  // Cerrar con X
  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      navMenu.classList.remove('active');
      body.classList.remove('menu-open');
      menuToggle.classList.remove('active');
    });
  }

  // Cerrar al clickear un link
  const links = navMenu.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', function() {
      navMenu.classList.remove('active');
      body.classList.remove('menu-open');
      menuToggle.classList.remove('active');
    });
  });

  // Cerrar al clickear afuera
  document.addEventListener('click', function(e) {
    const isActive = navMenu.classList.contains('active');
    const clickedOnMenu = navMenu.contains(e.target);
    const clickedOnToggle = menuToggle.contains(e.target);

    if (isActive && !clickedOnMenu && !clickedOnToggle) {
      navMenu.classList.remove('active');
      body.classList.remove('menu-open');
      menuToggle.classList.remove('active');
    }
  });
})();
