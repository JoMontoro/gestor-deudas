const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gestor_pagos',
  port: 3309
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a MySQL:', err.message || err);
  } else {
    console.log('Conectado a MySQL');
  }
});


// 🔹 GET
app.get('/pagos', (req, res) => {
  db.query('SELECT * FROM pagos', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// 🔹 POST
app.post('/pagos', (req, res) => {
  const { nombre, descripcion, monto, fecha, estado } = req.body;

  db.query(
    'INSERT INTO pagos (nombre, descripcion, monto, fecha, estado) VALUES (?, ?, ?, ?, ?)',
    [nombre, descripcion, monto, fecha, estado],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pago agregado' });
    }
  );
});

// 🔹 DELETE
app.delete('/pagos/:id', (req, res) => {
  db.query('DELETE FROM pagos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pago eliminado' });
  });
});

// 🔹 UPDATE
app.put('/pagos/:id', (req, res) => {
  db.query(
    'UPDATE pagos SET estado = ? WHERE id = ?',
    [req.body.estado, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pago actualizado' });
    }
  );
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});