import { Routes } from '@angular/router';
import { DebugComponent } from './pages/debug/debug.component';
import { UserLoginComponent } from './pages/users/user-login/user-login.component';
import { UserRegisterComponent } from './pages/users/user-register/user-register.component';
import { ListComponent } from './components/list/list.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { SemaforoComponent } from './components/mensajes/semaforo/semaforo.component';
import { ListElementCitaComponent } from './components/list-elements/list-element-cita/list-element-cita.component';
import { ListCitaComponent } from './components/list-elements/list-cita/list-cita.component';
import { PacienteDetalleComponent } from './components/pacientes/paciente-detalle/paciente-detalle.component';
import { ListaPacientesComponent } from './components/pacientes/lista-pacientes/lista-pacientes.component';
import { PerfilComponent } from './components/pacientes/perfil/perfil.component';
import { ListMensajeComponent } from './components/mensajes/list-mensaje/list-mensaje.component';
import { UserListComponent } from './pages/users/user-list/user-list.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { MensajesComponent } from './pages/mensajes/mensajes.component';
import { authGuard } from './guards/auth.guard';
import { PasarelaComponent } from './pages/pasarela/pasarela.component';
import { ReturnComponent } from './pages/pasarela/return/return.component';
import { CheckoutComponent } from './pages/pasarela/checkout/checkout.component';
import { PacientesListadosComponent } from './pages/pacientes-listados/pacientes-listados.component';
import { ListaPacientesLnComponent } from './components/black-list/lista-pacientes-ln/lista-pacientes-ln.component';
import { PacienteRegistroComponent } from './components/paciente-registro/paciente-registro.component';
import { AgendarCitaComponent } from './components/agenda/agendar-cita/agendar-cita.component';
import { CitasComponent } from './pages/citas/citas.component';
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

export const routes: Routes = [
  // Rutas públicas (sin autenticación)
  { path: "login", component: UserLoginComponent },
  { path: "registroP", component: PacienteRegistroComponent },
  { path: "return", component: ReturnComponent },
  { path: "checkout/:id", component: CheckoutComponent },
  { path: "pagos/:fecha/:id/:tipo", component: PasarelaComponent },

  { path: "prueba", component: CalendarioPageComponent, canActivate: [authGuard] },
  // Rutas para usuarios autenticados (sin restricción de roles)
  { path: "chats2", component: DebugComponent, canActivate: [authGuard] },
  { path: "messages", component: ChatsComponent, canActivate: [authGuard] },
  { path: "list", component: ListComponent, canActivate: [authGuard] },
  { path: "dropdown", component: DropdownComponent, canActivate: [authGuard] },
  { path: "semaforo", component: SemaforoComponent, canActivate: [authGuard] },
  { path: "cita", component: ListElementCitaComponent, canActivate: [authGuard] },
  { path: "lista-citas", component: ListCitaComponent, canActivate: [authGuard] },
  { path: 'lista-mensajes', component: MensajesComponent, canActivate: [authGuard] },
  { path: "detallespaciente/:id", component: PacienteDetalleComponent, canActivate: [authGuard] },
  { path: "perfil/:name/:id", component: PerfilComponent, canActivate: [authGuard] },
  { path: "lista-pacientes", component: PacientesComponent, canActivate: [authGuard] },
  { path: "pruebaC", component: AgendarCitaComponent, canActivate: [authGuard] },
  { path: "sucursales-formulario", component: FormularioSucursalesComponent, canActivate: [authGuard] },
  { path: "sucursales-lista", component: ListaSucursalesComponent, canActivate: [authGuard] },
  { path: "mensajes-masivos", component: MensajesMasivosComponent, canActivate: [authGuard] },
  {path: "chats", component: ChatsComponent, canActivate: [authGuard]},

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
    path: "calendario",
    component: CitasComponent,
    canActivate: [authGuard],
    data: { roles: ['Administrador', 'Recepcionista'] }
  },

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
