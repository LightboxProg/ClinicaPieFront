import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListElementMensajeComponent } from '../../mensajes/list-element-mensaje/list-element-mensaje.component';
import { MensajesService } from 'src/app/services/mensajes.service';
import { HostListener } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule,ListElementMensajeComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  isMobile: boolean = false;
  regresarMensajes: boolean = false;
  mensajes:any;

  constructor(private mensajeService:MensajesService,private router:Router){
      this.mensajeService.mensaje$.subscribe((mensaje:any)=>{
        this.mensajes = mensaje;
        console.log(this.mensajes,"MENSAJES ACTUALES");
      });
  }

  ngOnInit(){
    this.checkScreenSize();
  }

  
  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }


  checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // Define el ancho según tu necesidad
  }

  

  


}
