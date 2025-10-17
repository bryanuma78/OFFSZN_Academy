document.querySelector('.menu-toggle').onclick = function() {
  document.querySelector('nav#navMenu').classList.toggle('show');
  document.body.classList.toggle('menu-open');
};

document.querySelector('.menu-close-btn').onclick = function() {
  document.querySelector('nav#navMenu').classList.remove('show');
  document.body.classList.remove('menu-open');
};

document.querySelectorAll('nav#navMenu a').forEach(link => {
  link.onclick = function() {
    document.querySelector('nav#navMenu').classList.remove('show');
    document.body.classList.remove('menu-open');
  };
});
