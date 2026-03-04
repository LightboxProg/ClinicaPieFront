import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiService } from './global-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {

  private apiUrl: string;
  
  constructor(private http: HttpClient, private globalApi: GlobalApiService) {
    this.apiUrl = this.globalApi.getApiUrl();
  }

  // Obtener todas (activas e inactivas) con filtros opcionales
  obtenerSucursales(filtros?: { nombre?: string, telefono?: string, ciudad?: string }): Observable<any> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.nombre)   params = params.set('nombre',   filtros.nombre);
      if (filtros.telefono) params = params.set('telefono', filtros.telefono);
      if (filtros.ciudad)   params = params.set('ciudad',   filtros.ciudad);
    }
    return this.http.get(`${this.apiUrl}/sucursales`, { params });
  }

  obtenerSucursalPorId(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sucursales/${id}`);
  }

  crearSucursal(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sucursales`, data);
  }

  actualizarSucursal(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/sucursales/${id}`, data);
  }

  // Desactivar (soft delete)
  desactivarSucursal(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/sucursales/${id}/desactivar`, {});
  }

  // Activar (reactivar)
  activarSucursal(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/sucursales/${id}/activar`, {});
  }

  // Eliminar permanentemente
  eliminarSucursal(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/sucursales/${id}`);
  }
}
