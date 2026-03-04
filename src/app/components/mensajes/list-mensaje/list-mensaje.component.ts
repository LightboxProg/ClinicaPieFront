import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListElementMensajeComponent } from '../list-element-mensaje/list-element-mensaje.component';
import { SemaforoComponent } from '../../mensajes/semaforo/semaforo.component';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MensajesService } from 'src/app/services/mensajes.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { UserService } from 'src/app/services/user.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-list-mensaje',
  standalone: true,
  imports: [CommonModule, ListElementMensajeComponent, RouterModule, NgxPaginationModule],
  templateUrl: './list-mensaje.component.html',
  styleUrls: ['./list-mensaje.component.scss']
})
export class ListMensajeComponent implements OnInit {
  p: number = 1;
  mensajes: any[] = [];
  usuarioId: string | null = null;
  credentials:any;

  constructor(
    private mensajeService: MensajesService,
    private route: ActivatedRoute,// Inyectamos ActivatedRoute
    private userService:UserService,
    private loginService:LoginService
  ) {}

  ngOnInit(): void {


    this.mensajeService.mensaje$.subscribe((data) => {
      this.mensajes = data;
      console.log('Mensajes recibidos:', data);
    });

    var user= this.loginService.obtenerUsuario();
    console.log(user,"Credenciales del usuario ");
    
    this.credentials = user?.usuario;
    console.log(this.credentials,"LAS CREDENTIALS");
    this.obtenerMensajes();
    // Obtener el usuarioId de la URL
   
  }

  obtenerMensajes(): void {
    if(this.credentials.tipo="Doctor"){
      this.userService.getIdsPacientes(this.credentials.id).subscribe(pacientes=>{
        console.log(pacientes.idPacientes,"Pacientes");
        this.mensajeService.obtenerMensajesFiltrados("",pacientes)}); 
        
    }
    
    else{
      this.mensajeService.obtenerMensajesFiltrados("",[])
    } 
        
 
    
  
  }
}





