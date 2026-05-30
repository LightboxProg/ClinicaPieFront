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

  // Función para decidir si mostramos el menú y el pie de página
  mostrarElementosPublicos(): boolean {
    // Lista de las páginas del sistema donde NO queremos que salgan
    const rutasOcultas = [
      '/login', 
      '/lista-pacientes',
      '/categorias',
      '/black-list' // Puedes agregar más rutas aquí en el futuro
    ]; 

    // Verificamos si la ruta actual está en nuestra lista
    const esconder = rutasOcultas.some(ruta => this.router.url.includes(ruta));
    
    return !esconder; 
  }
  sidebarColapsado = true; 

  toggleSidebar() {
    this.sidebarColapsado = !this.sidebarColapsado;
  }
}