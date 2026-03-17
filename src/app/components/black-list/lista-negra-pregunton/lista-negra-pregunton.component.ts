import { Component, EventEmitter, Input ,OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaNegraPreguntonService } from 'src/app/services/lista-negra-pregunton.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
  @Output() eliminado = new EventEmitter<string>();

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

  eliminarDeListaNegra(): void {
      if (!this.entrada || !this.entrada.pregunton._id) return;
  
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará al paciente de la lista negra',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.listaNegraPreguntonService.removerPreguntonYActualizar(this.entrada.pregunton._id).subscribe({
            next: () => {
              Swal.fire('¡Eliminado!', 'El paciente ha sido eliminado de la lista negra.', 'success');
              this.entrada.pregunton.enListaNegra = false;
              this.eliminado.emit();
            },
            error: (err) => {
              console.error('Error al eliminar de lista negra:', err);
              Swal.fire('Error', 'No se pudo eliminar al paciente de la lista negra.', 'error');
            }
          });
        }
      });
    }



}
