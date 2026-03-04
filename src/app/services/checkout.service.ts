import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GlobalApiService } from './global-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor(private http: HttpClient, private api: GlobalApiService) {}

  // Método para crear la sesión de pago
  crearSesionPago(datosPago: { nombreServicio: string, precioCobrar: number }): Observable<any> {
    return this.http.post(`${this.api.getApiUrl()}/checkout`, datosPago);
  }

}
