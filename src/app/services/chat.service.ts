import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { GlobalApiService } from './global-api.service';
import { LoginService } from './login.service'; //  Inyectamos tu LoginService

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  //  Aplicamos patrón para mantener las plantillas en memoria global
  private plantillasSubject = new BehaviorSubject<any[]>([]);
  plantillas$: Observable<any[]> = this.plantillasSubject.asObservable();

  constructor(
    private http: HttpClient,
    private api: GlobalApiService,
    private loginService: LoginService // Nos da acceso a saber quién está conectado
  ) { }

  cargarPlantillasMeta(): Observable<any> {
    // Usamos tap() de RxJS para guardar la respuesta en el Subject silenciosamente
    return this.http.get<any>(`${this.api.getApiUrl()}/crm/plantillas`).pipe(
      tap(res => {
        if (res && res.success) {
          this.plantillasSubject.next(res.plantillas);
        }
      })
    );
  }

  obtenerValorPlantillasActuales(): any[] {
    return this.plantillasSubject.getValue(); // Leer el estado actual sin llamar a la API
  }


  responderDesdeCRM(idPaciente: string, telefono: string, mensaje: string): Observable<any> {
    // 🕵️‍♂️ AQUÍ VEMOS QUIÉN LO MANDA
    const usuarioLogueado = this.loginService.obtenerUsuario();

    const payload = {
      // Si hay un usuario logueado, tomamos su ID, si no, lo marcamos como desconocido
      idDoctor: usuarioLogueado ? usuarioLogueado.id : 'desconocido',
      idPaciente: idPaciente,
      telefono: telefono,
      mensaje: mensaje
    };

    return this.http.post<any>(`${this.api.getApiUrl()}/crm/responder`, payload);
  }


  lanzarCampanaMasiva(datosCampana: any): Observable<any> {

    const usuarioLogueado = this.loginService.obtenerUsuario();

    const payload = {
      ...datosCampana,
      lanzadoPorId: usuarioLogueado ? usuarioLogueado.id : 'desconocido',
      lanzadoPorNombre: usuarioLogueado ? usuarioLogueado.usuario : 'desconocido'
    };

    return this.http.post<any>(`${this.api.getApiUrl()}/crm/masivos`, payload);
  }

  obtenerBandejaMensajes(tipo?: string): Observable<any> {
    let url = `${this.api.getApiUrl()}/crm/mensajes`;
    // Si queremos filtrar solo pacientes o solo preguntones
    if (tipo) {
      url += `?tipo=${tipo}`;
    }
    return this.http.get<any>(url);
  }

  // 2. Obtiene las burbujas de conversación de un usuario específico
  obtenerHistorialChat(idUsuario: string): Observable<any> {
    return this.http.get<any>(`${this.api.getApiUrl()}/crm/chat/${idUsuario}`);
  }


  cambiarStatusSaludos(idUsuario: string): Observable<any> {
    return this.http.post<any>(`${this.api.getApiUrl()}/crm/cambiar-status-saludos`, { idUsuario });
  }
}