import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { LoginService } from 'src/app/services/login.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-list-element',
  standalone: true,
  imports: [CommonModule, UserModalComponent, FormsModule],
  templateUrl: './user-list-element.component.html',
  styleUrls: ['./user-list-element.component.scss']
})
export class UserListElementComponent implements OnInit {
  @Output() editarUsuarioEvent = new EventEmitter<any>();
  usuarios: Array<any> = [];
  filteredUsuarios: Array<any> = [];
  selectedUser: any = null;
  searchTerm: string = '';
  selectedRole: string = '';
  roles: string[] = ['Administrador', 'Doctor', 'Recepcionista']; // Adjusted based on screenshot 'Administrador'

  @ViewChild(UserModalComponent) userModal!: UserModalComponent;

  constructor(private userService: UserService, private loginService: LoginService) { }

  ngOnInit() {
    this.cargarusuarios();
  }

  cargarusuarios() {
    this.userService.obtenerUsuarios().subscribe(
      (data) => {
        this.usuarios = data;
        this.filterUsers();
      },
      (error) => {
        console.error('Error al cargar usuarios', error);
      }
    );
  }

  filterUsers() {
    this.filteredUsuarios = this.usuarios.filter(user => {
      const searchLower = this.searchTerm.toLowerCase();
      // Combine name parts for search if needed, or just search individual fields
      const fullName = `${user.nombre || ''} ${user.apeP || ''} ${user.apeM || ''}`.toLowerCase();

      const matchesSearch = (
        (user.usuario && user.usuario.toLowerCase().includes(searchLower)) ||
        (fullName.includes(searchLower)) ||
        (user.telefono && user.telefono.toString().includes(this.searchTerm))
      );

      // Note: 'tipo' seems to be the field name in HTML based on {{usuario.tipo}}
      const matchesRole = this.selectedRole ? user.tipo === this.selectedRole : true;

      return matchesSearch && matchesRole;
    });
  }

  onSearchChange() {
    this.filterUsers();
  }

  onRoleChange() {
    this.filterUsers();
  }


  eliminarUsuario(usuario: any) {
    Swal.fire({
      title: `Eliminar a ${usuario.nombre}`,
      input: 'password',
      inputLabel: 'Por favor, ingresa tu contraseña para confirmar',
      inputPlaceholder: 'Contraseña',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      preConfirm: (password) => {
        if (!password) {
          Swal.showValidationMessage('Debes ingresar tu contraseña');
          return false;
        }

        const usuarioAutenticado = JSON.parse(localStorage.getItem('usuarioAutenticado') || '{}');

        return this.userService.eliminarUsuarioConPassword(usuarioAutenticado, password, usuario._id).toPromise()
          .then(() => {
            this.usuarios = this.usuarios.filter(u => u._id !== usuario._id);
            this.filterUsers(); // Re-filter after deletion
            Swal.fire('Eliminado', `Usuario ${usuario.nombre} eliminado correctamente.`, 'success');
          })
          .catch((error) => {
            Swal.showValidationMessage(error.error?.message || 'Error al eliminar el usuario');
          });
      }
    });
  }

  verDetalles(usuario: any) {
    this.selectedUser = usuario;
    this.userModal.showModal = true;
  }

  editarUsuario(usuario: any) {
    this.selectedUser = usuario;
    this.userModal.showModal = true;
    // Esperar a que el modal se renderice (usar setTimeout o ChangeDetectorRef)
    setTimeout(() => {
      if (this.userModal) {
        this.userModal.activarEdicion();
      }
    });
  }

  recargar() {
    this.cargarusuarios();
  }
}
