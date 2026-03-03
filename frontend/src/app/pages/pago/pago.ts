import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagosService } from '../../services/pagos';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.html',
  styleUrls: ['./pago.css']

})
export class Pagos implements OnInit {

  pagos: any[] = [];

  nuevoPago = {
    nombre: '',
    descripcion: '',
    monto: 0,
    fecha: '',
    estado: 'pendiente'
  };

  constructor(private pagoService: PagosService) {}

  ngOnInit() {
    this.cargarPagos();
  }

  cargarPagos() {
    this.pagoService.getPagos().subscribe(data => {
      this.pagos = data;
    });
  }

  agregarPago() {
    this.pagoService.addPago(this.nuevoPago).subscribe(() => {
      this.cargarPagos();
      this.nuevoPago = {
        nombre: '',
        descripcion: '',
        monto: 0,
        fecha: '',
        estado: 'pendiente'
      };
    });
  }

  eliminarPago(id: number) {
    this.pagoService.deletePago(id).subscribe(() => {
      this.cargarPagos();
    });
  }

  cambiarEstado(pago: any) {
    const nuevoEstado = pago.estado === 'pendiente' ? 'pagado' : 'pendiente';
    this.pagoService.updatePago(pago.id, nuevoEstado).subscribe(() => {
      this.cargarPagos();
    });
  }
}