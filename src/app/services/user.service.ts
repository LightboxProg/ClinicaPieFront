import { Injectable } from '@angular/core';
import { GlobalApiService } from './global-api.service';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { usuario } from '../models/worker-record.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private api: GlobalApiService, private http: HttpClient) { }

  addUser(nuevo: any): Observable<usuario> {
    return this.http.post<usuario>(`${this.api.getApiUrl()}/user/`, nuevo);
  }

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api.getApiUrl()}/user/`);
  }

  asignarPacientes(doctorId: string, pacienteIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.api.getApiUrl()}/user/asignarPacientes`, { doctorId, pacienteIds });
  }

  asignarServicios(doctorId: string, serviciosIds: string[]): Observable<any> {
    return this.http.post(`${this.api.getApiUrl()}/user/asignarServicios`, { doctorId, serviciosIds });
  }

  removerServicio(doctorId: string, servicioId: string): Observable<any> {
    return this.http.post(`${this.api.getApiUrl()}/user/removerServicio`, { doctorId, servicioId });
  }

  getIdsPacientes(idUsuario: string): Observable<any> {
    return this.http.get(this.api.getApiUrl() + "/getIdsPacientes/" + idUsuario);
  }

  eliminarUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.api.getApiUrl()}/user/${id}`);
  }

  buscarPacientePorTelefono(telefono: string) {
    return this.http.get<any>(`/api/pacientes/buscar?telefono=${telefono}`);
  }

  eliminarUsuarioConPassword(usuario: any, password: string, usuarioIdAEliminar: string) {
    return this.http.post(`${this.api.getApiUrl()}/eliminarUsuarios`, {
      usuario,
      password,
      usuarioIdAEliminar
    });
  }

  removerPaciente(doctorId: string, pacienteId: string): Observable<any> {
    return this.http.post(`${this.api.getApiUrl()}/user/removerPaciente`, { doctorId, pacienteId });
  }

  cambiarPassword(adminId: string, adminPassword: string, targetUserId: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.api.getApiUrl()}/cambiarPassword`, {
      adminId,
      adminPassword,
      targetUserId,
      newPassword
    });
  }

  actualizarUsuario(id: string, datos: any): Observable<any> {
    return this.http.put(`${this.api.getApiUrl()}/user/${id}`, datos);
  }
}
