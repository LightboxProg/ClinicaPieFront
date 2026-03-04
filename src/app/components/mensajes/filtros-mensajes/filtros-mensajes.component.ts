import { Component, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder,FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { MensajesService } from 'src/app/services/mensajes.service';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';
import { differenceInMilliseconds } from 'date-fns';

@Component({
  selector: 'app-filtros-mensajes',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './filtros-mensajes.component.html',
  styleUrls: ['./filtros-mensajes.component.scss']
})
export class FiltrosMensajesComponent {
  filterForm:FormGroup;
  @Output() urlFiltros: EventEmitter<string> = new EventEmitter<string>();
  credentials:any;
  idsPacientes:any;
  constructor(private loginService:LoginService,private userService:UserService,private fb:FormBuilder,private mensajeService:MensajesService) {
    this.filterForm = this.fb.group({
      estado: [''], // Default value
      orden: [''], // Default value
      search: ['']

    });

    var user= this.loginService.obtenerUsuario();
    this.credentials = user?.usuario;

    this.userService.getIdsPacientes(this.credentials.id).subscribe((pacientes:any)=>{
      this.idsPacientes=pacientes;
    });


  }

  mensajes: any[] = [];
  
  obtenerFiltros(){
    const formValues = this.filterForm.value; // Obtener los valores del formulario
    let queryParams = '';

    const filtros ={
      search: formValues.telefono,
      sortOrder: formValues.orden,
      sortBy: 'createdAt'
    }

    Object.keys(formValues).forEach((key) => {
      const value = formValues[key];
      if (value && value.trim() !== '') {
        queryParams += queryParams ? `&${key}=${value}` : `?${key}=${value}`;
      }
    });



    for (const [key, value ] of Object.entries(filtros)){
      if (value && value.trim() !== '') {
        queryParams += queryParams ? `&${key}=${value}` : `?${key}=${value}`
      }
    }


    this.mensajeService.obtenerMensajesFiltrados(queryParams, this.idsPacientes);
  }
}
