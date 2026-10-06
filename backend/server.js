const path = require('path');
const express = require('express');
const cors = require('cors');

require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config();

const app = express();
const pagos = require('./api/pagos');
const health = require('./api/health');

const PUERTO = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API de pagos (desarrollo local)',
    endpoints: {
      pagos: '/api/pagos',
      health: '/api/health',
    },
  });
});

// Se reutilizan los mismos handlers que Vercel despliega, montando con app.use
// (no con app.get/post) para conservar el prefijo /api dentro de req.url.
app.use((req, res, next) => {
  if (req.url.split('?')[0] === '/api/health' || req.url.startsWith('/api/health?')) {
    return health(req, res);
  }
  if (req.url.split('?')[0].startsWith('/api/pagos')) {
    return pagos(req, res);
  }
  next();
});

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('[server] error no controlado:', err);
  res.status(500).json({ error: err.message || 'Error interno del servidor.' });
});

if (require.main === module) {
  app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
    console.log(`  GET    http://localhost:${PUERTO}/api/pagos`);
    console.log(`  GET    http://localhost:${PUERTO}/api/health`);

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.warn('');
      console.warn('AVISO: faltan SUPABASE_URL y/o SUPABASE_KEY.');
      console.warn('Copia backend/.env.example a backend/.env.local y rellénalo.');
    }
  });
}

module.exports = app;
