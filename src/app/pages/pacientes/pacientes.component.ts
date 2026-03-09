import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormComponent } from 'src/app/components/forms/form/form.component';
import { ListaPacientesComponent } from 'src/app/components/pacientes/lista-pacientes/lista-pacientes.component';
import { FiltrosPacientesComponent } from 'src/app/components/pacientes/filtros-pacientes/filtros-pacientes.component';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, ListaPacientesComponent, FiltrosPacientesComponent],
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
})

export class PacientesComponent {
  filtroTerm: string = '';

  constructor(private loginService: LoginService, private router: Router) {
    if (!this.loginService.existeUsuario()) {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  onFiltroChange(value: string) {
    this.filtroTerm = value;
  }
}
