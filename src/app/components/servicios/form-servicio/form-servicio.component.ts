import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-servicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-servicio.component.html',
  styleUrls: ['./form-servicio.component.scss']
})
export class FormServicioComponent implements OnInit {
  @Input() servicio: any = null;
  @Input() categorias: any[] = [];
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  nuevaFaq: { pregunta: string; respuesta: string } = { pregunta: '', respuesta: '' };
  formData: any = {};
  esEdicion: boolean = false;
  nuevoBeneficio: string = '';

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['servicio']) {
      this.inicializarFormulario();
    }
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
        categoria: this.servicio.categoria || '',
        descripcionCorta: this.servicio.descripcionCorta || '',
        beneficios: this.servicio.beneficios || [],
        activo: this.servicio.activo !== undefined ? this.servicio.activo : true,
        orden: this.servicio.orden || 0,
        faqs: this.servicio.faqs || []
      };
    } else {
      // Modo creación
      this.esEdicion = false;
      this.formData = {
        nombre: '',
        duracion: 45,
        costo: null,
        costoPaquete: null,
        tieneSesiones: false,
        sesiones: { numero: 1, descripcion: '' },
        categoria: '',
        descripcionCorta: '',
        beneficios: [],
        activo: true,
        orden: 0,
        faqs: []
      };
    }
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

    // Validaciones básicas
    if (!this.formData.nombre || this.formData.nombre.trim() === '') {
      console.error('El nombre es requerido');
      alert('El nombre es requerido');
      return;
    }

    if (!this.formData.duracion || this.formData.duracion <= 0) {
      console.error('La duración es requerida');
      alert('La duración es requerida y debe ser mayor a 0');
      return;
    }

    if (!this.formData.categoria) {
      console.error('La categoría es requerida');
      alert('Debes seleccionar una categoría');
      return;
    }

    // Convertir valores numéricos
    if (this.formData.costo === '') this.formData.costo = null;
    if (this.formData.costoPaquete === '') this.formData.costoPaquete = null;

    // Emitir los datos
    this.guardar.emit(this.formData);
  }

  cancelarForm(): void {
    this.cancelar.emit();
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  agregarFaq(): void {
    if (this.nuevaFaq.pregunta.trim() && this.nuevaFaq.respuesta.trim()) {
      if (!this.formData.faqs) {
        this.formData.faqs = [];
      }
      this.formData.faqs.push({
        pregunta: this.nuevaFaq.pregunta.trim(),
        respuesta: this.nuevaFaq.respuesta.trim(),
        orden: this.formData.faqs.length // opcional, puedes gestionar orden después
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