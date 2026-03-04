import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiService } from './global-api.service';
import { Observable } from 'rxjs';
import { Cita } from '../models/worker-record.model';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl: string;

  constructor(private http: HttpClient, private globalApi: GlobalApiService) {
    this.apiUrl = this.globalApi.getApiUrl();
  }

  addCita(nuevo: any): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiUrl}/citas`, nuevo);
  }

  getCita(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/citas`);
  }
  
  getCitasPorPaciente(pacienteId: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiUrl}/citas/paciente/${pacienteId}`);
}

}
