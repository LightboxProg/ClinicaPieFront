import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear: number = new Date().getFullYear();
  isLoggedIn: boolean = false;
  credentials: any;
  private authSubscription!: Subscription;

  constructor(private router: Router, private loginService: LoginService) { }

  ngOnInit(): void {
    this.authSubscription = this.loginService.isLoggedIn$.subscribe(
      (loggedIn) => {
        this.isLoggedIn = loggedIn;
        const user = this.loginService.obtenerUsuario();
        this.credentials = user;
      }
    );
  }

  navigate(ruta: string): void {
    if (ruta === '/lista-mensajes' && this.credentials) {
      this.router.navigate([ruta], { queryParams: this.credentials });
    } else {
      this.router.navigate([ruta]);
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Método para manejar el cierre de sesión
  logout(): void {
    this.loginService.eliminarUsuario();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}