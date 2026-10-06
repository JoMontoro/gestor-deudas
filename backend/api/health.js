const { obtenerCliente, responderJson, traducirErrorSupabase } = require('./_shared');

module.exports = async (req, res) => {
  try {
    const supabase = obtenerCliente();
    const { error } = await supabase.from('pagos').select('id').limit(1);

    if (error) {
      const t = traducirErrorSupabase(error);
      return responderJson(res, t.codigo, {
        status: 'error',
        base_datos: 'con error',
        detalle: t.mensaje,
      });
    }

    return responderJson(res, 200, {
      status: 'ok',
      base_datos: 'conectada',
      metodo: req.method || 'GET',
    });
  } catch (err) {
    return responderJson(res, 500, {
      status: 'error',
      base_datos: 'no configurada',
      detalle: err.message,
    });
  }
};
