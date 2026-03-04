import { Component, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { PacientesService } from 'src/app/services/pacientes.service';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-filtros-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './filtros-pacientes.component.html',
  styleUrls: ['./filtros-pacientes.component.scss']
})
export class FiltrosPacientesComponent implements OnInit {
  filterForm!: FormGroup;
  @Output() pacientesFiltrados = new EventEmitter<any[]>();

  constructor(
    private fb: FormBuilder,
    private pacientesService: PacientesService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.filterForm = this.fb.group({
      search: ['']
    });
  }

  obtenerFiltrosPacientes(): void {
    const telefono = this.filterForm.get('search')?.value;

    if (telefono && telefono.trim() !== '') {
      this.pacientesService.buscarPorTelefono(telefono).subscribe({
        next: (response) => {
          console.log('Respuesta del backend:', response); // Agrega esto para confirmar
          const pacientesArray = Array.isArray(response)
            ? response
            : response.pacientes || [response]; // Asegura que sea array
          this.pacientesService.actualizarLista(pacientesArray);
        },
        error: (error) => {
          console.error('Error al buscar pacientes:', error);
          this.pacientesService.actualizarLista([]);
        }
      })
    } else {
      this.pacientesService.obtenerPacientes(); // Ya actualiza la lista en el servicio
    }
  }

}
