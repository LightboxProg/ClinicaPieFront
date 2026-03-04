import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from 'src/app/components/forms/form/form.component';
import {FiltrosListaNegraComponent} from 'src/app/components/black-list/filtros-lista-negra/filtros-lista-negra.component'
import {ListaPacientesLnComponent} from 'src/app/components/black-list/lista-pacientes-ln/lista-pacientes-ln.component'
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-pacientes-listados',
  standalone: true,
  imports: [CommonModule,FormComponent,FiltrosListaNegraComponent, ListaPacientesLnComponent],
  templateUrl: './pacientes-listados.component.html',
  styleUrls: ['./pacientes-listados.component.scss']
})
export class PacientesListadosComponent {
  constructor(private loginService: LoginService, private router: Router) {
      if (!this.loginService.existeUsuario()) {
        // Si no está autenticado, redirigir al login
        this.router.navigate(['/login']);
      }
    }

}
