import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiService } from './global-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarioService {

  private apiUrl: string;

  constructor(private http: HttpClient, private globalApi: GlobalApiService) {
    this.apiUrl = this.globalApi.getApiUrl();
  }

  // 1. Obtiene los eventos de TODOS los doctores activos
  getAllUsersEvents(timeMin?: string, timeMax?: string): Observable<any> {
    let params = new HttpParams();

    // Si la vista nos manda fechas, las inyectamos en la petición
    if (timeMin) params = params.set('timeMin', timeMin);
    if (timeMax) params = params.set('timeMax', timeMax);

    return this.http.get<any>(`${this.apiUrl}/eventos-todos`, { params });
  }

  getDoctoresActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctores-activos`);
  }

  // 2. Obtener la disponibilidad de un doctor en una fecha específica
  getDisponibilidadDoctor(doctorId: string, fecha: string): Observable<any> {
    const params = new HttpParams()

      .set('idUsuario', doctorId)
      .set('fecha', fecha);

    return this.http.get<any>(`${this.apiUrl}/disponibilidad-doctor`, { params });
  }
  // 3. Obtener la disponibilidad en un rango de fechas
  getDisponibilidadRango(doctorId: string, fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('doctorId', doctorId)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<any>(`${this.apiUrl}/disponibilidad-rango`, { params });
  }

  // 4. Obtener los eventos de calendar de cada sucursal en una semana
  getCitasPorSucursalSemana(sucursalId: string, fechaInicio: string, fechaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('sucursalId', sucursalId)
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<any>(`${this.apiUrl}/citas-por-sucursal-semana`, { params });
  }

  // 5. Agendar citas (El endpoint inteligente que acabamos de armar)
  agendarCita(datosCita: any): Observable<any> {
    // datosCita debe incluir: { telefono, doctorId, itemTipo, itemId, fechaCita, horaInicio, etc. }
    return this.http.post<any>(`${this.apiUrl}/agendar`, datosCita);
  }

  // 6. Reagendar cita (Cambio de fecha, hora o doctor)
  reagendarCita(datosReagenda: any): Observable<any> {
    // datosReagenda incluye: citaId, tipoContacto, oldDoctorId, newDoctorId, nuevaFecha, nuevaHoraInicio, nuevaHoraFin
    return this.http.put<any>(`${this.apiUrl}/reagendar-cita`, datosReagenda);
  }


  getHorarioSemanalDoctor(doctorId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/horario-doctor/${doctorId}`);
  }

  crearBloqueo(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bloqueos/crear-desde-seleccion`, datos);
  }

}