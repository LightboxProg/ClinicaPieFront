import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiService } from './global-api.service';
import { Observable } from 'rxjs';

export interface Promocion {
  _id?: string;
  nombre: string;
  descripcion?: string;
  tipoAnclaje: 'servicio' | 'categoria' | 'global';
  servicios?: any[];
  categoria?: string | any;
  sucursales?: string[] | any[];
  fechaInicio: Date;
  fechaFin: Date;
  imagenUrl?: string;
  tipoDescuento: 'porcentaje' | 'monto_fijo';
  valorDescuento: number;
  codigo?: string;
  usosMaximos?: number;
  usosActuales?: number;
  montoMinimo?: number;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  palabrasClave?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PromocionService {
  private apiUrl: string;

  constructor(private http: HttpClient, private globalApi: GlobalApiService) {
    this.apiUrl = this.globalApi.getApiUrl();
  }

  // Obtener promociones con filtros
  obtenerPromociones(filtros?: {
    activa?: boolean;
    vigente?: boolean;
    servicio?: string;
    categoria?: string;
    sucursal?: string;
  }): Observable<{ success: boolean; count: number; data: Promocion[] }> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.activa !== undefined) params = params.set('activo', filtros.activa.toString());
      if (filtros.vigente !== undefined) params = params.set('vigente', filtros.vigente.toString());
      if (filtros.servicio) params = params.set('servicio', filtros.servicio);
      if (filtros.categoria) params = params.set('categoria', filtros.categoria);
      if (filtros.sucursal) params = params.set('sucursal', filtros.sucursal);
    }
    return this.http.get<any>(`${this.apiUrl}/promociones`, { params });
  }

  // Obtener una promoción por ID
  obtenerPromocionPorId(id: string): Observable<{ success: boolean; data: Promocion }> {
    return this.http.get<any>(`${this.apiUrl}/promocion/${id}`);
  }

  // Crear nueva promoción
  crearPromocion(promocion: Promocion): Observable<{ success: boolean; data: Promocion }> {
    return this.http.post<any>(`${this.apiUrl}/promocion`, promocion);
  }

  // Actualizar promoción
  actualizarPromocion(id: string, promocion: Partial<Promocion>): Observable<{ success: boolean; data: Promocion }> {
    return this.http.put<any>(`${this.apiUrl}/promocion/${id}`, promocion);
  }

  eliminarPromocion(id: string, permanente: boolean = false): Observable<{ success: boolean; message: string }> {
    let params = new HttpParams();
    if (permanente) {
      params = params.set('permanente', 'true');
    }
    return this.http.delete<any>(`${this.apiUrl}/promocion/${id}`, { params });
  }
  
  // Reactivar promoción
  activarPromocion(id: string): Observable<{ success: boolean; data: Promocion }> {
    return this.http.patch<any>(`${this.apiUrl}/promocion/${id}/activar`, {});
  }

  // Obtener promociones para un servicio específico
  obtenerPromocionesParaServicio(servicioId: string, sucursalId?: string): Observable<{ success: boolean; data: Promocion[] }> {
    let params = new HttpParams();
    if (sucursalId) params = params.set('sucursal', sucursalId);
    return this.http.get<any>(`${this.apiUrl}/promociones/servicio/${servicioId}`, { params });
  }

  // Validar código promocional
  validarCodigo(codigo: string, servicioId?: string, categoriaId?: string, monto?: number): Observable<any> {
    let params = new HttpParams().set('codigo', codigo);
    if (servicioId) params = params.set('servicioId', servicioId);
    if (categoriaId) params = params.set('categoriaId', categoriaId);
    if (monto !== undefined) params = params.set('monto', monto.toString());
    return this.http.get<any>(`${this.apiUrl}/promociones/validar-codigo`, { params });
  }

  // Registrar uso de una promoción
  usarPromocion(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/promocion/${id}/usar`, {});
  }

  subirImagen(promocionId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/promocion/${promocionId}/subir-imagen`, formData);
  }

  importarPromocionesIniciales(): Observable<{ success: boolean; count: number; data: Promocion[] }> {
    return this.http.post<any>(`${this.apiUrl}/promociones/importar-iniciales`, {});
  }
}