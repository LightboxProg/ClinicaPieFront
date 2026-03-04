import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacientesService } from 'src/app/services/pacientes.service';
import { UserService } from 'src/app/services/user.service';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { LoginService } from 'src/app/services/login.service';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.scss']
})
export class UserModalComponent implements OnInit {
  @Input() usuario: any;
  @Output() editarUsuario = new EventEmitter<any>();
  @Output() usuarioActualizado = new EventEmitter<void>();

  showModal: boolean = false;
  editMode: boolean = false;
  usuarioEdit: any = {};

  pacientes: any[] = [];
  sucursales: any[] = [];
  currentUser: any;

  constructor(
    private pacientesService: PacientesService,
    private userService: UserService,
    private loginService: LoginService,
    private sucursalesService: SucursalesService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.loginService.obtenerUsuario();
    this.cargarPacientes();
    this.cargarSucursales();
  }

  cargarPacientes() {
    this.pacientesService.paciente$.subscribe((pacientes) => {
      this.pacientes = pacientes;
    });
    this.pacientesService.obtenerPacientes();
  }

  cargarSucursales() {
    this.sucursalesService.obtenerSucursales().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.sucursales = res.data;
        }
      },
      error: (err) => console.error('Error cargando sucursales', err)
    });
  }

  closeModal() {
    this.showModal = false;
    this.editMode = false;
  }

  activarEdicion() {
    // Asegurar que idPacientes sea un array
    this.usuarioEdit = {
      ...this.usuario,
      idPacientes: this.usuario.idPacientes ? [...this.usuario.idPacientes] : []
    };
    this.editMode = true;
  }

  cancelarEdicion() {
    this.editMode = false;
  }

  getSucursalName(sucursalId: string): string {
    if (!sucursalId || !this.sucursales.length) return '';
    const suc = this.sucursales.find(s => s._id === sucursalId);
    return suc ? suc.nombre : sucursalId;
  }

  getPacienteName(pacienteId: string): string {
    const pac = this.pacientes.find(p => p._id === pacienteId);
    return pac ? `${pac.nombre} ${pac.apeP} ${pac.apeM}` : pacienteId;
  }

  /** Devuelve la lista de pacientes NO asignados actualmente al doctor (para el selector) */
  getAvailablePatients(): any[] {
    if (!this.usuarioEdit || !this.usuarioEdit.idPacientes) return this.pacientes;
    return this.pacientes.filter(p => !this.usuarioEdit.idPacientes.includes(p._id));
  }

  /** Asignar paciente (usado en modo edición) */
  asignarPacienteEdit(pacienteId: string) {
    if (!pacienteId) {
      Swal.fire({ icon: 'warning', title: 'Advertencia', text: 'Selecciona un paciente' });
      return;
    }

    if (this.usuarioEdit.idPacientes.includes(pacienteId)) {
      Swal.fire('Paciente ya asignado', '', 'warning');
      return;
    }

    this.userService.asignarPacientes(this.usuario._id, [pacienteId]).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Paciente asignado exitosamente', 'success');
        // Actualizar ambos objetos para mantener sincronía
        this.usuario.idPacientes.push(pacienteId);
        this.usuarioEdit.idPacientes.push(pacienteId);
      },
      error: (error) => {
        console.error('Error al asignar paciente:', error);
        Swal.fire('Error', 'No se pudo asignar el paciente', 'error');
      }
    });
  }

  /** Remover paciente (usado en modo edición) */
  removerPacienteEdit(pacienteId: string) {
    Swal.fire({
      title: '¿Eliminar asignación?',
      text: 'Este paciente ya no estará vinculado al doctor',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        this.userService.removerPaciente(this.usuario._id, pacienteId).subscribe({
          next: () => {
            // Eliminar de ambos objetos
            this.usuario.idPacientes = this.usuario.idPacientes.filter((id: string) => id !== pacienteId);
            this.usuarioEdit.idPacientes = this.usuarioEdit.idPacientes.filter((id: string) => id !== pacienteId);
            Swal.fire('Eliminado', 'Paciente removido correctamente', 'success');
          },
          error: (error) => {
            console.error('Error al remover paciente:', error);
            Swal.fire('Error', 'No se pudo remover el paciente', 'error');
          }
        });
      }
    });
  }

  /** Cambiar contraseña (ya existente, se mantiene igual) */
  async cambiarPassword() {
    if (!this.currentUser || this.currentUser.tipo !== 'Administrador') {
      Swal.fire('Acceso denegado', 'Solo administradores pueden cambiar contraseñas', 'error');
      return;
    }
    if (this.currentUser.id === this.usuario._id) {
      Swal.fire('Operación no permitida', 'No puedes cambiar tu propia contraseña aquí', 'info');
      return;
    }

    const { value: adminPassword, isConfirmed: step1Confirmed } = await Swal.fire<string>({
      title: 'Verificar administrador',
      text: 'Ingresa tu contraseña de administrador',
      input: 'password',
      inputPlaceholder: 'Contraseña actual',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar'
    });

    if (!step1Confirmed || !adminPassword) return;

    const { value: newPassword, isConfirmed: step2Confirmed } = await Swal.fire<string>({
      title: 'Nueva contraseña',
      text: `Ingresa la nueva contraseña para ${this.usuario.usuario}`,
      input: 'password',
      inputPlaceholder: 'Nueva contraseña',
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || value.length < 6) {
          return 'La contraseña debe tener al menos 6 caracteres';
        }
        return null;
      }
    });

    if (!step2Confirmed || !newPassword) return;

    this.userService.cambiarPassword(
      this.currentUser.id,
      adminPassword,
      this.usuario._id,
      newPassword
    ).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Contraseña actualizada correctamente', 'success');
      },
      error: (error) => {
        Swal.fire('Error', error.error?.message || 'No se pudo cambiar la contraseña', 'error');
      }
    });
  }

  guardarCambios() {
    const datos = { ...this.usuarioEdit };
    delete datos._id;
    delete datos.password;
    delete datos.servicios;
    delete datos.idPacientes; // La asignación de pacientes se maneja aparte

    this.userService.actualizarUsuario(this.usuario._id, datos).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Usuario actualizado correctamente', 'success');
        Object.assign(this.usuario, this.usuarioEdit);
        this.usuarioActualizado.emit();
        this.editMode = false;
      },
      error: (error) => {
        Swal.fire('Error', error.error?.message || 'No se pudo actualizar', 'error');
      }
    });
  }
}