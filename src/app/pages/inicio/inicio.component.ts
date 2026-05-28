import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'] 
})
export class InicioComponent {

  constructor(private router: Router) {}

  agendarCita() {
    console.log("Botón presionado: Yendo a la agenda...");
  }

  verServicios() {
    console.log("Botón presionado: Yendo a los servicios...");
  }
}