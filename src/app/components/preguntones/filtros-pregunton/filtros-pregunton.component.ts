import { Component, EventEmitter, OnInit, Output, ViewChild  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PacientesService } from 'src/app/services/pacientes.service';

@Component({
  selector: 'app-filtros-pregunton',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './filtros-pregunton.component.html',
  styleUrls: ['./filtros-pregunton.component.scss']
})
export class FiltrosPreguntonComponent implements OnInit {
  @Output() editarUsuarioEvent = new EventEmitter<any>();
  usuarios: Array<any> = [];
  filteredUsuarios: Array<any> = [];
  selectedUser: any = null;
  searchTerm: string = '';
  selectedRole: string = '';
  roles: string[] = ['Administrador', 'Doctor', 'Recepcionista']; // Adjusted based on screenshot 'Administrador'


  ngOnInit() {
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

  recargar() {
  }
}

