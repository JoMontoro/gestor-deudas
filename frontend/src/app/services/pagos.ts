import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

export type EstadoPago = 'pendiente' | 'pagado';

export interface Pago {
  id: number;
  nombre: string;
  descripcion: string | null;
  monto: number;
  fecha: string;
  estado: EstadoPago;
  created_at?: string;
}

export interface NuevoPago {
  nombre: string;
  descripcion: string;
  monto: number;
  fecha: string;
  estado: EstadoPago;
}

/** Error normalizado que la vista puede mostrar tal cual. */
export class ApiError extends Error {
  constructor(
    override readonly message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

@Injectable({ providedIn: 'root' })
export class PagosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getPagos(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl).pipe(catchError((e) => this.normalizar(e)));
  }

  addPago(pago: NuevoPago): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, pago).pipe(catchError((e) => this.normalizar(e)));
  }

  updatePago(id: number, cambios: Partial<NuevoPago>): Observable<Pago> {
    return this.http
      .put<Pago>(`${this.apiUrl}/${id}`, cambios)
      .pipe(catchError((e) => this.normalizar(e)));
  }

  cambiarEstado(pago: Pago): Observable<Pago> {
    const siguiente: EstadoPago = pago.estado === 'pagado' ? 'pendiente' : 'pagado';
    return this.updatePago(pago.id, { estado: siguiente });
  }

  deletePago(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(map(() => undefined), catchError((e) => this.normalizar(e)));
  }

  /**
   * Convierte cualquier fallo de HTTP en un ApiError legible.
   * Sin esto, los fallos se tragan en silencio (el bug original).
   */
  private normalizar(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const cuerpo = error.error as { error?: string } | string | null;
      const mensajeDelServidor =
        cuerpo && typeof cuerpo === 'object' && typeof cuerpo.error === 'string'
          ? cuerpo.error
          : null;

      // status 200 con cuerpo no-JSON = la URL apunta al frontend (SPA fallback).
      const devuelveHtml =
        error.status === 200 &&
        (typeof cuerpo === 'string' ? cuerpo.includes('<!doctype html') : cuerpo === null);

      let mensaje: string;
      if (devuelveHtml) {
        mensaje =
          `${this.apiUrl} devolvió HTML en lugar de JSON. ` +
          'La URL apunta al frontend, no al backend. Revisa apiUrl en src/environments/.';
      } else if (mensajeDelServidor) {
        mensaje = mensajeDelServidor;
      } else if (error.status === 0) {
        mensaje = `No se pudo conectar con la API en ${this.apiUrl}. ¿Está el backend arrancado?`;
      } else if (error.status === 405) {
        mensaje =
          `La API en ${this.apiUrl} respondió 405 (método no permitido). ` +
          'Revisa que la URL apunte al backend y no al frontend.';
      } else {
        mensaje = `Error ${error.status} al llamar a la API: ${error.message}`;
      }

      return throwError(() => new ApiError(mensaje, error.status, this.apiUrl));
    }

    const mensaje = error instanceof Error ? error.message : 'Error desconocido en la petición.';
    return throwError(() => new ApiError(mensaje, 0, this.apiUrl));
  }
}
