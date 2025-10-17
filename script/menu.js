// ✅ MENÚ MÓVIL CORREGIDO - SIN BUGS DE POINTER-EVENTS

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const navLinks = document.querySelectorAll('#navbarLinks a');

  // Función para cerrar menú
  function closeMenu() {
    // Habilitar links INMEDIATAMENTE
    navLinks.forEach(link => {
      link.style.pointerEvents = 'auto';
    });
    
    navMenu.classList.remove('active');
    document.body.classList.remove('menu-open');
    if (menuToggle) {
      menuToggle.classList.remove('active');
      menuToggle.querySelector('i').className = 'bi bi-list';
    }
  }

  // Función para abrir menú
  function openMenu() {
    navMenu.classList.add('active');
    document.body.classList.add('menu-open');
    if (menuToggle) {
      menuToggle.classList.add('active');
      menuToggle.querySelector('i').className = 'bi bi-x-lg';
    }
  }

  // Toggle del menú (hamburguesa)
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      
      if (navMenu.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  // Cerrar con botón X
  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeMenu();
    });
  }

  // Cerrar al hacer clic en un link Y NAVEGAR
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      closeMenu();
      // Dejar que el navegador siga el link naturalmente
    });
  });

  // Cerrar al hacer clic fuera (en el overlay)
  document.addEventListener('click', function(e) {
    if (!navMenu || !menuToggle) return;
    
    const isMenuOpen = navMenu.classList.contains('active');
    
    if (isMenuOpen) {
      // Verificar si el clic está fuera del menú y del toggle
      const isClickOnMenu = navMenu.contains(e.target);
      const isClickOnToggle = menuToggle.contains(e.target);
      
      if (!isClickOnMenu && !isClickOnToggle) {
        closeMenu();
      }
    }
  });

  // Prevenir cierre al hacer clic dentro del menú
  if (navMenu) {
    navMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
});
