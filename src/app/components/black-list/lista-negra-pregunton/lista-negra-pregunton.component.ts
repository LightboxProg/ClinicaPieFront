import { Component, Input ,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaNegraPreguntonService } from 'src/app/services/lista-negra-pregunton.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-negra-pregunton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-negra-pregunton.component.html',
  styleUrls: ['./lista-negra-pregunton.component.scss']
})
export class ListaNegraPreguntonComponent implements OnInit {
  preguntonesListaNegra: any[] = [];
  @Input()entrada: any;
  pregunton: any;
  showDetails = false; 

  constructor(
      private router: Router,
      private listaNegraPreguntonService: ListaNegraPreguntonService) {}

  ngOnInit(): void {
    console.log('Datos recibidos en entrada:', this.entrada);
    this.listaNegraPreguntonService.obtenerListaNegraPreguntones().subscribe({
      next: (res) => {
        this.preguntonesListaNegra = res.data || res;
      },
      error: (err) => {
        console.error('Error al obtener la lista negra:', err);
      }
    });
  }

  formatearFecha(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'No proporcionada';

    // Usar fecha en formato ISO (YYYY-MM-DD) sin ajustar por zona horaria
    const [año, mes, dia] = fechaNacimiento.split('T')[0].split('-');

    if (!año || !mes || !dia) return 'No proporcionada';

    return `${mes.padStart(2, '0')}/${dia.padStart(2, '0')}/${año}`;
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }



}
