import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ApiError, EstadoPago, Pago, PagosService } from '../../services/pagos';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.html',
  styleUrls: ['./pago.css'],
})
export class Pagos implements OnInit {
  private readonly pagoService = inject(PagosService);

  readonly pagos = signal<Pago[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);

  readonly totalPendiente = computed(() =>
    this.pagos()
      .filter((p) => p.estado === 'pendiente')
      .reduce((suma, p) => suma + Number(p.monto), 0)
  );

  nuevoPago = {
    nombre: '',
    descripcion: '',
    monto: 0,
    fecha: '',
    estado: 'pendiente' as EstadoPago,
  };

  ngOnInit(): void {
    this.cargarPagos();
  }

  cargarPagos(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.pagoService
      .getPagos()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (pagos) => this.pagos.set(pagos),
        error: (e: ApiError) => this.error.set(e.message),
      });
  }

  agregarPago(): void {
    if (this.guardando()) return;

    if (!this.nuevoPago.nombre.trim()) {
      this.error.set('El nombre del pago es obligatorio.');
      return;
    }
    if (!(this.nuevoPago.monto > 0)) {
      this.error.set('El monto debe ser mayor que 0.');
      return;
    }
    if (!this.nuevoPago.fecha) {
      this.error.set('La fecha es obligatoria.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);
    this.aviso.set(null);

    this.pagoService
      .addPago({ ...this.nuevoPago, nombre: this.nuevoPago.nombre.trim() })
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.aviso.set(`"${this.nuevoPago.nombre}" se guardó correctamente.`);
          this.nuevoPago = {
            nombre: '',
            descripcion: '',
            monto: 0,
            fecha: '',
            estado: 'pendiente',
          };
          this.cargarPagos();
        },
        error: (e: ApiError) => this.error.set(e.message),
      });
  }

  cambiarEstado(pago: Pago): void {
    this.error.set(null);
    this.pagoService.cambiarEstado(pago).subscribe({
      next: (actualizado) => {
        this.pagos.update((lista) =>
          lista.map((p) => (p.id === actualizado.id ? actualizado : p))
        );
      },
      error: (e: ApiError) => this.error.set(e.message),
    });
  }

  eliminarPago(id: number): void {
    this.error.set(null);
    this.pagoService.deletePago(id).subscribe({
      next: () => {
        this.pagos.update((lista) => lista.filter((p) => p.id !== id));
        this.aviso.set('Pago eliminado.');
      },
      error: (e: ApiError) => this.error.set(e.message),
    });
  }

  dismissError(): void {
    this.error.set(null);
  }

  trackById(_index: number, pago: Pago): number {
    return pago.id;
  }
}
