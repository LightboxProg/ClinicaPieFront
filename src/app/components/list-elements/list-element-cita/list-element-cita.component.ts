import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListElementPhotoComponent } from '../list-element-photo/list-element-photo.component';
import { SemaforoComponent } from '../../mensajes/semaforo/semaforo.component';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-element-cita',
  standalone: true,
  imports: [CommonModule,ListElementPhotoComponent, SemaforoComponent],
  templateUrl: './list-element-cita.component.html',
  styleUrls: ['./list-element-cita.component.scss']
})
export class ListElementCitaComponent {
  @Input() cita: any; // Recibe la cita como input

   constructor(private loginService: LoginService, private router: Router) {
        if (!this.loginService.existeUsuario()) {
          // Si no está autenticado, redirigir al login
          this.router.navigate(['/login']);
        }
      }

}
