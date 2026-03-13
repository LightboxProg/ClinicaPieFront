import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GlobalApiService } from './global-api.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ListaNegraPreguntonService {
  private listaSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  lista$: Observable<any[]> = this.listaSubject.asObservable();


  constructor(private http: HttpClient, private api: GlobalApiService) {}


  obtenerTodos(): void {
    this.http.get<any>(this.api.getApiUrl() + '/lista-negra-preguntones').subscribe({
      next: (res) => this.listaSubject.next(res),
      error: (err) => console.error('Error obteniendo lista negra de leads', err),
    });
  }

  getPreguntonesListaNegra() {
    return this.http.get<any>(this.api.getApiUrl()+ `/lista-negra-preguntones`);
  }
  obtenerListaNegraPreguntones(){
    return this.http.get<any>(this.api.getApiUrl() + "/lista-negra-preguntones");
  }

  agregarPregunton(pregunton: any): Observable<any> {
    return this.http.post(this.api.getApiUrl() + '/lista-negra-preguntones', pregunton);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(this.api.getApiUrl() + '/lista-negra-preguntones/remover/' + id);
  }

  // También puedes actualizar el observable interno si quieres mantenerlo sincronizado:
  agregarYActualizarPregunton(pregunton: any): Observable<any> {
    return this.agregarPregunton(pregunton);
  }

  eliminarYActualizar(id: string): void {
    this.eliminar(id).subscribe(() => this.obtenerTodos());
  }

  obtenerFiltrados(query: string): Observable<any> {
    const separator = query ? `?${query}` : '';
    return this.http.get<any>(`${this.api.getApiUrl()}/lista-negra-preguntones-filtrada${separator}`);
  }
  getDatosListaNegraPorPregunton(preguntonId: string): Observable<any> {
    return this.http.get(this.api.getApiUrl() + `/lista-negra-preguntones/buscar/${preguntonId}`);
  }

  removerPreguntonYActualizar(preguntonId: string): Observable<any> {
    return this.http.delete(this.api.getApiUrl() + `/lista-negra-preguntones/remover/${preguntonId}`);
  }

}


