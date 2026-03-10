import { Routes } from '@angular/router';
import { UserLoginComponent } from './pages/users/user-login/user-login.component';
import { UserRegisterComponent } from './pages/users/user-register/user-register.component';
import { PerfilComponent } from './components/pacientes/perfil/perfil.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { authGuard } from './guards/auth.guard';
import { PacientesListadosComponent } from './pages/pacientes-listados/pacientes-listados.component';
import { PacienteRegistroComponent } from './components/paciente-registro/paciente-registro.component';
import { ListaCategoriasComponent } from './components/categorias/lista-categorias/lista-categorias.component';
import { ListaServiciosComponent } from './components/servicios/lista-servicios/lista-servicios.component';
import { FormularioSucursalesComponent } from './components/sucursales/formulario-sucursales/formulario-sucursales.component';
import { RoleRedirectComponent } from './components/role-redirect/role-redirect.component';
import { AgendaDoctorComponent } from './pages/agenda-doctor/agenda-doctor.component';
import { ListaSucursalesComponent } from './components/sucursales/lista-sucursales/lista-sucursales.component';
import { ListaPromocionesComponent } from './components/promociones/lista-promociones/lista-promociones.component';
import { FormularioPromocionComponent } from './components/promociones/formulario-promocion/formulario-promocion.component';
import { MensajesMasivosComponent } from './components/mensaje/mensajes-masivos/mensajes-masivos.component';
import { ChatsComponent } from './components/mensaje/chats/chats.component';
import { CalendarioPageComponent } from './pages/calendario-page/calendario-page.component';
import { PreguntonesComponent } from './pages/preguntones/preguntones.component';
import { FormHorariosComponent } from './components/horarios/form-horarios/form-horarios.component';

export const routes: Routes = [
  // Rutas públicas (sin autenticación)
  { path: "login", component: UserLoginComponent },
  { path: "registroP", component: PacienteRegistroComponent },
  { path: "horariosDoctores", component: FormHorariosComponent },

  // Rutas para usuarios autenticados (sin restricción de roles)
  { path: "calendario", component: CalendarioPageComponent, canActivate: [authGuard] },
  { path: "messages", component: ChatsComponent, canActivate: [authGuard] },
  { path: "chats", component: ChatsComponent, canActivate: [authGuard] },
  { path: "perfil/:name/:id", component: PerfilComponent, canActivate: [authGuard] },
  { path: "lista-pacientes", component: PacientesComponent, canActivate: [authGuard] },
  { path: "lista-preguntones", component: PreguntonesComponent, canActivate: [authGuard] },
  { path: "sucursales-formulario", component: FormularioSucursalesComponent, canActivate: [authGuard] },
  { path: "sucursales-lista", component: ListaSucursalesComponent, canActivate: [authGuard] },
  { path: "mensajes-masivos", component: MensajesMasivosComponent, canActivate: [authGuard] },
  

  // Rutas solo para Administrador
  {
    path: "registro",
    component: UserRegisterComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: "lista-usuarios",
    component: UserListComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: "categorias",
    component: ListaCategoriasComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: "servicios",
    component: ListaServiciosComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador'] }
  },

  // Rutas para Administrador y Recepcionista


  {
    path: "promociones",
    component: ListaPromocionesComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Recepcionista'] }
  },
  {
    path: "promocion-form",
    component: FormularioPromocionComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Recepcionista'] }
  },
  {
    path: "promocion-form/:id",
    component: FormularioPromocionComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Recepcionista'] }
  },
  {
    path: "sucursales-formulario",
    component: FormularioSucursalesComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: "sucursales-formulario/:id",
    component: FormularioSucursalesComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador'] }
  },

  // Rutas para Administrador y Doctor
  {
    path: "lista-negra",
    component: PacientesListadosComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Doctor'] }
  },
  
  // Agenda: Doctor ve la suya propia, Admin/Recepcionista ven la general
  { 
    path: "agenda-doctor", 
    component: AgendaDoctorComponent,
    canActivate: [authGuard],
    data: { roles: ['Doctor', 'Administrador', 'Recepcionista'] }
  },

  // Ruta por defecto (redirigir según rol o a login) - MODIFICADO
  {
    path: '',
    pathMatch: 'full',
    component: RoleRedirectComponent, // Usa el componente de redirección
    canActivate: [authGuard] // El guardia verificará autenticación
  },

  // Ruta para página no encontrada (opcional)
  { path: '**', redirectTo: '/login' }
];
