import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// URL del backend desplegado en Vercel
const API_URL = 'https://gestor-deudas-xi.vercel.app/api/pagos';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  private api = API_URL;

  constructor(private http: HttpClient) {}

  getPagos() {
    return this.http.get<any[]>(this.api);
  }

  addPago(pago: any) {
    return this.http.post(this.api, pago);
  }

  deletePago(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  updatePago(id: number, estado: string) {
    return this.http.put(`${this.api}/${id}`, { estado });
  }
}
export{};