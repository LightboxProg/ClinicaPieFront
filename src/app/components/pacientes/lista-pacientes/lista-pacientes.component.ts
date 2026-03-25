import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ElementPacienteComponent } from '../element-paciente/element-paciente.component';
import { FormComponent } from '../../forms/form/form.component';
import { SwalService } from 'src/app/services/swal.service';
import { PacientesService } from 'src/app/services/pacientes.service';

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ElementPacienteComponent],
  templateUrl: './lista-pacientes.component.html',
  styleUrls: ['./lista-pacientes.component.scss']
})
export class ListaPacientesComponent {
  pacientes: any[] = [];
  pacientesFiltrados: any[] = [];
  @Input() filters = { searchTerm: '', genero: '', finado: null as boolean | null };

  constructor(private router: Router, private swalService: SwalService, private pacienteService: PacientesService) { }

  ngOnInit() {
    this.pacienteService.paciente$.subscribe((pacientes: any[]) => {
      this.pacientes = pacientes;
      this.aplicarFiltros();
    });
    this.pacienteService.obtenerPacientes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filters']) {
      this.aplicarFiltros();
    }
  }

  aplicarFiltros() {
    if (!this.pacientes.length) {
      this.pacientesFiltrados = [];
      return;
    }

    // DEBUG: log the first patient's gender and finado to verify data structure
    if (this.pacientes.length > 0) {
      console.log('Primer paciente:', this.pacientes[0]);
      console.log('Filtros aplicados:', this.filters);
    }

    this.pacientesFiltrados = this.pacientes.filter(paciente => {
      // Búsqueda por nombre o teléfono
      let matchesSearch = true;
      if (this.filters.searchTerm) {
        const term = this.filters.searchTerm.toLowerCase().trim();
        const nombreCompleto = `${paciente.nombre} ${paciente.apeP} ${paciente.apeM}`.toLowerCase();
        const telefono = (paciente.telefonoWhatsapp || '').toString();
        const numero = (paciente.numeroTelefono || '').toString();
        matchesSearch = nombreCompleto.includes(term) || telefono.includes(term) || numero.includes(term);
      }

      // Filtro por género (case‑insensitive)
      let matchesGenero = true;
      if (this.filters.genero) {
        const generoPaciente = paciente.genero ? paciente.genero.toLowerCase().trim() : '';
        const generoFiltro = this.filters.genero.toLowerCase().trim();
        matchesGenero = generoPaciente === generoFiltro;
        if (!matchesGenero) {
          console.log(`Género no coincide: ${generoPaciente} vs ${generoFiltro}`);
        }
      }

      // Filtro por estado (finado)
      let matchesFinado = true;
      if (this.filters.finado !== null) {
        // Ensure paciente.finado is treated as boolean (convert if string)
        const isFinado = paciente.finado === true || paciente.finado === 'true';
        matchesFinado = isFinado === this.filters.finado;
        if (!matchesFinado) {
          console.log(`Finado no coincide: ${isFinado} vs ${this.filters.finado}`);
        }
      }

      return matchesSearch && matchesGenero && matchesFinado;
    });

    console.log(`Resultados filtrados: ${this.pacientesFiltrados.length} de ${this.pacientes.length}`);
  }
}