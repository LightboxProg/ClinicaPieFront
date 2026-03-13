import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GlobalApiService {
  constructor() {}
  private url: string = environment.apiUrl;

  getApiUrl() {
    return this.url;
  }
}
