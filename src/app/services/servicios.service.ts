import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiService } from './global-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  constructor(private http: HttpClient, private api: GlobalApiService) { }

  // Crear un nuevo servicio
  crearServicio(servicioData: any): Observable<any> {
    return this.http.post(this.api.getApiUrl() + '/servicio', servicioData);
  }

  // Obtener todos los servicios
  obtenerServicios(activo: string = 'true', incluirInactivos: string = 'false'): Observable<any> {
    const params: any = { activo, incluirInactivos };
    return this.http.get(this.api.getApiUrl() + '/servicios', { params });
  }

  // Obtener un servicio por ID
  obtenerServicioPorId(id: string): Observable<any> {
    return this.http.get(this.api.getApiUrl() + '/servicio/' + id);
  }

  // Actualizar un servicio
  actualizarServicio(id: string, servicioData: any): Observable<any> {
    return this.http.put(this.api.getApiUrl() + '/servicio/' + id, servicioData);
  }

  // Eliminar (desactivar) un servicio
  eliminarServicio(id: string, permanente: boolean = false): Observable<any> {
    let params: any = {};
    if (permanente) {
      params.permanente = 'true';
    }
    return this.http.delete(this.api.getApiUrl() + '/servicio/' + id, { params });
  }

  // Importar servicios iniciales
  importarServiciosIniciales(): Observable<any> {
    return this.http.post(this.api.getApiUrl() + '/servicios/importar-iniciales', {});
  }

  // Obtener servicios individuales para citas
  obtenerServiciosIndividuales(): Observable<any> {
    return this.http.get(this.api.getApiUrl() + '/servicios-individuales');
  }

  // Obtener precio de un servicio para una sucursal
  obtenerPrecioPorSucursal(servicioId: string, sucursalId: string): Observable<any> {
    return this.http.get(this.api.getApiUrl() + '/servicio/' + servicioId + '/precio-sucursal/' + sucursalId);
  }
}
