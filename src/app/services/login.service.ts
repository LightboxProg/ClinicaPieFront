import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { GlobalApiService } from './global-api.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private usuarioKey = 'usuarioAutenticado';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.existeUsuario());
  private usuarioSubject = new BehaviorSubject<any>(this.obtenerUsuario());

  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  usuario$: Observable<any> = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient, private api: GlobalApiService) { }

  autenticarUsuario(datos: { usuario: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.api.getApiUrl()}/userAuth`, datos);
  }

  guardarUsuario(usuario: { id: string; usuario: string; tipo: string; telefono: number }): void {
    localStorage.setItem(this.usuarioKey, JSON.stringify(usuario));
    this.isLoggedInSubject.next(true);
    this.usuarioSubject.next(usuario); // Actualizar el subject del usuario
  }

  obtenerUsuario(): { id: string; usuario: string; tipo: string; telefono: number } | null {
    const usuario = localStorage.getItem(this.usuarioKey);
    return usuario ? JSON.parse(usuario) : null;
  }
  

  actualizarUsuario(usuario: { id: string; usuario: string; tipo: string; telefono: number }): void {
    this.guardarUsuario(usuario);
  }

  eliminarUsuario(): void {
    localStorage.removeItem(this.usuarioKey);
    this.isLoggedInSubject.next(false);
    this.usuarioSubject.next(null); // Limpiar el subject del usuario
  }

  existeUsuario(): boolean {
    return localStorage.getItem(this.usuarioKey) !== null;
  }
  obtenerDoctoresPorSucursal(sucursalId: string): Observable<any> {
    return this.http.get<any>((`${this.api.getApiUrl()}/doctores-sucursal/${sucursalId}`));
  }
}
