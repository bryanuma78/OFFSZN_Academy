// MENÚ MÓVIL FUNCIONAL - VERSIÓN FINAL
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('nav#navMenu');
  const close = document.querySelector('.menu-close-btn');
  const links = document.querySelectorAll('nav#navMenu a');
  const body = document.body;

  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('active');
    body.classList.add('menu-open');
    toggle.classList.add('active');
  }

  function closeMenu() {
    menu.classList.remove('active');
    body.classList.remove('menu-open');
    toggle.classList.remove('active');
  }

  // Abrir/cerrar con hamburguesa
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('active') ? closeMenu() : openMenu();
  });

  // Cerrar con X
  if (close) {
    close.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  // Cerrar al clickear link
  links.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Cerrar al clickear afuera
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('active') && 
        !menu.contains(e.target) && 
        !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Bloquear scroll cuando menú está abierto (ya está en CSS con body.menu-open)
});
