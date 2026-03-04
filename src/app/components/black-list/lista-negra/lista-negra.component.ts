import { Component, Input, Output, EventEmitter,OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PacientesService } from 'src/app/services/pacientes.service';
import Swal from 'sweetalert2';
import { LoginService } from 'src/app/services/login.service';
import { ModalComponent } from '../../modal/modal.component';
import { FormsModule } from '@angular/forms';
import { ListaNegraService } from 'src/app/services/lista-negra.service';
@Component({
  selector: 'app-lista-negra',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-negra.component.html',
  styleUrls: ['./lista-negra.component.scss']
})
export class ListaNegraComponent implements OnInit {
  pacientesListaNegra: any[] = [];
  @Input()entrada: any;
  paciente: any;
  showDetails = false;


  constructor(
    private router: Router,
    private pacientesService: PacientesService,
    private listaNegraService: ListaNegraService) {}

  ngOnInit(): void {
    console.log('Datos recibidos en entrada:', this.entrada);
    this.listaNegraService.getPacientesListaNegra().subscribe({
      next: (res) => {
        this.pacientesListaNegra = res.data;
      },
      error: (err) => {
        console.error('Error al obtener la lista negra:', err);
      }
    });
  }
  verPerfil(idPaciente: string) {
    this.router.navigate(['/perfil', 'paciente', idPaciente]);
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
