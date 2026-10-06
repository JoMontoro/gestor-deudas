const { createClient } = require('@supabase/supabase-js');

let cliente;

function obtenerCliente() {
  if (cliente) return cliente;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    const error = new Error(
      'Faltan las variables de entorno SUPABASE_URL y/o SUPABASE_KEY. ' +
        'Defínelas en backend/.env.local (desarrollo) o en el panel de Vercel (producción).'
    );
    error.codigo = 'ENV_FALTANTE';
    throw error;
  }

  cliente = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cliente;
}

function aplicarCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function responderPreflight(res) {
  aplicarCors(res);
  res.status(204).end();
}

function responderJson(res, codigo, cuerpo) {
  aplicarCors(res);
  res.status(codigo).json(cuerpo);
}

function responderError(res, codigo, mensaje, detalle) {
  const cuerpo = { error: mensaje };
  if (detalle) cuerpo.detalle = detalle;
  console.error(`[api/pagos] ${codigo}: ${mensaje}`, detalle || '');
  responderJson(res, codigo, cuerpo);
}

/**
 * Traduce los errores de PostgREST a mensajes accionables.
 */
function traducirErrorSupabase(error) {
  const codigo = error.code || '';

  if (codigo === '42501' || /row-level security|RLS/i.test(error.message || '')) {
    return {
      codigo: 500,
      mensaje:
        'Supabase rechazó la operación por políticas de seguridad (RLS). ' +
        'Revisa que la tabla "pagos" tenga una política que permita el acceso.',
    };
  }

  if (/relation .* does not exist/i.test(error.message || '')) {
    return {
      codigo: 500,
      mensaje:
        'La tabla "pagos" no existe en Supabase. Ejecuta el script SQL de DEPLOYMENT.md.',
    };
  }

  if (/invalid input syntax|bigint/i.test(error.message || '')) {
    return {
      codigo: 400,
      mensaje: 'El identificador enviado no es un número válido.',
    };
  }

  if (codigo === '23505') {
    return { codigo: 409, mensaje: 'Ya existe un registro con esos datos.' };
  }

  if (/invalid input syntax for type (numeric|date)/i.test(error.message || '')) {
    return { codigo: 400, mensaje: 'El monto o la fecha tienen un formato inválido.' };
  }

  return {
    codigo: 500,
    mensaje: error.message || 'Error desconocido al hablar con Supabase.',
  };
}

module.exports = {
  obtenerCliente,
  aplicarCors,
  responderPreflight,
  responderJson,
  responderError,
  traducirErrorSupabase,
};
