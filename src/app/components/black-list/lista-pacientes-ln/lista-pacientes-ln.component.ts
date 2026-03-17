import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaNegraComponent } from '../lista-negra/lista-negra.component';
import { ListaNegraService } from 'src/app/services/lista-negra.service';
import { ListaNegraPreguntonService } from 'src/app/services/lista-negra-pregunton.service';
import { ListaNegraPreguntonComponent } from '../lista-negra-pregunton/lista-negra-pregunton.component';

@Component({
  selector: 'app-lista-pacientes-ln',
  standalone: true,
  imports: [CommonModule, ListaNegraComponent, ListaNegraPreguntonComponent],
  templateUrl: './lista-pacientes-ln.component.html',
  styleUrls: ['./lista-pacientes-ln.component.scss']
})
export class ListaPacientesLnComponent implements OnInit {
  @Input() entrada: any;
  pacientesListaNegra: any[] = [];
  preguntonesListaNegra: any[] = [];
  tipoSeleccionado: string = 'pacientes';

  constructor(private listaNegraService: ListaNegraService, private listaNegraPreguntonService: ListaNegraPreguntonService) {}

  ngOnInit(): void {
    this.cargarPacientes();
    this.cargarPreguntones();
  }

  cargarPacientes() {
    this.listaNegraService.getPacientesListaNegra().subscribe({
      next: (res) => {
        console.log('Pacientes en lista negra:', res);
        this.pacientesListaNegra = res.data; // Ajusta según la estructura de tu respuesta
      },
      error: (err) => console.error('Error al cargar pacientes:', err)
    });
    console.log('Pacientes en lista negra después de cargar:', this.pacientesListaNegra);
  }

  cargarPreguntones() {
    this.listaNegraPreguntonService.obtenerListaNegraPreguntones().subscribe({
      next: (res) => {
        this.preguntonesListaNegra = res.data || res; // Ajusta según la estructura
      },
      error: (err) => console.error('Error al cargar preguntones:', err)
    });
    console.log('Preguntones en lista negra después de cargar:', this.preguntonesListaNegra);
  }

  seleccionarTipo(tipo: string) {
    this.tipoSeleccionado = tipo;
  }

  recargarPreguntones(): void {
    this.cargarPreguntones(); // Llama al método que ya tienes
  }

}
