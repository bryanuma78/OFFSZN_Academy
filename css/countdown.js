// ========================================
// COUNTDOWN GLOBAL - SIN FLASH
// ========================================
(function() {
  'use strict';
  
  // Detectar si estamos en la página de inicio
  const isHomePage = window.location.pathname === '/' || 
                     window.location.pathname === '/index.html' ||
                     window.location.pathname.endsWith('index.html') ||
                     window.location.pathname === '';
  
  // Agregar clase .homepage al body en la página de inicio
  if (isHomePage) {
    document.body.classList.add('homepage');
  } else {
    // En otras páginas, ocultar el countdown INMEDIATAMENTE
    document.body.classList.remove('homepage');
  }
  
  // Si NO es homepage, salir aquí (el CSS ya ocultó el countdown)
  if (!isHomePage) {
    return;
  }
  
  // SOLO ejecutar el countdown en la página de inicio
  const CLOSED_KEY = 'offszn_countdown_closed_v2';
  const CLOSE_DURATION = 4 * 60 * 60 * 1000; // 4 horas
  
  const PROMOTION_START = new Date('2025-10-17T00:00:00').getTime();
  const PROMOTION_DAYS = 30;
  const PROMOTION_END = new Date(PROMOTION_START + (PROMOTION_DAYS * 24 * 60 * 60 * 1000)).getTime();
  
  function isBannerClosed() {
    const closedTime = sessionStorage.getItem(CLOSED_KEY);
    if (!closedTime) return false;
    
    const now = new Date().getTime();
    const closedTimestamp = parseInt(closedTime);
    
    return now - closedTimestamp < CLOSE_DURATION;
  }
  
  function hideBanner() {
    const banner = document.getElementById('countdownBanner');
    if (banner) {
      banner.classList.add('hidden');
      sessionStorage.setItem(CLOSED_KEY, new Date().getTime().toString());
    }
  }
  
  function showExpiredBanner() {
    const banner = document.getElementById('countdownBanner');
    if (!banner) return;
    
    banner.innerHTML = `
      <div class="countdown-content">
        <span class="countdown-text">✨ DISPONIBLE SOLO POR HOY ✨</span>
        <a href="#pricing" class="countdown-btn">CONSEGUIRLO</a>
      </div>
      <button class="countdown-close" id="countdownCloseExpired" aria-label="Cerrar">×</button>
    `;
    
    document.getElementById('countdownCloseExpired').addEventListener('click', hideBanner);
  }
  
  function updateCountdown() {
    const banner = document.getElementById('countdownBanner');
    if (!banner || banner.classList.contains('hidden')) return;
    
    const now = new Date().getTime();
    const distance = PROMOTION_END - now;
    
    if (distance <= 0) {
      showExpiredBanner();
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
  
  function initCountdown() {
    // Si ya estaba cerrado, mantenerlo cerrado
    if (isBannerClosed()) {
      hideBanner();
    }
    
    // Actualizar countdown cada segundo
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Agregar evento al botón cerrar
    const closeBtn = document.getElementById('countdownClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideBanner);
    }
  }
  
  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountdown);
  } else {
    initCountdown();
  }
})();
