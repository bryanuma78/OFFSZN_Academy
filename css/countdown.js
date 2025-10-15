// Countdown persiste y corre continuamente
(function() {
  'use strict';
  
  const STORAGE_KEY = 'offszn_countdown_end_date';
  
  function getOrCreateEndDate() {
    let stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const endDate = new Date(stored);
      // Si todavía hay tiempo, usa esa fecha
      if (endDate > new Date()) {
        return endDate;
      }
    }
    
    // Crear nueva fecha: 30 días desde ahora
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30);
    localStorage.setItem(STORAGE_KEY, newEndDate.toISOString());
    return newEndDate;
  }
  
  function updateCountdown() {
    const banner = document.querySelector('.countdown-banner');
    if (!banner) return;
    
    const endDate = getOrCreateEndDate();
    const now = new Date().getTime();
    const distance = endDate - now;
    
    if (distance <= 0) {
      // Tiempo terminado - mostrar mensaje
      banner.innerHTML = `
        <div class="countdown-content">
          <span class="countdown-text">✨ DISPONIBLE SOLO POR HOY ✨</span>
          <a href="/pages/Preset.html" class="countdown-btn">CONSEGUIRLO</a>
          <button class="countdown-close" onclick="this.closest('.countdown-banner').style.display='none';">×</button>
        </div>
      `;
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    
    // Calcular tiempo restante
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Actualizar valores
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }
  
  // Iniciar inmediatamente
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateCountdown();
      setInterval(updateCountdown, 1000);
    });
  } else {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
})();
