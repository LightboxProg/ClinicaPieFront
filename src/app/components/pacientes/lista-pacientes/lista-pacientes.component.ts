import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ElementPacienteComponent } from '../element-paciente/element-paciente.component';
import { FormComponent } from '../../forms/form/form.component';
import { SwalService } from 'src/app/services/swal.service';
import { PacientesService } from 'src/app/services/pacientes.service';

@Component({
  selector: 'app-lista-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ElementPacienteComponent],
  templateUrl: './lista-pacientes.component.html',
  styleUrls: ['./lista-pacientes.component.scss']
})
export class ListaPacientesComponent {
  pacientes: any[]=[];
  @ViewChild(FormComponent) formComponent!: FormComponent;

  constructor(private router: Router, private swalService: SwalService,private pacienteService:PacientesService) {}


  ngOnInit() {
    this.pacienteService.paciente$.subscribe((pacientes:any[])=>{
      this.pacientes=pacientes;
    })
    this.pacienteService.obtenerPacientes();
  }



  cargarPacientes() {
    const pacientesGuardados = localStorage.getItem('pacientes');
    if (pacientesGuardados) {
      this.pacientes = JSON.parse(pacientesGuardados);
    }
  }

  eliminarPaciente(paciente: any) {
    console.log("Entro a eliminar al paciente: ", paciente.nombre)
    const pacientesGuardados = localStorage.getItem('pacientes');
    if (pacientesGuardados) {
      this.pacientes = JSON.parse(pacientesGuardados);
      const pacientesActualizados = this.pacientes.filter(p => p.nombre !== paciente.nombre);
      localStorage.setItem('pacientes', JSON.stringify(pacientesActualizados));
      this.swalService.success('Paciente eliminado correctamente');
    }
  }

  editarPaciente(paciente: any) {
    this.formComponent.editarPacienteDesdeLista(paciente);
  }
}
