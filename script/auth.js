document.addEventListener('DOMContentLoaded', () => {

  //url del backend
  let API_URL = '';

  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
    //para desarrollo local
    API_URL = 'http://localhost:3001/api';
  } else {
    //para producción
    API_URL = 'https://offszn-academy.onrender.com/api';
  }

  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const messageDiv = document.getElementById('form-message');

  // --- LÓGICA DE REGISTRO ---
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('reg-first-name').value;
      const lastName = document.getElementById('reg-last-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;

      //se envían los datos al backend (al api/register)
      try {
        const response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ firstName, lastName, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // ¡Éxito!
          showMessage(messageDiv, '¡Registro exitoso! Ya puedes iniciar sesión.', false);
          registerForm.reset();
        } else {
          showMessage(messageDiv, data.error, true);
        }
      } catch (error) {
        console.error('Error de red:', error);
        showMessage(messageDiv, 'Error de conexión. Inténtalo más tarde.', true);
      }
    });
  }

  // --- LÓGICA DE LOGIN ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('log-email').value;
      const password = document.getElementById('log-password').value;

      //se envían los datos al backend (al api/login)
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          //se guarda el token en el navegador
          localStorage.setItem('authToken', data.token);

          //se redirige a la página protegida
          window.location.href = '/pages/dashboard.html';
        } else {
          showMessage(messageDiv, data.error, true);
        }
      } catch (error) {
        console.error('Error de red:', error);
        showMessage(messageDiv, 'Error de conexión. Inténtalo más tarde.', true);
      }
    });
  }

  //función para mostrar mensajes de éxito o error
  function showMessage(element, message, isError = true) {
    element.textContent = message;
    element.className = 'form-message';

    if (isError) {
      element.classList.add('error');
    } else {
      element.classList.add('success');
    }
  }
});