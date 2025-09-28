// Inicializa EmailJS con tu Public Key
emailjs.init("If_WAVcuXiGSPp2SB");

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function(e) {
  e.preventDefault();

  emailjs.sendForm("service_w50l62y", "template_bgp3z", this)
    .then(() => {
      alert("¡Mensaje enviado con éxito!");
      contactForm.reset(); // limpia el formulario
    })
    .catch((error) => {
      console.error("Error al enviar el mensaje:", error);
      alert("Ocurrió un error. Intenta nuevamente.");
    });
});
