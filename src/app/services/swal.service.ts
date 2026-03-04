import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SwalService {
  constructor() {}

  // Alerta de éxito
  success(message: string, title: string = '¡Éxito!'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'success',
      confirmButtonText: 'Aceptar',
    });
  }

  // Alerta de error
  error(message: string, title: string = '¡Error!'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonText: 'Aceptar',
    });
  }
  // Alerta de error
  errorCampos(message: string, title: string = '¡Error!'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      confirmButtonText: 'Aceptar',
    });
  }

  // Alerta de advertencia
  warning(message: string, title: string = 'Advertencia'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
  }

  // Alerta de información
  info(message: string, title: string = 'Información'): void {
    Swal.fire({
      title: title,
      text: message,
      icon: 'info',
      confirmButtonText: 'Aceptar',
    });
  }

  // Alerta de confirmación (Aceptar o Cancelar)
  confirm(
    message: string,
    title: string = '¿Estás seguro?',
    confirmButtonText: string = 'Aceptar',
    cancelButtonText: string = 'Cancelar'
  ): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
    }).then((result) => result.isConfirmed);
  }

  
}

