// Countdown con persistencia en localStorage
(function() {
  'use strict';
  
  const STORAGE_KEY = 'offszn_countdown_end_date';
  const COUNTDOWN_BANNER = document.querySelector('.countdown-banner');
  
  function getEndDate() {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const endDate = new Date(stored);
      if (endDate > new Date()) {
        return endDate;
      }
    }
    
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
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (!daysElement) return;
    
    if (distance <= 0) {
      COUNTDOWN_BANNER.innerHTML = `
        <div class="countdown-content">
          <span class="countdown-text">✨ DISPONIBLE SOLO POR HOY ✨</span>
          <a href="/pages/Preset.html" class="countdown-btn">CONSEGUIRLO</a>
          <button class="countdown-close" onclick="this.closest('.countdown-banner').style.display='none';">×</button>
        </div>
      `;
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    daysElement.textContent = String(days).padStart(2, '0');
    if (hoursElement) hoursElement.textContent = String(hours).padStart(2, '0');
    if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, '0');
    if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, '0');
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  });
})();
