import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { GlobalApiService } from './global-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket!: Socket;

  constructor(private globalApiService: GlobalApiService) {
    this.connect();
  }

  private connect(): void {
    this.socket = io(this.globalApiService.getApiUrl(), {
      transports: ['websocket'],
      withCredentials: true
    });
  }

  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      });
    });
  }

  emit(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
