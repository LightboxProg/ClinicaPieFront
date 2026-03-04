import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { SwalService } from 'src/app/services/swal.service';

@Component({
  selector: 'app-form-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './form-doctor.component.html',
  styleUrls: ['./form-doctor.component.scss']
})
export class FormDoctorComponent {
  doctores: Array<any> = [];

  isModalVisible: boolean = false; // Controla la visibilidad del modal
  esEdicion: boolean = false;
  doctorEdicion: number | null = null;

  // Modelo para un nuevo doctor

  nuevoDoctor = {
    nombre: '',
    edad: '',
    telefono: '',
    correo: '',
    especialidad: ''
  };

  constructor(private swalService: SwalService) {} // Inyecta el servicio

  abrirModal() {
    this.isModalVisible = true; // Muestra el modal
  }

  cerrarModal() {
    this.isModalVisible = false; // Oculta el modal
    this.limpiarFormulario();
  }

  agregarDoctor() {
    if (this.nuevoDoctor.nombre && this.nuevoDoctor.edad && this.nuevoDoctor.telefono) {

      if(this.esEdicion && this.doctorEdicion !== null) {
        console.log("Entro en EDICION")
        this.doctores[this.doctorEdicion] = {
          ...this.nuevoDoctor
        };
        this.swalService.success('Doctor actualizado correctamente');
      } else {
        const doctor = { ...this.nuevoDoctor };
        this.doctores.push(doctor);
        this.swalService.success('Doctor registrado correctamente');
      }
      
      localStorage.setItem('dotores', JSON.stringify(this.doctores));

      this.cerrarModal(); // Cierra el modal después de registrar
    } else {
      this.swalService.errorCampos('Debes completar todos los campos.');
    }
  }

  editarDoctorDesdeLista(doctor: any) {
    this.nuevoDoctor = { ...doctor }; // Carga los datos del doctor en el formulario
    this.esEdicion = true;
    this.doctorEdicion = this.doctores.findIndex (
      (p) =>
        p.nombre === doctor.nombre &&
        p.telefono === doctor.telefono
    );
    console.log("esEdicion: ",this.esEdicion)
    console.log("doctorEdicion: ",this.doctorEdicion)
    this.abrirModal();
  }

  limpiarFormulario() {
    this.nuevoDoctor = {
      nombre: '',
      edad: '',
      telefono: '',
      correo: '',
      especialidad: ''
    };
    this.esEdicion = false;
    console.log("esEdicion: ",this.esEdicion)
    this.doctorEdicion = null;
  }

  cargarDoctores() {
    const doctoresGuardados = localStorage.getItem('dotores');
    if (doctoresGuardados) {
      this.doctores = JSON.parse(doctoresGuardados);
    }
  }

  ngOnInit() {
    this.cargarDoctores();
  }
}
