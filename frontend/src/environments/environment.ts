/**
 * Entorno de PRODUCCIÓN.
 *
 * `apiUrl` relativo (`/api/pagos`): el frontend y la API se sirven desde el
 * mismo dominio en Vercel, así no hay CORS ni URLs que se desincronicen.
 *
 * Si mantienes el backend y el frontend en proyectos de Vercel SEPARADOS,
 * cambia esta constante por la URL absoluta de tu backend:
 *   export const environment = { apiUrl: 'https://TU-BACKEND.vercel.app/api/pagos' };
 */
export const environment = {
  apiUrl: '/api/pagos',
};
