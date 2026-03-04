import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private apiKey = 'TU_API_KEY_DE_GOOGLE'; 

  constructor(private http: HttpClient) {}

  // Paso 1: Intentar sacar coordenadas del link usando Regex
  obtenerCoordenadasDeLink(url: string): { lat: number, lng: number } | null {
    // Regex para buscar patrones como @21.88234,-102.2834
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);

    if (match && match.length >= 3) {
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2])
      };
    }
    return null; // No se encontraron coordenadas
  }

  // Paso 2: Preguntar a Google la dirección de esas coordenadas
  obtenerDireccionDesdeCoords(lat: number, lng: number): Observable<any> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;
    
    return this.http.get(url).pipe(
      map((response: any) => {
        if (response.results && response.results.length > 0) {
          return this.formatearDireccion(response.results[0]);
        }
        return null;
      })
    );
  }

  // Helper para limpiar la respuesta de Google y adaptarla a tu modelo Mongoose
  private formatearDireccion(googleResult: any) {
    const components = googleResult.address_components;
    const getComponent = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name || '';

    return {
      calle: getComponent('route'),
      numero: getComponent('street_number'),
      colonia: getComponent('sublocality') || getComponent('neighborhood'),
      ciudad: getComponent('locality'),
      estado: getComponent('administrative_area_level_1'),
      codigoPostal: getComponent('postal_code'),
      fullAddress: googleResult.formatted_address // Dirección completa en texto
    };
  }
}