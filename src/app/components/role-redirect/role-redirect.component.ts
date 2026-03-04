import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-role-redirect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-redirect.component.html',
  styleUrls: ['./role-redirect.component.scss']
})
export class RoleRedirectComponent implements OnInit {
  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const usuario = this.loginService.obtenerUsuario();
    
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Pequeño delay para que se vea la animación
    setTimeout(() => {
      switch(usuario.tipo) {
        case 'Administrador':
          this.router.navigate(['/lista-usuarios']);
          break;
        case 'Doctor':
          this.router.navigate(['/lista-pacientes']);
          break;
        case 'Recepcionista':
          this.router.navigate(['/calendario']);
          break;
        default:
          this.router.navigate(['/login']);
      }
    }, 500);
  }
}