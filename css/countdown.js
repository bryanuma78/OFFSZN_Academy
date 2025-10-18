// Countdown con persistencia y cierre temporal (4 horas)
(function() {
  'use strict';
  
  const CLOSED_KEY = 'offszn_countdown_closed';
  const CLOSE_DURATION = 4 * 60 * 60 * 1000; // 4 horas en milisegundos
  
  // ✅ FECHA GLOBAL FIJA - Mismo para TODOS los usuarios
  const PROMOTION_START = new Date('2025-10-17T00:00:00').getTime();
  const PROMOTION_DAYS = 30;
  const PROMOTION_END = new Date(PROMOTION_START + (PROMOTION_DAYS * 24 * 60 * 60 * 1000)).getTime();
  
  function isBannerClosed() {
    const closedTime = localStorage.getItem(CLOSED_KEY);
    if (!closedTime) return false;
    
    const now = new Date().getTime();
    const closedTimestamp = parseInt(closedTime);
    
    // Si han pasado 4 horas, eliminar el cierre
    if (now - closedTimestamp > CLOSE_DURATION) {
      localStorage.removeItem(CLOSED_KEY);
      return false;
    }
    
    return true;
  }
  
  function hideBanner() {
    const banner = document.getElementById('countdownBanner');
    
    if (banner) {
      banner.style.display = 'none';
      localStorage.setItem(CLOSED_KEY, new Date().getTime().toString());
    }
    
    // ← ELIMINADO: Todo el código de navbar.style.top y body.style.paddingTop
    //    Ya no es necesario porque ahora es estático
  }
  
  function showExpiredBanner() {
    const banner = document.getElementById('countdownBanner');
    if (!banner) return;
    
    banner.innerHTML = `
      <div class="countdown-content">
        <span class="countdown-text">✨ DISPONIBLE SOLO POR HOY ✨</span>
        <a href="/pages/Preset.html" class="countdown-btn">CONSEGUIRLO</a>
      </div>
      <button class="countdown-close" id="countdownCloseExpired" aria-label="Cerrar">×</button>
    `;
    
    document.getElementById('countdownCloseExpired').addEventListener('click', hideBanner);
  }
  
  function updateCountdown() {
    const banner = document.getElementById('countdownBanner');
    if (!banner) return;
    
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
    // Verificar si el banner está cerrado
    if (isBannerClosed()) {
      hideBanner();
      // Seguir actualizando el countdown aunque esté oculto
      setInterval(updateCountdown, 1000);
      return;
    }
    
    // Mostrar y actualizar el countdown
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Botón de cerrar
    const closeBtn = document.getElementById('countdownClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', hideBanner);
    }
  }
  
  // Iniciar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountdown);
  } else {
    initCountdown();
  }
})();
