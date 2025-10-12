const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.navbar nav');

menuToggle.addEventListener('click', () => {
  nav.classList.toggle('active');
});
