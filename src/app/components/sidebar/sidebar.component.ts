import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  
  // Recibe la orden de si debe estar encogido o no
  @Input() isCollapsed = false;
  
  // Emite un evento cuando oprimes el botón
  @Output() toggle = new EventEmitter<void>();

  menuItems = [
    { titulo: 'Pacientes', ruta: '/lista-pacientes', icono: 'fas fa-users' },
    { titulo: 'Agenda Global', ruta: '/calendario', icono: 'fas fa-calendar-alt' },
    { titulo: 'Agenda Doctor', ruta: '/agenda-doctor', icono: 'fas fa-user-md' },
    { titulo: 'Categorías', ruta: '/categorias', icono: 'fas fa-tags' },
    { titulo: 'Servicios', ruta: '/servicios', icono: 'fas fa-briefcase-medical' },
    { titulo: 'Sucursales', ruta: '/sucursales-lista', icono: 'fas fa-building' },
    { titulo: 'Promociones', ruta: '/promociones', icono: 'fas fa-percentage' },
    { titulo: 'Lista Negra', ruta: '/lista-negra', icono: 'fas fa-ban' },
    { titulo: 'Preguntones', ruta: '/lista-preguntones', icono: 'fas fa-question-circle' },
    { titulo: 'Chats', ruta: '/chats', icono: 'fas fa-comments' },
    { titulo: 'Mensajes Masivos', ruta: '/mensajes-masivos', icono: 'fab fa-whatsapp' }
  ];

  constructor(private router: Router) {}

  isActive(ruta: string): boolean {
    return this.router.url.includes(ruta);
  }

  // Función que se activa al darle clic al icono
  onToggle() {
    this.toggle.emit();
  }
}