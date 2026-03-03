const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔹 GET - Obtener todos los pagos
app.get('/api/pagos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 POST - Crear nuevo pago
app.post('/api/pagos', async (req, res) => {
  try {
    const { nombre, descripcion, monto, fecha, estado } = req.body;

    const { data, error } = await supabase
      .from('pagos')
      .insert([{ nombre, descripcion, monto, fecha, estado }])
      .select();

    if (error) throw error;
    res.json({ message: 'Pago agregado', data: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 DELETE - Eliminar pago
app.delete('/api/pagos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Pago eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 PUT - Actualizar pago
app.put('/api/pagos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const { error } = await supabase
      .from('pagos')
      .update({ estado })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Pago actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API running on Vercel' });
});

module.exports = app;
