import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalApiService } from './global-api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MensajesService {
  private mensajesSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  mensaje$: Observable<any[]> = this.mensajesSubject.asObservable();

  idDoctor = "";

  constructor(private api: GlobalApiService, private http: HttpClient) { }

  ngOnInit(){
  }

  // Modificar la función para recibir el usuarioId
  getMensajes(usuarioId: string): Observable<any> {
    return this.http.get(this.api.getApiUrl() + "/getMensajes?usuarioId=" + usuarioId);
  }

  obtenerMensjaes() {
    this.http.get(this.api.getApiUrl() + "/getMensajes").subscribe((res: any) => {
      this.mensajesSubject.next(res);
    });
  }

  obtenerMensajesPorPaciente(idUsuario:String){
    this.http.get(this.api.getApiUrl() + "/getMensajesByIdPaciente/"+idUsuario).subscribe((res:any)=>{
      this.mensajesSubject.next(res);
    });
  }




  setIdDoctor(idDoc:string){
    this.idDoctor=idDoc;
  }

  deleteMensaje(id: string): Observable<any> {
    return this.http.delete(this.api.getApiUrl() + "/deleteMensaje/" + id);
  }
  obtenerMensajesFiltrado(URLFiltros: String, IdsPacientes: any[] = []): Observable<any[]> {
    return this.http.post<any[]>(this.api.getApiUrl() + "/getMensajesFiltrados" + URLFiltros, IdsPacientes);
  }


  obtenerMensajesFiltrados(URLFiltros: String,IdsPacientes:any[]=[]) {
    console.log(IdsPacientes,"Ids pacientes");
        this.http.post<any[]>(this.api.getApiUrl() + "/getMensajesFiltrados" + URLFiltros,IdsPacientes).subscribe(
          (res) => {this.mensajesSubject.next(res);
            console.log(res,"El resss");
          },
          (err) => console.error("Error obteniendo mensajes filtrados:", err)
        );
    }


    enviarMensajeDoctor(mensaje: any): Observable<any> {
      return this.http.post(this.api.getApiUrl() + '/addMensajeDoctor', mensaje);
    }

    obtenerMensajesPorPacient(idPaciente: string): Observable<any> {
      return this.http.get(this.api.getApiUrl() + `/getMensajesByIdPaciente/${idPaciente}`);
    }

    obtenerMensajesDoctor(idDoctor: string, idPaciente: string): Observable<any> {
      return this.http.get(this.api.getApiUrl() + `/getMensajesDoctor?idDoctor=${idDoctor}&idPaciente=${idPaciente}`);
    }

    marcarMensajeComoAtendido(mensajeEstado: { mensajeId: string }): Observable<any> {
      return this.http.post<any>(this.api.getApiUrl() + `/mensajes/marcar-atendidos`, mensajeEstado);
    }
  }

