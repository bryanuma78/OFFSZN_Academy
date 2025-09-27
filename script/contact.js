// Inicializar EmailJS
(function() {
    emailjs.init("TU_PUBLIC_KEY"); // 👈 reemplaza con tu PUBLIC KEY de EmailJS
  })();
  
  document.getElementById("contactForm").addEventListener("submit", function(e) {
    e.preventDefault();
  
    emailjs.sendForm("TU_SERVICE_ID", "TU_TEMPLATE_ID", this)
      .then(() => {
        alert("✅ Mensaje enviado correctamente. Te responderemos pronto.");
        document.getElementById("contactForm").reset();
      }, (error) => {
        alert("❌ Error al enviar el mensaje. Inténtalo de nuevo.");
        console.error("Error:", error);
      });
  });
  