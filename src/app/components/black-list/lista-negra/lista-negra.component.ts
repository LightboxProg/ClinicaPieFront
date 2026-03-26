import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
@Component({
  selector: 'app-lista-negra',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-negra.component.html',
  styleUrls: ['./lista-negra.component.scss']
})
export class ListaNegraComponent {
  @Input() entrada: any;
  showDetails = false;

  constructor(private router: Router) {}

  verPerfil(idPaciente: string) {
    if (idPaciente) {
      this.router.navigate(['/perfil', 'paciente', idPaciente]);
    }
  }
  

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

formatearFecha(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'No proporcionada';

    // Usar fecha en formato ISO (YYYY-MM-DD) sin ajustar por zona horaria
    const [año, mes, dia] = fechaNacimiento.split('T')[0].split('-');

    if (!año || !mes || !dia) return 'No proporcionada';

    return `${mes.padStart(2, '0')}/${dia.padStart(2, '0')}/${año}`;
  }

}
