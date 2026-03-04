import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
// IMPORTANTE: Importar el formulario
import { FormularioSucursalesComponent } from '../formulario-sucursales/formulario-sucursales.component';

@Component({
  selector: 'app-cambio-sucursales',
  standalone: true,
  imports: [CommonModule, FormularioSucursalesComponent], // Agregarlo a imports
  templateUrl: './cambio-sucursales.component.html',
  styleUrls: ['./cambio-sucursales.component.scss']
})
export class CambioSucursalesComponent {
  
  // Recibe el ID desde la Lista
  @Input() sucursalId: string | null = null;
  
  // Eventos para comunicarse con la Lista
  @Output() cerrar = new EventEmitter<void>();
  @Output() recargar = new EventEmitter<void>();

  // Se ejecuta cuando el usuario da click en la X o fuera del modal
  cerrarModal() {
    this.cerrar.emit();
  }

  // Se ejecuta cuando el formulario termina (Output 'finalizar')
  onFinalizar(exito: boolean) {
    if (exito) {
      this.recargar.emit(); // Pedimos a la lista que actualice los datos
    }
    this.cerrarModal(); // Cerramos el modal
  }
}