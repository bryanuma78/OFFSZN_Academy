// Inicializar EmailJS
emailjs.init("If_WAVcuXiGSPp2SB");

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function(e) {
  e.preventDefault(); // Evita recarga de página

  emailjs.sendForm("service_w50l62y", "template_bgp3zb5", this)
    .then(() => {
      alert("¡Mensaje enviado correctamente!");
      contactForm.reset(); // Limpia los campos
    }, (error) => {
      console.error("Error al enviar:", error);
      alert("Hubo un error al enviar el mensaje. Intenta de nuevo.");
    });
});
