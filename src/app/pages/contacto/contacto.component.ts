import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss']
})
export class ContactoComponent {
  formData = {
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  };
  
  mensajeExito: string = '';
  cargando: boolean = false;

  enviarMensaje(): void {
    if (!this.validarFormulario()) return;
    
    this.cargando = true;
    // Simular envío
    setTimeout(() => {
      this.mensajeExito = 'Mensaje enviado correctamente. Te contactaremos pronto.';
      this.formData = { nombre: '', email: '', telefono: '', asunto: '', mensaje: '' };
      this.cargando = false;
      setTimeout(() => this.mensajeExito = '', 5000);
    }, 1500);
  }

  validarFormulario(): boolean {
    if (!this.formData.nombre || !this.formData.email || !this.formData.telefono || !this.formData.mensaje) {
      alert('Por favor completa todos los campos requeridos.');
      return false;
    }
    return true;
  }
}
