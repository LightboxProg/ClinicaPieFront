import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiService } from './global-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioContratadoService {
  constructor(private http: HttpClient, private api: GlobalApiService) { }

  // Contratar un nuevo servicio
  contratarServicio(servicioData: any): Observable<any> {
    return this.http.post(this.api.getApiUrl() + '/servicio-contratado', servicioData);
  }

  // Obtener servicios contratados por paciente
  obtenerServiciosPorPaciente(pacienteId: string, estado?: string): Observable<any> {
    let params: any = {};
    if (estado) {
      params.estado = estado;
    }
    return this.http.get(`${this.api.getApiUrl()}/paciente/${pacienteId}/servicios-contratados`, { params });
  }

  // Usar una sesión
  usarSesion(servicioContratadoId: string, observaciones?: string): Observable<any> {
    return this.http.put(`${this.api.getApiUrl()}/servicio-contratado/${servicioContratadoId}/usar-sesion`, {
      observacionesUso: observaciones
    });
  }

  // Agregar sesiones
  agregarSesiones(servicioContratadoId: string, cantidad: number, motivo?: string): Observable<any> {
    return this.http.put(`${this.api.getApiUrl()}/servicio-contratado/${servicioContratadoId}/agregar-sesiones`, {
      cantidad,
      motivo
    });
  }

  // Actualizar servicio contratado
  actualizarServicioContratado(servicioContratadoId: string, datos: any): Observable<any> {
    return this.http.put(`${this.api.getApiUrl()}/servicio-contratado/${servicioContratadoId}`, datos);
  }

  // Eliminar servicio contratado
  eliminarServicioContratado(servicioContratadoId: string): Observable<any> {
    return this.http.delete(`${this.api.getApiUrl()}/servicio-contratado/${servicioContratadoId}`);
  }

  // Obtener estadísticas
  obtenerEstadisticas(pacienteId: string): Observable<any> {
    return this.http.get(`${this.api.getApiUrl()}/paciente/${pacienteId}/estadisticas-servicios`);
  }

  eliminarTodosServicios(pacienteId: string): Observable<any> {
    return this.http.delete(`${this.api.getApiUrl()}/paciente/${pacienteId}/servicios-contratados`);
  }

  ajustarServicio(servicioContratadoId: string, data: { ajusteSesiones?: number; fechaExpiracion?: string }): Observable<any> {
    return this.http.put(`${this.api.getApiUrl()}/servicio-contratado/${servicioContratadoId}/ajustar`, data);
  }
}