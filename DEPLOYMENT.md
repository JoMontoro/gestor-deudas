# 🚀 Guía de Deployment: Vercel + Supabase

## Paso 1: Crear cuenta en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (con GitHub recomendado)
2. Crea un nuevo proyecto
3. En **Settings → Database**, copia:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_KEY` (Service Role key — cuidado: es sensible)
4. En el **SQL Editor**, ejecuta este script para crear la tabla:

```sql
CREATE TABLE pagos (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  monto DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_estado ON pagos(estado);
CREATE INDEX idx_fecha ON pagos(fecha);

-- RLS (Row Level Security) — opcional pero recomendado
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON pagos FOR ALL USING (true);
```

---

## Paso 2: Preparar Backend para Vercel

### 2.1 Instalar dependencias
```bash
cd backend
npm install
npm install @supabase/supabase-js vercel --save
```

### 2.2 Crear `.env.local` (para desarrollo)
```bash
# En backend/.env.local
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_service_role_key_aqui
```

### 2.3 Instalar Vercel CLI
```bash
npm install -g vercel
```

### 2.4 Linkar proyecto a Vercel
```bash
cd backend
vercel
# Sigue las instrucciones (crea cuenta si no la tienes)
```

### 2.5 Configurar variables en Vercel
```bash
vercel env add SUPABASE_URL
# Pega: https://tu-proyecto.supabase.co

vercel env add SUPABASE_KEY
# Pega: tu_service_role_key_aqui
```

---

## Paso 3: Deploy Backend a Vercel

```bash
cd backend
vercel deploy --prod
```

✅ Verás una URL como: `https://tu-dominio.vercel.app`  
Anota esta URL.

---

## Paso 4: Actualizar Frontend

### 4.1 Cambiar URL del API en `pagos.ts`
En `frontend/src/app/services/pagos.ts`, reemplaza:

```typescript
// const API_URL = 'http://localhost:3000/api/pagos'; // Desarrollo
const API_URL = 'https://tu-dominio-vercel.vercel.app/api/pagos'; // Producción
```

### 4.2 Deploy Frontend a Vercel
```bash
cd frontend
vercel
# Sigue las instrucciones para crear/linkear proyecto
```

```bash
# Deploy a producción
vercel deploy --prod
```

✅ Verás una URL como: `https://tu-frontend.vercel.app`

---

## Paso 5: Pruebas en Producción

1. Abre tu URL del frontend en Vercel
2. Intenta agregar un pago
3. Si ves errores, revisa:
   - **Network tab** en DevTools (F12) para ver status de requests
   - **Logs en Vercel**: `vercel logs`
   - **Logs de Supabase**: Dashboard → Logs

---

## 🔧 Desarrollo Local

Para desarrollar localmente:

```bash
# Terminal 1 - Backend
cd backend
npm run dev  # Usa vercel dev

# Terminal 2 - Frontend
cd frontend
npm run start  # ng serve
```

Backend estará en: `http://localhost:3000`  
Frontend en: `http://localhost:4200`

---

## 📋 Estructura del Proyecto Actualizado

```
gestor-deudas/
├── backend/
│   ├── api/
│   │   └── index.js          (Express app + rutas Supabase)
│   ├── server.js             (Local dev)
│   ├── vercel.json           (Config Vercel)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── services/
│   │   │       └── pagos.ts  (⬅️ Actualiza API_URL aquí)
│   │   └── ...
│   └── package.json
└── README.md
```

---

## 🆘 Solución de Problemas

### Error: "Connection refused"
- Verifica que `SUPABASE_URL` y `SUPABASE_KEY` están bien en Vercel

### Error: "Table not found"
- Copia el script SQL del Paso 1.4 en Supabase SQL Editor

### Error: CORS
- Las headers CORS ya están configuradas en `api/index.js`

### Frontend no ve los datos
- Abre DevTools → Network → busca la request a `/api/pagos`
- Verifica que devolve status 200 y datos JSON válidos

---

## 🔐 Seguridad

**Después de deployar:**
1. En Supabase → Settings → API → cambiar a `anon` key (pública) si necesitas + seguridad
2. Usar variables de entorno para credenciales sensibles ✅ (ya configurado)
3. Actualizar CORS si es necesario en `api/index.js`

---

## 📞 Comandos útiles

```bash
# Ver logs de Vercel
vercel logs

# Redeploy sin cambios
vercel deploy --prod

# Eliminar deployment
vercel remove

# Ver variables de entorno en Vercel
vercel env list
```

---

¡Listo! 🎉 Tu app ahora está lista para producción con Vercel + Supabase.
