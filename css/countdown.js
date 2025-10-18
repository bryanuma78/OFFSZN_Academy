// ========================================
// COUNTDOWN GLOBAL - SOLO EN INICIO
// ========================================
(function() {
  'use strict';
  
  // Configuración
  const CLOSED_KEY = 'offszn_countdown_closed';
  const CLOSE_DURATION = 4 * 60 * 60 * 1000; // 4 horas
  
  const PROMOTION_START = new Date('2025-10-17T00:00:00').getTime();
  const PROMOTION_DAYS = 30;
  const PROMOTION_END = new Date(PROMOTION_START + (PROMOTION_DAYS * 24 * 60 * 60 * 1000)).getTime();
  
  // Verificar si estamos en la página de inicio
  function isHomePage() {
    const pathname = window.location.pathname;
    return pathname === '/' || 
           pathname === '/index.html' ||
           pathname.endsWith('/index.html');
  }
  
  // Verificar si el countdown fue cerrado recientemente
  function isBannerClosed() {
    const closedTime = localStorage.getItem(CLOSED_KEY);
    if (!closedTime) return false;
    
    const now = new Date().getTime();
    const closedTimestamp = parseInt(closedTime);
    
    return now - closedTimestamp < CLOSE_DURATION;
  }
  
  // Cerrar el banner
  function closeBanner() {
    const banner = document.getElementById('countdownBanner');
    if (banner) {
      banner.style.display = 'none';
      localStorage.setItem(CLOSED_KEY, new Date().getTime().toString());
    }
  }
  
  // Actualizar el countdown
  function updateCountdown() {
    const banner = document.getElementById('countdownBanner');
    if (!banner || banner.style.display === 'none') return;
    
    const now = new Date().getTime();
    const distance = PROMOTION_END - now;
    
    if (distance <= 0) {
      closeBanner();
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }
  
  // Inicializar
  function init() {
    const banner = document.getElementById('countdownBanner');
    
    // Si no estamos en homepage, ocultar el banner
    if (!isHomePage()) {
      if (banner) {
        banner.style.display = 'none';
      }
      return;
    }
    
    // Si estamos en homepage pero fue cerrado, mantenerlo cerrado
    if (isBannerClosed()) {
      if (banner) {
        banner.style.display = 'none';
      }
      return;
    }
    
    // Si estamos en homepage y no fue cerrado, mostrar y actualizar
    if (banner) {
      banner.style.display = 'flex';
    }
    
    // Actualizar countdown cada segundo
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Agregar evento al botón cerrar
    const closeBtn = document.getElementById('countdownClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeBanner);
    }
  }
  
  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
