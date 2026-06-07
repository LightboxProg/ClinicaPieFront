import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SucursalesService } from 'src/app/services/sucursales.service';

@Component({
  selector: 'app-form-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-servicio.component.html',
  styleUrls: ['./form-servicio.component.scss']
})
export class FormServicioComponent implements OnInit {
  @Input() servicio: any = null;
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  nuevaFaq: { pregunta: string; respuesta: string } = { pregunta: '', respuesta: '' };
  formData: any = {};
  esEdicion: boolean = false;
  nuevoBeneficio: string = '';
  sucursalesDisponibles: any[] = [];

  constructor(private sucursalesService: SucursalesService) {}

  ngOnInit(): void {
    this.cargarSucursales();
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['servicio']) {
      this.inicializarFormulario();
    }
  }

  // Cargar lista de sucursales activas
  cargarSucursales(): void {
    this.sucursalesService.obtenerSucursales().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.sucursalesDisponibles = response.data.filter((s: any) => s.activo);
        }
      },
      error: (error: any) => {
        console.error('Error al cargar sucursales:', error);
      }
    });
  }

  inicializarFormulario(): void {
    if (this.servicio && this.servicio._id) {
      this.esEdicion = true;
      this.formData = {
        _id: this.servicio._id,
        nombre: this.servicio.nombre || '',
        duracion: this.servicio.duracion || 45,
        costo: this.servicio.costo !== undefined ? this.servicio.costo : null,
        costoPaquete: this.servicio.costoPaquete !== undefined ? this.servicio.costoPaquete : null,
        tieneSesiones: this.servicio.tieneSesiones || false,
        sesiones: this.servicio.sesiones || { numero: 1, descripcion: '' },
        descripcionCorta: this.servicio.descripcionCorta || '',
        beneficios: this.servicio.beneficios || [],
        activo: this.servicio.activo !== undefined ? this.servicio.activo : true,
        orden: this.servicio.orden || 0,
        faqs: this.servicio.faqs || [],
        preciosPorSucursal: (this.servicio.preciosPorSucursal || []).map((p: any) => ({
          sucursal: p.sucursal?._id || p.sucursal,
          costo: p.costo,
          costoPaquete: p.costoPaquete
        }))
      };
    } else {
      this.esEdicion = false;
      this.formData = {
        nombre: '',
        duracion: 45,
        costo: null,
        costoPaquete: null,
        tieneSesiones: false,
        sesiones: { numero: 1, descripcion: '' },
        descripcionCorta: '',
        beneficios: [],
        activo: true,
        orden: 0,
        faqs: [],
        preciosPorSucursal: []
      };
    }
  }

  // Agregar precio para una sucursal
  agregarPrecioSucursal(): void {
    if (!this.formData.preciosPorSucursal) {
      this.formData.preciosPorSucursal = [];
    }
    this.formData.preciosPorSucursal.push({
      sucursal: '',
      costo: null,
      costoPaquete: null
    });
  }

  // Eliminar un precio por sucursal
  eliminarPrecioSucursal(index: number): void {
    this.formData.preciosPorSucursal.splice(index, 1);
  }

  // Sucursales que aun no han sido asignadas
  getSucursalesDisponiblesParaFila(currentSucursalId: string): any[] {
    const usadas = this.formData.preciosPorSucursal
      .map((p: any) => p.sucursal)
      .filter((id: string) => id && id !== currentSucursalId);
    return this.sucursalesDisponibles.filter(s => !usadas.includes(s._id));
  }

  agregarBeneficio(): void {
    if (this.nuevoBeneficio && this.nuevoBeneficio.trim() !== '') {
      if (!this.formData.beneficios) {
        this.formData.beneficios = [];
      }
      this.formData.beneficios.push(this.nuevoBeneficio.trim());
      this.nuevoBeneficio = '';
    }
  }

  eliminarBeneficio(index: number): void {
    this.formData.beneficios.splice(index, 1);
  }

  guardarForm(event?: Event): void {
    if (event) event.preventDefault();

    if (!this.formData.nombre || this.formData.nombre.trim() === '') {
      alert('El nombre es requerido');
      return;
    }

    if (!this.formData.duracion || this.formData.duracion <= 0) {
      alert('La duracion es requerida y debe ser mayor a 0');
      return;
    }

    // Limpiar valores vacios
    if (this.formData.costo === '') this.formData.costo = null;
    if (this.formData.costoPaquete === '') this.formData.costoPaquete = null;

    // Limpiar precios por sucursal vacios
    this.formData.preciosPorSucursal = (this.formData.preciosPorSucursal || [])
      .filter((p: any) => p.sucursal && p.costo !== null && p.costo !== undefined);

    this.guardar.emit(this.formData);
  }

  cancelarForm(): void {
    this.cancelar.emit();
  }

  agregarFaq(): void {
    if (this.nuevaFaq.pregunta.trim() && this.nuevaFaq.respuesta.trim()) {
      if (!this.formData.faqs) {
        this.formData.faqs = [];
      }
      this.formData.faqs.push({
        pregunta: this.nuevaFaq.pregunta.trim(),
        respuesta: this.nuevaFaq.respuesta.trim(),
        orden: this.formData.faqs.length
      });
      this.nuevaFaq = { pregunta: '', respuesta: '' };
    } else {
      alert('Debes completar tanto la pregunta como la respuesta');
    }
  }

  eliminarFaq(index: number): void {
    this.formData.faqs.splice(index, 1);
  }
}