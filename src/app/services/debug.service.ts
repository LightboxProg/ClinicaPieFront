import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalApiService } from './global-api.service';


export interface TokenStatus {
  valido: boolean;
  motivo: 'no_token' | 'token_invalido' | null;
  adminEmail?: string;
  mensaje: string;
}


@Injectable({
  providedIn: 'root'
})
export class DebugService {

 constructor(private http: HttpClient, private api: GlobalApiService) { }

  verificarTokenGoogle(): Observable<TokenStatus> {
    return this.http.get<TokenStatus>(this.api.getApiUrl() + '/verificar-token-google');
  }

  redirigirAutenticacion(email?: string): void {
    let url = this.api.getApiUrl() + '/auth';
    if (email) {
      url += `?email=${encodeURIComponent(email)}`;
    }
    window.location.href = url;
  }
}
