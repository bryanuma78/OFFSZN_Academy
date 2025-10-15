// Countdown con persistencia en localStorage
(function() {
  'use strict';
  
  const STORAGE_KEY = 'offszn_countdown_end_date';
  const COUNTDOWN_BANNER = document.querySelector('.countdown-banner');
  
  function getEndDate() {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const endDate = new Date(stored);
      // Verificar que no sea una fecha vieja
      if (endDate > new Date()) {
        return endDate;
      }
    }
    
    // Si no existe o pasó, crear nueva fecha: 30 días desde ahora
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30);
    localStorage.setItem(STORAGE_KEY, newEndDate.toISOString());
    return newEndDate;
  }
  
  function updateCountdown() {
    const now = new Date().getTime();
    const endDate = getEndDate();
    const distance = endDate - now;
    
    const daysElement = document.getElementById('days');
    const bannerContent = document.querySelector('.countdown-content');
    
    if (!daysElement || !bannerContent) return;
    
    if (distance <= 0) {
      // Tiempo terminado
      COUNTDOWN_BANNER.innerHTML = `
        <div class="countdown-content">
          <span class="countdown-text">✨ DISPONIBLE SOLO POR HOY ✨</span>
        </div>
      `;
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    daysElement.textContent = String(days).padStart(2, '0');
  }
  
  // Iniciar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    updateCountdown();
    // Actualizar cada segundo
    setInterval(updateCountdown, 1000);
  });
})();
