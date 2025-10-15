// Countdown con persistencia y cierre temporal (4 horas)
(function() {
  'use strict';
  
  const COUNTDOWN_KEY = 'offszn_countdown_end';
  const CLOSED_KEY = 'offszn_countdown_closed';
  const CLOSE_DURATION = 4 * 60 * 60 * 1000; // 4 horas en milisegundos
  
  function getOrCreateEndDate() {
    let stored = localStorage.getItem(COUNTDOWN_KEY);
    
    if (stored) {
      const endDate = new Date(stored);
      if (endDate > new Date()) {
        return endDate;
      }
    }
    
    // Crear nueva fecha: 30 días desde ahora
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30);
    localStorage.setItem(COUNTDOWN_KEY, newEndDate.toISOString());
    return newEndDate;
  }
  
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
    const navbar = document.getElementById('navbar');
    
    if (banner) {
      banner.style.display = 'none';
      localStorage.setItem(CLOSED_KEY, new Date().getTime().toString());
    }
    
    if (navbar) {
      navbar.style.top = '0';
      document.body.style.paddingTop = '0';
    }
  }
  
  function showExpiredBanner() {
    const banner = document.getElementById('countdownBanner');
    if (!banner) return;
    
    banner.innerHTML = `
      <div class="countdown-content">
        <span class="countdown-text">✨ DISPONIBLE SOLO POR HOY ✨</span>
        <a href="/pages/Preset.html" class="countdown-btn">CONSEGUIRLO</a>
      </div>
      <button class="countdown-close" id="countdownCloseExpired">×</button>
    `;
    
    document.getElementById('countdownCloseExpired').addEventListener('click', hideBanner);
  }
  
  function updateCountdown() {
    const banner = document.getElementById('countdownBanner');
    if (!banner) return;
    
    const endDate = getOrCreateEndDate();
    const now = new Date().getTime();
    const distance = endDate - now;
    
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
