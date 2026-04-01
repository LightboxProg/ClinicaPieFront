import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PacientesService } from 'src/app/services/pacientes.service';
import Swal from 'sweetalert2';
import { LoginService } from 'src/app/services/login.service';
import { ModalComponent } from '../../modal/modal.component';
import { FormsModule } from '@angular/forms';
import { ListaNegraService } from 'src/app/services/lista-negra.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-element-paciente',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule],
  templateUrl: './element-paciente.component.html',
  styleUrls: ['./element-paciente.component.scss'],
})
export class ElementPacienteComponent implements OnInit, OnDestroy {
  @Input() paciente: any;
  user: any;
  esAdmin: boolean = false;
  esRecepcionista: boolean = false;
  showListaNegraModal = false;
  razon = '';
  detalles = '';
  tipo = 'permanente';
  pacientesEnListaNegra: any[] = [];
  private usuarioSubscription: Subscription = new Subscription();

  private limpiarFormulario(): void {
    this.razon = '';
    this.detalles = '';
    this.tipo = 'permanente';
  }

  constructor(
    private router: Router,
    private pacientesService: PacientesService,
    private listaNegraService: ListaNegraService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.cargarPacientesListaNegra();
    this.cargarUsuario();
    const usuario = JSON.parse(localStorage.getItem('usuarioAutenticado') || '{}');
    this.esAdmin = usuario?.tipo === 'Administrador';
    this.esRecepcionista = usuario?.tipo === 'Recepcionista';
  }

  ngOnDestroy(): void {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  private cargarPacientesListaNegra(): void {
    this.pacientesService.obtenerPacientesEnListaNegra().subscribe({
      next: (pacientes) => {
        this.pacientesEnListaNegra = pacientes;
      },
      error: (err) => {
        console.error('Error al obtener pacientes en lista negra', err);
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

  estaEnListaNegra(pacienteId: string): boolean {
    if (!this.pacientesEnListaNegra || this.pacientesEnListaNegra.length === 0) {
      return false;
    }
    return this.pacientesEnListaNegra.some((paciente) => paciente._id === pacienteId);
  }

  abrirListaNegra(paciente: any) {
    if (!this.user || !this.user.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error de sesión',
        text: 'No se pudo identificar su usuario. Por favor, inicie sesión nuevamente.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.paciente = paciente;
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

  verPerfil(idPaciente: string) {
    this.router.navigate(['/perfil', 'paciente', idPaciente]);
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
      pacienteId: this.paciente._id,
      razon: this.razon,
      detalles: this.detalles,
      tipo: this.tipo,
      evidencia: [],
      agregadoPor: usuarioId
    };

    console.log('Enviando a lista negra:', datos);

    this.listaNegraService.agregarPaciente(datos).subscribe({
      next: (res) => {
        console.log('Paciente agregado a lista negra:', res);
        this.showListaNegraModal = false;
        this.cargarPacientesListaNegra();
        Swal.fire({
          icon: 'success',
          title: 'Paciente agregado a lista negra',
          text: 'El paciente ha sido agregado correctamente.',
          confirmButtonText: 'Aceptar'
        });
      },
      error: (err) => {
        console.error('Error completo al agregar a lista negra:', err);
        let mensajeError = 'Ocurrió un problema al intentar agregar al paciente.';
        if (err.status === 400) {
          if (err.error && err.error.error === 'El paciente ya está en la lista negra') {
            mensajeError = 'Este paciente ya está en la lista negra.';
          } else if (err.error && err.error.error === 'ID del usuario que agrega es requerido') {
            mensajeError = 'Error de autenticación. Por favor, inicie sesión nuevamente.';
          } else {
            mensajeError = err.error?.error || 'Datos inválidos. Verifique la información.';
          }
        }
        Swal.fire({
          icon: 'error',
          title: 'Error al agregar paciente',
          text: mensajeError,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  debugUsuario(): void {
    const usuarioData = this.loginService.obtenerUsuario();
    console.log('=== DEBUG USUARIO ===');
    console.log('Datos completos:', usuarioData);
    console.log('Tipo:', typeof usuarioData);
    console.log('Tiene propiedad id?:', usuarioData?.id ? 'SÍ' : 'NO');
    console.log('Valor de id:', usuarioData?.id);
    console.log('Usuario actual en componente:', this.user);
    console.log('=== FIN DEBUG ===');
  }
}