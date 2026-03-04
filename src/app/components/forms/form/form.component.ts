import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { SwalService } from 'src/app/services/swal.service';


@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent {
  pacientes: Array<any> = [];

  isModalVisible: boolean = false; // Controla la visibilidad del modal
  esEdicion: boolean = false;
  pacienteEdicion: number | null = null;

  // Modelo para un nuevo paciente
  nuevoPaciente = {
    nombre: '',
    fechaNacimiento: '',
    telefono: '',
    correo: '',
    direccion: '',
    condicionesMedicas: '',
    alergias: '',
    cirugiasPrevias: '',
    seguroDental: false,
    peso: null,
    altura: null,
    tensionArterial: false,
  };

  constructor(private swalService: SwalService) {} // Inyecta el servicio

  abrirModal() {
    this.isModalVisible = true; // Muestra el modal
  }

  cerrarModal() {
    this.isModalVisible = false; // Oculta el modal
    this.limpiarFormulario();
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  agregarPaciente() {
    if (this.nuevoPaciente.nombre && this.nuevoPaciente.fechaNacimiento && this.nuevoPaciente.telefono) {
      const edad = this.calcularEdad(this.nuevoPaciente.fechaNacimiento);

      if(this.esEdicion && this.pacienteEdicion !== null) {
        console.log("Entro en EDICION")
        this.pacientes[this.pacienteEdicion] = {
          ...this.nuevoPaciente,
          edad,
        };
        this.swalService.success('Paciente actualizado correctamente');
      } else {
        const pacienteConEdad = { ...this.nuevoPaciente, edad };
        this.pacientes.push(pacienteConEdad);
        this.swalService.success('Paciente registrado correctamente');
      }
      
      localStorage.setItem('pacientes', JSON.stringify(this.pacientes));

      this.cerrarModal(); // Cierra el modal después de registrar
    } else {
      this.swalService.errorCampos('Debes completar todos los campos.');
    }
  }

  editarPacienteDesdeLista(paciente: any) {
    this.nuevoPaciente = { ...paciente }; // Carga los datos del paciente en el formulario
    this.esEdicion = true;
    this.pacienteEdicion = this.pacientes.findIndex (
      (p) =>
        p.nombre === paciente.nombre &&
        p.fechaNacimiento === paciente.fechaNacimiento
    );
    console.log("esEdicion: ",this.esEdicion)
    console.log("pacienteEdicion: ",this.pacienteEdicion)
    this.abrirModal();
  }

  limpiarFormulario() {
    this.nuevoPaciente = {
      nombre: '',
      fechaNacimiento: '',
      telefono: '',
      correo: '',
      direccion: '',
      condicionesMedicas: '',
      alergias: '',
      cirugiasPrevias: '',
      seguroDental: false,
      peso: null,
      altura: null,
      tensionArterial: false,
    };
    this.esEdicion = false;
    console.log("esEdicion: ",this.esEdicion)
    this.pacienteEdicion = null;
  }

  cargarPacientes() {
    const pacientesGuardados = localStorage.getItem('pacientes');
    if (pacientesGuardados) {
      this.pacientes = JSON.parse(pacientesGuardados);
    }
  }

  ngOnInit() {
    this.cargarPacientes();
  }
}
