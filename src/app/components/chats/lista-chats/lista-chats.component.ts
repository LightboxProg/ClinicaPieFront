import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PacientesService } from 'src/app/services/pacientes.service';
import { MensajesService } from 'src/app/services/mensajes.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-lista-chats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-chats.component.html',
  styleUrls: ['./lista-chats.component.scss']
})
export class ListaChatsComponent {
  isMobile: boolean = false;
  pacientes:any[]=[];
  seCliqueo:boolean = false;

  constructor(private pacienteService:PacientesService,private mensajeService:MensajesService) {
      this.pacienteService.paciente$.subscribe((pacientes:any)=>{
          this.pacientes=pacientes;
          console.log(this.pacientes);
      });
      this.pacienteService.obtenerPacientes();
  }

  ngOnInit(){
    this.checkScreenSize();

    console.log(this.isMobile ? 'Está en modo móvil' : 'Está en modo PC');
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768; // Define el ancho según tu necesidad
  }




  seleccionarChat(idUsuario:String){
    if(this.isMobile==true){
      this.seCliqueo=true;
      this.mensajeService.obtenerMensajesPorPaciente(idUsuario);
    }
    else{
      this.mensajeService.obtenerMensajesPorPaciente(idUsuario);

    }
  
  }




}
