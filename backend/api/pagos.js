const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function extractIdFromUrl(url) {
  // soporta /api/pagos o /api/pagos/123
  const m = url.match(/\/api\/pagos\/?([^\/?#]*)/);
  if (!m) return null;
  return m[1] || null;
}

module.exports = async (req, res) => {
  try {
    const id = extractIdFromUrl(req.url);

    if (req.method === 'GET') {
      if (id) {
        const { data, error } = await supabase.from('pagos').select('*').eq('id', id).limit(1);
        if (error) return res.status(500).json({ error: error.message });
        return res.json(data[0] || null);
      }

      const { data, error } = await supabase.from('pagos').select('*').order('id', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    if (req.method === 'POST') {
      const { nombre, descripcion, monto, fecha, estado } = req.body;
      const { data, error } = await supabase.from('pagos').insert([{ nombre, descripcion, monto, fecha, estado }]).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data[0]);
    }

    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ error: 'ID requerido en la ruta: /api/pagos/:id' });
      const { error } = await supabase.from('pagos').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ message: 'Pago eliminado' });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!id) return res.status(400).json({ error: 'ID requerido en la ruta: /api/pagos/:id' });
      const payload = req.body || {};
      const { error } = await supabase.from('pagos').update(payload).eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ message: 'Pago actualizado' });
    }

    res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE');
    return res.status(405).end('Method Not Allowed');
  } catch (err) {
    console.error('Error en API /api/pagos:', err);
    return res.status(500).json({ error: (err && err.message) || String(err) });
  }
};
