// MENÚ MÓVIL FUNCIONAL
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('nav#navMenu');
  const closeBtn = document.querySelector('.menu-close-btn');
  const links = document.querySelectorAll('nav#navMenu a');

  if (!toggle || !menu) return;

  // Abrir/cerrar menú
  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    menu.classList.toggle('show');
    document.body.classList.toggle('menu-open');
  });

  // Cerrar con X
  if (closeBtn) {
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      menu.classList.remove('show');
      document.body.classList.remove('menu-open');
    });
  }

  // Cerrar al clickear link
  links.forEach(link => {
    link.addEventListener('click', function() {
      menu.classList.remove('show');
      document.body.classList.remove('menu-open');
    });
  });

  // Cerrar al clickear afuera
  document.addEventListener('click', function(e) {
    if (menu.classList.contains('show') && 
        !menu.contains(e.target) && 
        !toggle.contains(e.target)) {
      menu.classList.remove('show');
      document.body.classList.remove('menu-open');
    }
  });
});
