import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-categoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-categoria.component.html',
  styleUrls: ['./form-categoria.component.scss']
})
export class FormCategoriaComponent implements OnInit {
  @Input() categoria: any = null;
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  formData: any = {};
  esEdicion: boolean = false;

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoria']) {
      this.inicializarFormulario();
    }
  }

  inicializarFormulario(): void {
    if (this.categoria && this.categoria._id) {
      // Modo edición
      this.esEdicion = true;
      this.formData = {
        _id: this.categoria._id,
        nombre: this.categoria.nombre || '',
        descripcion: this.categoria.descripcion || '',
        orden: this.categoria.orden || 0,
        activa: this.categoria.activa !== undefined ? this.categoria.activa : true
      };
    } else {
      // Modo creación
      this.esEdicion = false;
      this.formData = {
        nombre: '',
        descripcion: '',
        orden: 0,
        activa: true
      };
    }
  }

  guardarForm(event?: Event): void {
    if (event) event.preventDefault();

    // Validaciones básicas
    if (!this.formData.nombre || this.formData.nombre.trim() === '') {
      console.error('El nombre es requerido');
      alert('El nombre es requerido');
      return;
    }

    // Emitir los datos
    this.guardar.emit(this.formData);
  }

  cancelarForm(): void {
    this.cancelar.emit();
  }
}