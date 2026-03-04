import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  // Verificar si el usuario está logueado
  if (!loginService.existeUsuario()) {
    router.navigate(['/login']);
    return false;
  }

  // Obtener información del usuario
  const usuario = loginService.obtenerUsuario();

  // Obtener roles requeridos de la ruta (si existen)
  const rolesRequeridos = route.data?.['roles'] as string[] || [];

  // Si no hay roles requeridos, cualquier usuario autenticado puede acceder
  if (rolesRequeridos.length === 0) {
    return true;
  }

  // Verificar si el usuario tiene uno de los roles requeridos
  if (usuario && rolesRequeridos.includes(usuario.tipo)) {
    return true;
  }

  // Si no tiene permiso, redirigir según el tipo de usuario
  const tipo = usuario?.tipo;

  switch (tipo) {
    case 'Administrador':
      router.navigate(['/lista-usuarios']);
      break;
    case 'Doctor':
      router.navigate(['/lista-pacientes']);
      break;
    case 'Recepcionista':
      router.navigate(['/calendario']);
      break;
    default:
      router.navigate(['/login']);
  }

  return false;
};