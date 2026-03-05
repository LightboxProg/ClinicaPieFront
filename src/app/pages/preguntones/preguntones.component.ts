import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { ListaPreguntonComponent } from 'src/app/components/preguntones/lista-pregunton/lista-pregunton.component';
import { FiltrosPreguntonComponent } from 'src/app/components/preguntones/filtros-pregunton/filtros-pregunton.component';

@Component({
  selector: 'app-preguntones',
  standalone: true,
  imports: [CommonModule, ListaPreguntonComponent, FiltrosPreguntonComponent],
  templateUrl: './preguntones.component.html',
  styleUrls: ['./preguntones.component.scss']
})
export class PreguntonesComponent {
  constructor(private loginService: LoginService, private router: Router) {
    if (!this.loginService.existeUsuario()) {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login']);
    }
  }
}

