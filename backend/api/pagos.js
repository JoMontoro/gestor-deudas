const {
  obtenerCliente,
  responderPreflight,
  responderJson,
  responderError,
  traducirErrorSupabase,
} = require('./_shared');

const ESTADOS = ['pendiente', 'pagado'];
const CAMPOS_EDITABLES = ['nombre', 'descripcion', 'monto', 'fecha', 'estado'];

function extraerId(url) {
  const coincidencia = url.match(/\/api\/pagos\/?([^\/?#]*)/);
  if (!coincidencia) return null;
  const bruto = coincidencia[1];
  if (!bruto) return null;
  if (!/^\d+$/.test(bruto)) return NaN;
  return Number(bruto);
}

/**
 * Normaliza y valida el cuerpo de un pago.
 * @returns {{ok: true, valor: object} | {ok: false, mensaje: string}}
 */
function validarPago(cuerpo, { parcial = false } = {}) {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    return { ok: false, mensaje: 'El cuerpo de la petición debe ser un objeto JSON.' };
  }

  const valor = {};
  const errores = [];

  if ('nombre' in cuerpo || !parcial) {
    const nombre = typeof cuerpo.nombre === 'string' ? cuerpo.nombre.trim() : '';
    if (!nombre) errores.push('"nombre" es obligatorio.');
    else if (nombre.length > 255) errores.push('"nombre" no puede superar 255 caracteres.');
    else valor.nombre = nombre;
  }

  if ('descripcion' in cuerpo) {
    const descripcion =
      cuerpo.descripcion === null || cuerpo.descripcion === undefined
        ? ''
        : String(cuerpo.descripcion).trim();
    if (descripcion.length > 2000) errores.push('"descripcion" no puede superar 2000 caracteres.');
    else valor.descripcion = descripcion;
  }

  if ('monto' in cuerpo || !parcial) {
    const monto = Number(cuerpo.monto);
    if (cuerpo.monto === '' || cuerpo.monto === null || Number.isNaN(monto)) {
      errores.push('"monto" debe ser un número.');
    } else if (monto <= 0) {
      errores.push('"monto" debe ser mayor que 0.');
    } else if (monto > 99999999.99) {
      errores.push('"monto" excede el máximo permitido (99999999.99).');
    } else {
      valor.monto = monto;
    }
  }

  if ('fecha' in cuerpo || !parcial) {
    const fecha = typeof cuerpo.fecha === 'string' ? cuerpo.fecha.trim() : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      errores.push('"fecha" debe tener el formato YYYY-MM-DD.');
    } else if (Number.isNaN(Date.parse(`${fecha}T00:00:00Z`))) {
      errores.push('"fecha" no es una fecha válida.');
    } else {
      valor.fecha = fecha;
    }
  }

  if ('estado' in cuerpo) {
    const estado = typeof cuerpo.estado === 'string' ? cuerpo.estado.trim().toLowerCase() : '';
    if (!ESTADOS.includes(estado)) {
      errores.push(`"estado" debe ser uno de: ${ESTADOS.join(', ')}.`);
    } else {
      valor.estado = estado;
    }
  }

  if (errores.length > 0) {
    return { ok: false, mensaje: errores.join(' ') };
  }

  return { ok: true, valor };
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return responderPreflight(res);
  }

  const id = extraerId(req.url);

  if (Number.isNaN(id)) {
    return responderError(res, 400, 'El identificador de la ruta debe ser numérico.');
  }

  let supabase;
  try {
    supabase = obtenerCliente();
  } catch (err) {
    return responderError(res, 500, err.message);
  }

  try {
    if (req.method === 'GET') {
      if (id) {
        const { data, error } = await supabase
          .from('pagos')
          .select('*')
          .eq('id', id)
          .limit(1);

        if (error) {
          const t = traducirErrorSupabase(error);
          return responderError(res, t.codigo, t.mensaje, error.message);
        }

        return responderJson(res, 200, data[0] || null);
      }

      const { data, error } = await supabase
        .from('pagos')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        const t = traducirErrorSupabase(error);
        return responderError(res, t.codigo, t.mensaje, error.message);
      }

      return responderJson(res, 200, data);
    }

    if (req.method === 'POST') {
      const validado = validarPago(req.body);
      if (!validado.ok) {
        return responderError(res, 400, validado.mensaje);
      }

      const registro = { estado: 'pendiente', ...validado.valor };

      const { data, error } = await supabase
        .from('pagos')
        .insert([registro])
        .select()
        .single();

      if (error) {
        const t = traducirErrorSupabase(error);
        return responderError(res, t.codigo, t.mensaje, error.message);
      }

      return responderJson(res, 201, data);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!id) {
        return responderError(res, 400, 'Falta el id. Usa /api/pagos/:id para actualizar.');
      }

      const validado = validarPago(req.body, { parcial: true });
      if (!validado.ok) {
        return responderError(res, 400, validado.mensaje);
      }

      const cambios = {};
      for (const campo of CAMPOS_EDITABLES) {
        if (campo in validado.valor) cambios[campo] = validado.valor[campo];
      }

      if (Object.keys(cambios).length === 0) {
        return responderError(
          res,
          400,
          `No hay campos editables en la petición. Permitidos: ${CAMPOS_EDITABLES.join(', ')}.`
        );
      }

      const { data, error } = await supabase
        .from('pagos')
        .update(cambios)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        const t = traducirErrorSupabase(error);
        return responderError(res, t.codigo, t.mensaje, error.message);
      }

      if (!data) {
        return responderError(res, 404, `No existe un pago con id ${id}.`);
      }

      return responderJson(res, 200, data);
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return responderError(res, 400, 'Falta el id. Usa /api/pagos/:id para eliminar.');
      }

      const { data, error } = await supabase
        .from('pagos')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) {
        const t = traducirErrorSupabase(error);
        return responderError(res, t.codigo, t.mensaje, error.message);
      }

      if (!data || data.length === 0) {
        return responderError(res, 404, `No existe un pago con id ${id}.`);
      }

      return responderJson(res, 200, { message: 'Pago eliminado', id });
    }

    res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    return responderError(res, 405, `Método ${req.method} no permitido.`);
  } catch (err) {
    return responderError(res, 500, err.message || 'Error inesperado en el servidor.', err);
  }
};
