// semaforo.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-semaforo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './semaforo.component.html',
  styleUrls: ['./semaforo.component.scss']
})
export class SemaforoComponent {
  @Input() estado:string="";
  @Input() fecha: string = '';

     constructor(private loginService: LoginService, private router: Router) {
        if (!this.loginService.existeUsuario()) {
          // Si no está autenticado, redirigir al login
          this.router.navigate(['/login']);
        }
      }

  status = 0;
  // Mapea cada estado al color correspondiente
  colors: { [key: number]: string } = {
    0: 'gray',
    1: 'green',
    2: 'yellow',
    3: 'red'
  };

  estadoMapping: { [key: string]: number } = {
    'noleido': 0,
    'atendido': 1,
    'urgente': 3
  };


  ngOnInit() {
    if (this.estado === 'noleido' && this.fecha) {
      const ahora = new Date();
      const fechaMensaje = new Date(this.fecha);
      const diferenciaMs = ahora.getTime() - fechaMensaje.getTime();
      const unaHoraMs = 60 * 60 * 1000;

      // Si pasó más de una hora sin ser atendido, mostrar amarillo
      if (diferenciaMs >= unaHoraMs) {
        this.status = 2; // amarillo
        return;
      }
    }
    // Si no es noLeido o no pasó una hora, usar el estado normal
    this.status = this.estadoMapping[this.estado] || 0;
  }


  // Obtiene el color activo basado en el estado
  get activeColor(): string {
    return this.colors[this.status] || 'gray';
  }


}
