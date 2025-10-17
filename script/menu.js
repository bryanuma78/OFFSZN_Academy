document.querySelector('.menu-toggle').onclick = function() {
  document.querySelector('nav#navMenu').classList.toggle('show');
};

document.querySelector('.menu-close-btn').onclick = function() {
  document.querySelector('nav#navMenu').classList.remove('show');
};

document.querySelectorAll('nav#navMenu a').forEach(link => {
  link.onclick = function() {
    document.querySelector('nav#navMenu').classList.remove('show');
  };
});
