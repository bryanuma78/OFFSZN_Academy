// Countdown Timer - 30 Días
(function() {
  'use strict';
  
  // Configurar fecha final: 30 días desde hoy
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);
  
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = endDate - now;
    
    // Si el tiempo terminó
    if (distance < 0) {
      document.getElementById('days').textContent = '00';
      return;
    }
    
    // Calcular días restantes
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    
    // Actualizar el DOM
    document.getElementById('days').textContent = String(days).padStart(2, '0');
  }
  
  // Iniciar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    // Actualizar inmediatamente
    updateCountdown();
    
    // Actualizar cada día (cada 24 horas)
    setInterval(updateCountdown, 1000 * 60 * 60 * 24);
  });
})();
