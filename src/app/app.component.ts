import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router'; // Agregamos Router aquí
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'App';

  constructor(public router: Router) {}

  // Función para decidir si mostramos la barra lateral
  // La barra lateral debe mostrarse en TODAS las rutas excepto las públicas
  mostrarSidebar(): boolean {
    // Rutas públicas donde NO debe aparecer la barra lateral
    const rutasPublicas = ['/login', '/', '/nosotros', '/servicios-publicos', '/contacto', '/agendar-cita'];

    // Si la ruta actual está en rutasPublicas, NO mostrar sidebar
    const esRutaPublica = rutasPublicas.some(ruta => 
      this.router.url === ruta || this.router.url.startsWith(ruta + '/')
    );
    
    return !esRutaPublica;
  }

  // Mantener esta función por compatibilidad pero invertida
  mostrarElementosPublicos(): boolean {
    return !this.mostrarSidebar();
  }

  sidebarColapsado = true;

  toggleSidebar() {
    this.sidebarColapsado = !this.sidebarColapsado;
  }

}