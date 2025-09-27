// Inicializa EmailJS con tu Public Key
emailjs.init("If_WAVcuXiGSPp2SB");

// Seleccionamos el formulario
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function (e) {
  e.preventDefault(); // Evita que la página se recargue

  // Envía el formulario usando EmailJS
  emailjs.sendForm("service_w50l62y", "template_bgp3zb5", this)
    .then(() => {
      // Mensaje de éxito
      alert("¡Mensaje enviado correctamente!");
      contactForm.reset(); // Limpia los campos del formulario
    }, (error) => {
      // Mensaje de error
      console.error("Error al enviar:", error);
      alert("Hubo un error al enviar el mensaje. Intenta de nuevo.");
    });
});
