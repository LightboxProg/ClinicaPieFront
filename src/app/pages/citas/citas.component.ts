import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendarCitaComponent } from 'src/app/components/agenda/agendar-cita/agendar-cita.component';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, AgendarCitaComponent],
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.scss']
})
export class CitasComponent {

  componenteActivo: 'calendario' | 'bloquear' | 'agendar' | null = null;

  showAgenda() {
    this.componenteActivo = 'calendario';
  }

  showBloqueos() {
    this.componenteActivo = 'bloquear';
  }

  showAgendar() {
    this.componenteActivo = 'agendar';
  }

}
