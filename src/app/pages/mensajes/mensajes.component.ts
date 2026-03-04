import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListMensajeComponent } from 'src/app/components/mensajes/list-mensaje/list-mensaje.component';
import { FiltrosMensajesComponent } from 'src/app/components/mensajes/filtros-mensajes/filtros-mensajes.component';
import { MensajesService } from 'src/app/services/mensajes.service';
import { LoginService } from 'src/app/services/login.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, ListMensajeComponent, FiltrosMensajesComponent],
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.scss']
})
export class MensajesComponent {
  mensaje: any[] = [];
  credentials:any;

  constructor(
    private mensajes: MensajesService,
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute, // Inyectamos ActivatedRoute
  ) {
    if (!this.loginService.existeUsuario()) {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login']);
    }


    this.route.queryParams.subscribe((params) => {
      this.credentials = params;
      console.log(this.credentials,"Creenciales en mensajes");
      this.mensajes.setIdDoctor(this.credentials.id);
    });


  
    // Obtener el id del usuario desde la URL
    this.route.paramMap.subscribe(params => {
      const usuarioId = params.get('id'); // Recuperar el id de la URL
      console.log('ID del usuario desde la URL:', usuarioId);

      if (usuarioId) {
        // Llamar al servicio para obtener los mensajes del usuario
        this.mensajes.getMensajes(usuarioId).subscribe((mensajes: any) => {
          this.mensaje = mensajes;
          console.log('Mensajes cargados:', mensajes);
        });
      }
    });
  }
}
