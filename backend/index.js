require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

//configuracion app express
const app = express();
const port = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());

//configuracion supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.get('/api', (req, res) => {
  res.send('backend de express está funcionando.');
});

//test contexión a base de datos
app.get('/api/db-test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('test_table')
      .select('*');
    if (error) {
      throw error;
    }
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al conectar a Supabase' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    //validación básica
    if (!firstName || !lastName || !email || !password) { 
      return res.status(400).json({ error: 'Nombre, apellido, email y contraseña son requeridos' });
    }

    //insertación del nuevo usuario, pronto se debe hashear la contraseña
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          first_name: firstName,
          last_name: lastName,
          email: email, 
          password: password 
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json({ message: 'Usuario registrado.', user: data[0] });

  } catch (err) {
    console.error(err.message);
    //comprobación de duplicados
    if (err.code === '23505') {
        return res.status(400).json({ error: 'Este email ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    //busqueda del usuario por email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    //comprobación de contraseñas
    const isPasswordValid = (password === user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    res.status(200).json({ 
        message: 'Inicio de sesión exitoso',
        user: { id: user.id, email: user.email, created_at: user.created_at }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

//init
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});