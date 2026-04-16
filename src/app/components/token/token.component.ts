import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebugService, TokenStatus } from 'src/app/services/debug.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-token',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit, OnDestroy {
  status: TokenStatus | null = null;
  isLoading = false;
  private subscription?: Subscription;

  constructor(private debugService: DebugService) {}

  ngOnInit(): void {
    this.verificarToken();
  }

  verificarToken(): void {
    this.isLoading = true;
    this.subscription = this.debugService.verificarTokenGoogle().subscribe({
      next: (status) => {
        this.status = status;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al verificar token:', err);
        this.status = {
          valido: false,
          motivo: null,
          mensaje: '❌ No se pudo conectar con el servidor.'
        };
        this.isLoading = false;
      }
    });
  }

  autenticar(): void {
    this.debugService.redirigirAutenticacion(this.status?.adminEmail);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}