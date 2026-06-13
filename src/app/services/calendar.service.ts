import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiService } from './global-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl: string;

  constructor(private http: HttpClient, private globalApi: GlobalApiService) {
    this.apiUrl = this.globalApi.getApiUrl();
  }

  // Obtener los calendarios disponibles
  getCalendars(): Observable<any> {
    return this.http.get(`${this.apiUrl}/calendars`);
  }

  //cupos disponibles para visualizar agenda
  getCuposDisponibles(inicio: string, fin: string) {
    return this.http.get<any[]>(`${this.apiUrl}/disponibilidad`, {
      params: { inicio, fin }
    });
  }

  //horarios disponibles anuales para agendar y bloquear citas
  getCuposDisponiblesAnuales(sucursalId?: string) {
    let params = new HttpParams();
    if (sucursalId) params = params.set('sucursalId', sucursalId);
    return this.http.get<any[]>(`${this.apiUrl}/citasDisponibles`, { params });
  }


  //agenda anual detallada
  agendaAnualDetallada(inicio: string, fin: string): Observable<any> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);

    return this.http.get<any[]>(`${this.apiUrl}/agendaAnualDetallada`, { params });
  }

  // Obtener agenda del doctor
  obtenerAgendaDoctor(usuarioId: string, inicio: string, fin: string): Observable<any> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);

    return this.http.get<any[]>(`${this.apiUrl}/agenda-doctor/${usuarioId}`, { params });
  }

  // Obtener agenda general con citas de todos los doctores (with optional doctorIds filter)
  obtenerAgendaGeneral(inicio: string, fin: string, doctorIds?: string[]): Observable<any> {
    let params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);

    if (doctorIds && doctorIds.length > 0) {
      params = params.set('doctorIds', doctorIds.join(','));
    }

    return this.http.get<any[]>(`${this.apiUrl}/agenda-general`, { params });
  }

  // Obtener lista de doctores disponibles en la agenda
  obtenerListaDoctoresAgenda(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctores-agenda`);
  }

  //generar cita
  generarCita(payload: {
    pacienteId: string;
    servicioContratadoId?: string;
    servicioId?: string;  // Nuevo campo
    fecha: string;
    hora: string;
    ampm: string;
    observaciones?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/citasCalendar`, payload);
  }

  // Obtener detalles de evento existente
  obtenerDetallesEvento(fecha: string, hora: string, ampm: string): Observable<any> {
    const params = new HttpParams()
      .set('fecha', fecha)
      .set('hora', hora)
      .set('ampm', ampm);

    return this.http.get(`${this.apiUrl}/calendario/evento-detalles`, { params });
  }

  // Eliminar cita
  eliminarCita(eventoId: string, motivo?: string, servicioContratadoId?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/calendario/eliminar-cita`, {
      eventoId,
      motivo: motivo || 'Cancelado por usuario',
      servicioContratadoId
    });
  }

  //bloquear horario
  bloquearHorario(data: { fechaInicio: string; fechaFin: string; motivo: string; creadoPorId: string; creadoPorNombre: string; }): Observable<any> {
    return this.http.post(`${this.apiUrl}/bloquearHorario`, data);
  }

  crearBloqueo(data: {
    fechaInicio: string;
    fechaFin: string;
    motivo: string;
    tipo: 'personal' | 'mantenimiento' | 'reunion' | 'general';
    creadoPorId: string;
    creadoPorNombre: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/bloquearHorario`, data);
  }


  // Obtener bloqueos
  getBloqueos(fecha?: string, tipo?: string): Observable<any> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<any[]>(`${this.apiUrl}/bloqueos`, { params });
  }

  // Eliminar bloqueo
  eliminarBloqueo(id: string, motivo: string, eliminadoPor: string = 'sistema'): Observable<any> {
    const body = {
      motivoEliminacion: motivo,
      eliminadoPor: eliminadoPor
    };

    return this.http.delete(`${this.apiUrl}/bloqueos/${id}`, {
      body: body,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  verificarSlotParaBloqueo(fecha: string, horaInicio: string, horaFin: string): Observable<any> {
    const params = new HttpParams()
      .set('fecha', fecha)
      .set('horaInicio', horaInicio)
      .set('horaFin', horaFin);

    return this.http.get(`${this.apiUrl}/bloqueos/verificar-slot`, { params });
  }

  crearBloqueoDesdeSeleccion(data: {
    fecha: string;
    horaInicio: string;
    horaFin: string;
    motivo?: string;
    tipo: 'personal' | 'mantenimiento' | 'reunion' | 'general';
    creadoPorId: string;
    creadoPorNombre: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/bloqueos/crear-desde-seleccion`, data);
  }

  obtenerBloqueosPorFecha(fecha: string): Observable<any> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<any[]>(`${this.apiUrl}/bloqueos/por-fecha`, { params });
  }

}

