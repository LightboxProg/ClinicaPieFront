import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importa el Router
import { LoginService } from 'src/app/services/login.service';
import { SwalService } from 'src/app/services/swal.service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
})
export class UserLoginComponent {
  usuario: string = '';
  password: string = '';

  constructor(
    private loginService: LoginService,
    private swalService: SwalService,
    private router: Router 
  ) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.usuario || !this.password) {
      this.swalService.errorCampos('Por favor, complete todos los campos');
      return;
    }
    this.autenticar();
  }

  private autenticar(): void {
    const loginData = { usuario: this.usuario, password: this.password };
  
    this.loginService.autenticarUsuario(loginData).subscribe({
      next: (response) => {
        this.loginService.guardarUsuario(response.usuario);
        // Redirigir al usuario
        this.router.navigate(['/lista-pacientes']);
      },
      error: (error) => {
        console.error('Error en la autenticación', error);
        this.swalService.error(
          error.error.message || 'Error al autenticar', 
          'Autenticación Fallida'
        );
      },
    });
  }
  
}
