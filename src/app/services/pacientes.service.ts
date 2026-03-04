import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalApiService } from './global-api.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {


  private pacientesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  paciente$: Observable<any[]> = this.pacientesSubject.asObservable();

  private preguntonesSubject = new BehaviorSubject<any[]>([]);
  preguntone$: Observable<any[]> = this.preguntonesSubject.asObservable();

  constructor(private api: GlobalApiService, private http: HttpClient) { }

  obtenerPacientes() {
    this.http.get(this.api.getApiUrl() + "/pacientes").subscribe((res: any) => {
      this.pacientesSubject.next(res);
    });
  }

  obtenerPacientesCitas(): Observable<any[]> {
    return this.http.get<any[]>(this.api.getApiUrl() + "/pacientes/para-citas");
  }


  getPacienteById(id: String): Observable<any> {
    return this.http.get(this.api.getApiUrl() + "/paciente/" + id);
  }


  eliminarPaciente(id: string): Observable<any> {
    return this.http.delete(this.api.getApiUrl() + "/paciente/" + id);
  }

  guardarAlergias(id: string, data: any) {
    return this.http.put(this.api.getApiUrl() + `/paciente/${id}/alergias`, data);
  }

  guardarMedicamentos(id: string, data: any) {
    return this.http.put(this.api.getApiUrl() + `/paciente/${id}/medicamentos`, data);
  }

  buscarPorTelefono(telefono: string): Observable<any> {
    return this.http.get(this.api.getApiUrl() + `/buscarPacientePorTelefono/${telefono}`);
  }

  actualizarLista(pacientes: any[]) {
    this.pacientesSubject.next(pacientes);
  }

  esPacienteEnListaNegra(pacienteId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.api.getApiUrl()}/lista-negra/verificar/${pacienteId}`);
  }

  obtenerPacientesEnListaNegra(): Observable<any[]> {
    return this.http.get<any[]>(this.api.getApiUrl() + "/pacientes/lista-negra");
  }
  actualizarPaciente(id: string, data: any): Observable<any> {
    return this.http.put(this.api.getApiUrl() + `/paciente/${id}`, data);
  }
  crearPaciente(pacienteData: any): Observable<any> {
    return this.http.post(this.api.getApiUrl() + '/paciente', pacienteData);
  }
  Pacientes(): Observable<any[]> {
    return this.http.get<any[]>(this.api.getApiUrl() + "/pacientes");
  }
  vincularPacienteCita(data: any) {
    return this.http.post(this.api.getApiUrl() + "/vincularPacienteCita", data);
  }
  eliminarPacienteConContrasena(usuario: string, password: string, pacienteId: string) {
    return this.http.post(this.api.getApiUrl() + "/eliminarPaciente", {
      usuario,
      password,
      pacienteId
    });
  }
  obtenerFotosDelPaciente(pacienteId: string): Observable<any> {
    return this.http.get(`${this.api.getApiUrl()}/album/paciente/${pacienteId}`);
  }

  subirImagenAlbum(pacienteId: string, formData: FormData) {
    return this.http.post(`${this.api.getApiUrl()}/subirImagenAlbum/${pacienteId}`, formData);
  }


  obtenerPreguntones() {
    this.http.get(this.api.getApiUrl() + "/preguntones").subscribe((res: any) => {
      this.preguntonesSubject.next(res);
    });
  }

}

