require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { client } = require('./paypalClient');
const paypal = require('@paypal/checkout-server-sdk');
const bcrypt = require('bcrypt');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (token == null) {
    return res.sendStatus(401)
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}

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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //insertación del nuevo usuario, pronto se debe hashear la contraseña
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          first_name: firstName,
          last_name: lastName,
          email: email, 
          password: hashedPassword
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
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
        message: 'Inicio de sesión exitoso',
        token: token,
        user: { id: user.id, email: user.email, created_at: user.created_at }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*'); // '*' significa "todas las columnas"

    if (error) {
      throw error;
    }

    res.status(200).json(data);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

app.post('/api/orders/create', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('name, price')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        description: product.name,
        amount: {
          currency_code: 'USD',
          value: product.price.toString()
        }
      }]
    });

    const order = await client().execute(request);
    const paypalOrderId = order.result.id;

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        product_id: productId,
        paypal_order_id: paypalOrderId,
        status: 'created',
        total_price: product.price
      });

    if (orderError) {
      throw orderError;
    }

    res.status(201).json({ orderID: paypalOrderId });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
});

app.post('/api/orders/capture', authenticateToken, async (req, res) => {
  try {
    const { orderID } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await client().execute(request);
    const captureStatus = capture.result.status;

    if (captureStatus === 'COMPLETED') {

      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('paypal_order_id', orderID);

      if (updateError) {
        console.error("Error al actualizar la orden en Supabase:", updateError);
      }

      res.status(200).json({ status: 'COMPLETED', capture: capture.result });

    } else {
      res.status(400).json({ status: 'NOT_COMPLETED', capture: capture.result });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al capturar el pago' });
  }
});

app.get('/api/my-products', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        product_id, 
        products (id, name, description, image_url, download_url) 
      `)
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (ordersError) {
      throw ordersError;
    }

    const purchasedProducts = orders.map(order => order.products);
    
    res.status(200).json(purchasedProducts);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Error al obtener los productos comprados' });
  }
});

//init
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});