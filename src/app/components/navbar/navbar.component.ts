import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  isLoggedIn: boolean = false;
  isMobileView: boolean = false;

  private authSubscription!: Subscription;
  credentials: any;

  constructor(private router: Router, private loginService: LoginService) { }

  ngOnInit(): void {
    this.checkWindowWidth();
    window.addEventListener('resize', this.checkWindowWidth.bind(this));

    this.authSubscription = this.loginService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      const user = this.loginService.obtenerUsuario();
      this.credentials = user;
    });
  }

  logout(): void {
    this.loginService.eliminarUsuario();
    this.router.navigate(['/login']);
    this.mobileMenuOpen = false;
  }

  navigate(ruta: string): void {
    if (ruta === '/lista-mensajes' && this.credentials) {
      this.router.navigate([ruta], { queryParams: this.credentials });
    } else {
      this.router.navigate([ruta]);
    }
    this.mobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-toggle')) {
      this.mobileMenuOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkWindowWidth();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    window.removeEventListener('resize', this.checkWindowWidth.bind(this));
  }

  checkWindowWidth(): void {
    this.isMobileView = window.innerWidth <= 768;
    if (!this.isMobileView) {
      this.mobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    console.log('toggleMobileMenu called, current state:', this.mobileMenuOpen);
    this.mobileMenuOpen = !this.mobileMenuOpen;
    console.log('new state:', this.mobileMenuOpen);
  }
  esSitioPublico(): boolean {
    const rutasPrivadas = [
      '/login', 
      '/lista-pacientes',
      '/black-list',
      '/sucursales-lista',
      '/sucursales-formulario',
      '/lista-preguntones',
      '/calendario',
      '/mensajes-masivos',
      '/estado-google',
      '/registro',
      '/registroP',
      '/lista-usuarios',
      '/horariosDoctores',
      '/agenda-doctor',
      '/chats',
      '/perfil',
      '/servicios'
    ]; 
    const esconder = rutasPrivadas.some(ruta => this.router.url.includes(ruta));
    return !esconder;
}
}