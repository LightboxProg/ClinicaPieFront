import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormComponent } from '../../forms/form/form.component';
import { SwalService } from 'src/app/services/swal.service';
import { PacientesService } from 'src/app/services/pacientes.service';
import { ElementPreguntonComponent } from '../element-pregunton/element-pregunton.component';

@Component({
  selector: 'app-lista-pregunton',
  standalone: true,
  imports: [CommonModule, FormsModule, ElementPreguntonComponent],
  templateUrl: './lista-pregunton.component.html',
  styleUrls: ['./lista-pregunton.component.scss']
})
export class ListaPreguntonComponent {
  preguntones: any[]=[];
  @ViewChild(FormComponent) formComponent!: FormComponent;

  constructor(private router: Router, private swalService: SwalService,private pacienteService:PacientesService) {}

  ngOnInit() {
    this.pacienteService.preguntone$.subscribe((pregunton:any[])=>{
      this.preguntones=pregunton;
      console.log("Preguntones desde el subscribe: ", this.preguntones);
    })
    this.pacienteService.obtenerPreguntones();
    console.log(this.preguntones);
  }


  // eliminarPaciente(paciente: any) {
  //   console.log("Entro a eliminar al paciente: ", paciente.nombre)
  //   const pacientesGuardados = localStorage.getItem('pacientes');
  //   if (pacientesGuardados) {
  //     this.pacientes = JSON.parse(pacientesGuardados);
  //     const pacientesActualizados = this.pacientes.filter(p => p.nombre !== paciente.nombre);
  //     localStorage.setItem('pacientes', JSON.stringify(pacientesActualizados));
  //     this.swalService.success('Paciente eliminado correctamente');
  //   }
  // }

  // editarPaciente(paciente: any) {
  //   this.formComponent.editarPacienteDesdeLista(paciente);
  // }

}

