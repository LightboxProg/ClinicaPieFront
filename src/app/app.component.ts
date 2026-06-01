import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router'; // Agregamos Router aquí
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    RouterModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'App';

  constructor(public router: Router) {}

  mostrarSidebar(): boolean {
    // Rutas donde NO debe aparecer la barra lateral
    const rutasSinSidebar = ['/login'];

    // Si la ruta actual está en rutasSinSidebar, NO mostrar sidebar
    const esRutaSinSidebar = rutasSinSidebar.some(ruta => 
      this.router.url === ruta || this.router.url.startsWith(ruta + '/')
    );
    
    return !esRutaSinSidebar;
  }

  sidebarColapsado = true;

  toggleSidebar() {
    this.sidebarColapsado = !this.sidebarColapsado;
  }

}