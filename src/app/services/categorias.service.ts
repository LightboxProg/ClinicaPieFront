import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiService } from './global-api.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  constructor(private http: HttpClient, private api: GlobalApiService) { }

  // Crear una nueva categoría
  crearCategoria(categoriaData: any): Observable<any> {
    return this.http.post(this.api.getApiUrl() + '/categoria', categoriaData);
  }

  // Obtener todas las categorías
  obtenerCategorias(incluirInactivas: boolean = false): Observable<any> {
    return this.http.get(this.api.getApiUrl() + '/categorias', {
      params: { incluirInactivas: incluirInactivas.toString() }
    });
  }

  // Obtener una categoría por ID
  obtenerCategoriaPorId(id: string): Observable<any> {
    return this.http.get(this.api.getApiUrl() + '/categoria/' + id);
  }

  actualizarCategoria(id: string, categoriaData: any): Observable<any> {
    console.log('Actualizando categoría ID:', id);
    console.log('Datos:', categoriaData);

    return this.http.put(`${this.api.getApiUrl()}/categoria/${id}`, categoriaData).pipe(
      catchError(error => {
        console.error('Error en servicio:', error);
        throw error;
      })
    );
  }

  // Eliminar (desactivar) una categoría
  eliminarCategoria(id: string): Observable<any> {
    return this.http.delete(this.api.getApiUrl() + '/categoria/' + id);
  }

  // Inicializar categorías por defecto
  inicializarCategorias(): Observable<any> {
    return this.http.post(this.api.getApiUrl() + '/categorias/inicializar', {});
  }
}
