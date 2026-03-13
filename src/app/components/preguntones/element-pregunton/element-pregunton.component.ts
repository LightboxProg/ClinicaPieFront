import { Component, Input, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PacientesService } from 'src/app/services/pacientes.service';
import Swal from 'sweetalert2';
import { LoginService } from 'src/app/services/login.service';
import { ModalComponent } from '../../modal/modal.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ListaNegraPreguntonService } from 'src/app/services/lista-negra-pregunton.service';

@Component({
  selector: 'app-element-pregunton',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule],
  templateUrl: './element-pregunton.component.html',
  styleUrls: ['./element-pregunton.component.scss']
})
export class ElementPreguntonComponent implements OnInit, OnDestroy {
  @Input() pregunton: any;
  user: any;
  showListaNegraModal = false;
  razon = '';
  detalles = '';
  tipo = 'permanente';
  preguntonesEnListaNegra: any[] = [];
  private usuarioSubscription: Subscription = new Subscription();

  private limpiarFormulario(): void {
    this.razon = '';
    this.detalles = '';
    this.tipo = 'permanente';
  }

  constructor(
    private router: Router,
    private pacientesService: PacientesService,
    private listaNegraPreguntonesService: ListaNegraPreguntonService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.cargarPreguntonesListaNegra();
    this.cargarUsuario();
  }

  ngOnDestroy(): void {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  private cargarPreguntonesListaNegra(): void {
    this.pacientesService.obtenerPreguntonesEnListaNegra().subscribe({
      next: (pacientes) => {
        this.preguntonesEnListaNegra = pacientes;
      },
      error: (err) => {
        console.error('Error al obtener Leads en lista negra', err);
      }
    });
  }

  private cargarUsuario(): void {
    const usuarioData = this.loginService.obtenerUsuario();
    console.log('Usuario desde LoginService:', usuarioData);

    if (usuarioData && usuarioData.id) {
      this.user = usuarioData;
      console.log('Usuario cargado exitosamente:', this.user);
    } else {
      console.error('No se pudo cargar la información del usuario');
    }

    this.usuarioSubscription = this.loginService.usuario$.subscribe(usuario => {
      if (usuario && usuario.id) {
        this.user = usuario;
      }
    });
  }

  estaEnListaNegra(preguntonId: string): boolean {
    if (!this.preguntonesEnListaNegra || this.preguntonesEnListaNegra.length === 0) {
      return false;
    }
    return this.preguntonesEnListaNegra.some((pregunton) => pregunton._id === preguntonId);
  }

  abrirListaNegra(pregunton: any) {
    if (!this.user || !this.user.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error de sesión',
        text: 'No se pudo identificar su usuario. Por favor, inicie sesión nuevamente.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.pregunton = pregunton;
    this.showListaNegraModal = true;
    this.limpiarFormulario();
  }

  onCloseListaNegraModal() {
    this.showListaNegraModal = false;
    this.limpiarFormulario();
  }

  formatearFecha(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'No proporcionada';
    const [año, mes, dia] = fechaNacimiento.split('T')[0].split('-');
    if (!año || !mes || !dia) return 'No proporcionada';
    return `${mes.padStart(2, '0')}/${dia.padStart(2, '0')}/${año}`;
  }

  agregarListaNegra() {
    if (!this.razon || !this.tipo) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, llena los campos obligatorios: Razón y Tipo.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    if (!this.user) {
      Swal.fire({
        icon: 'error',
        title: 'Error de usuario',
        text: 'No se encontró información del usuario. Por favor, recargue la página.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const usuarioId = this.user.id;
    if (!usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Error de identificación',
        text: 'No se pudo identificar su usuario. Por favor, inicie sesión nuevamente.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const datos = {
      preguntonId: this.pregunton._id, 
      razon: this.razon,
      detalles: this.detalles,
      tipo: this.tipo,
      evidencia: [],
      agregadoPor: usuarioId
    };

    console.log('Enviando a lista negra:', datos);

    this.listaNegraPreguntonesService.agregarPregunton(datos).subscribe({
      next: (res) => {
        console.log('Pregunton agregado a lista negra:', res);
        this.showListaNegraModal = false;
        this.cargarPreguntonesListaNegra();
        Swal.fire({
          icon: 'success',
          title: 'Leads agregado a lista negra',
          text: 'El lead ha sido agregado correctamente.',
          confirmButtonText: 'Aceptar'
        });
      },
      error: (err) => {
        console.error('Error completo al agregar a lista negra:', err);
        let mensajeError = 'Ocurrió un problema al intentar agregar al lead.';
        if (err.status === 400) {
          if (err.error && err.error.error === 'El leads ya está en la lista negra') {
            mensajeError = 'Este leads ya está en la lista negra.';
          } else if (err.error && err.error.error === 'ID del usuario que agrega es requerido') {
            mensajeError = 'Error de autenticación. Por favor, inicie sesión nuevamente.';
          } else {
            mensajeError = err.error?.error || 'Datos inválidos. Verifique la información.';
          }
        }
        Swal.fire({
          icon: 'error',
          title: 'Error al agregar lead',
          text: mensajeError,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

}