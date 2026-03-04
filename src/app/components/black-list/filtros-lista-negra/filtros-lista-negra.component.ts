import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ListaNegraService } from 'src/app/services/lista-negra.service';

@Component({
  selector: 'app-filtros-lista-negra',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './filtros-lista-negra.component.html',
  styleUrls: ['./filtros-lista-negra.component.scss']
})
export class FiltrosListaNegraComponent {
  filterForm: FormGroup;

  @Output() datosFiltrados = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private listaNegraService: ListaNegraService) {
    this.filterForm = this.fb.group({
      estado: [''],
      orden: [''],
      search: ['']
    });
  }

  aplicarFiltros() {
    const filtros = this.filterForm.value;

    let query = '';

    if (filtros.estado) query += `tipo=${filtros.estado}&`;
    if (filtros.orden) query += `orden=${filtros.orden}&`;
    if (filtros.search) query += `search=${filtros.search.trim()}&`;

    query = query.slice(0, -1); // quitar el último "&"

    this.listaNegraService.obtenerFiltrados(query).subscribe(
      (res: any) => {
        this.datosFiltrados.emit(res.data);
      },
      (error) => {
        console.error('Error al obtener datos filtrados:', error);
      }
    );
  }

}
