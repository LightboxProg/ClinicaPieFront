import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GlobalApiService {
  constructor() {}
  private url: string = 'http://localhost:5000/ProPigment';

  getApiUrl() {
    return this.url;
  }
}
