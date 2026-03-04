import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListElementCitaComponent } from '../list-element-cita/list-element-cita.component';
import { SemaforoComponent } from "../../mensajes/semaforo/semaforo.component";
import { Router, RouterModule } from '@angular/router';
import { CitaService } from 'src/app/services/cita.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-list-cita',
  standalone: true,
  imports: [CommonModule, ListElementCitaComponent, SemaforoComponent, RouterModule],
  templateUrl: './list-cita.component.html',
  styleUrls: ['./list-cita.component.scss']
})
export class ListCitaComponent implements OnInit {
  citas: any[] = []; // Aquí se almacenarán las citas obtenidas



  
       constructor(private citaService: CitaService, private loginService: LoginService, private router: Router) {
          if (!this.loginService.existeUsuario()) {
            // Si no está autenticado, redirigir al login
            this.router.navigate(['/login']);
          }
        }

  ngOnInit(): void {
    // this.obtenerCitas();
  }

  // obtenerCitas(): void {
  //   this.citaService.obtenerCitas().subscribe(
  //     (data) => {
  //       this.citas = data; // Almacenamos las citas en la variable citas
  //     },
  //     (error) => {
  //       console.error('Error al obtener las citas', error);
  //     }
  //   );
  // }

}
