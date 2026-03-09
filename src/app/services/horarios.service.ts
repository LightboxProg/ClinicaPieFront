import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalApiService } from './global-api.service';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  private apiUrl: string;

  constructor(private http: HttpClient, private globalApi: GlobalApiService) {
    this.apiUrl = this.globalApi.getApiUrl();
  }

  // 1. Guarda o actualiza la configuración completa de la semana de un especialista
  guardarHorario(idUsuario: string, horarios: any[]): Observable<any> {
    const payload = {
      idUsuario: idUsuario,
      horarios: horarios
    };
    return this.http.post<any>(`${this.apiUrl}/guardar`, payload);
  }

  // 2. Trae el listado completo de días para pintar la vista de "Configuración de Horario"
  obtenerHorarioPorUsuario(idUsuario: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/horario/${idUsuario}`);
  }

  // 3. Trae el diccionario optimizado (mapaHorario) para validar horas en el calendario
  getHorarioSemanalDoctor(doctorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/horario-doctor/${doctorId}`);
  }

  // 4. Obtiene todos los horarios de todos los especialistas agrupados (Para vistas generales)
  obtenerTodosLosHorarios(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/todos`);
  }
}
