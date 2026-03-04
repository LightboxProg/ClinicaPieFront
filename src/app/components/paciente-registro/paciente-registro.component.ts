import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { PacientesService } from 'src/app/services/pacientes.service';
import { getCountryCallingCode, getCountries } from 'libphonenumber-js';
import { SwalService } from 'src/app/services/swal.service';


@Component({
  selector: 'app-paciente-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente-registro.component.html',
  styleUrls: ['./paciente-registro.component.scss']
})
export class PacienteRegistroComponent {
  registerForm!: FormGroup;
  countries: { name: string; dialCode: string; code: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private pacientesService: PacientesService,
    private swalService: SwalService
  ) {
    this.loadCountries();
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apeP: ['', [Validators.required, Validators.minLength(2)]],
      apeM: ['', [Validators.required, Validators.minLength(2)]],
      apodo: ['', [Validators.required, Validators.minLength(2)]],
      nombreReferido: [''],
      correoElectronico: ['', [Validators.required, Validators.email]],
      codigoPais: ['+52'],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      genero: ['', [Validators.required]],
      fechaNac: ['', [Validators.required, this.validateFechaNacimiento]],
      direccion: ['', [Validators.minLength(5)]],
    });
  }

  // Getter para facilitar el acceso a los controles
  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }

  // Método para validar la fecha de nacimiento
  validateFechaNacimiento(control: AbstractControl): { [key: string]: boolean } | null {
    const fechaNac = new Date(control.value);
    const hoy = new Date();

    if (fechaNac > hoy) {
      return { 'futureDate': true };
    }

    // Calcular edad
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (edad < 0) {
      return { 'invalidAge': true };
    }

    if (edad > 120) {
      return { 'tooOld': true };
    }

    return null;
  }

  loadCountries() {
    const countryCodes = getCountries();
    this.countries = countryCodes.map(code => {
      return {
        code: code,
        name: new Intl.DisplayNames(['es'], { type: 'region' }).of(code) || code,
        dialCode: `+${getCountryCallingCode(code)}`
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  updatePhonePattern(event: any) {
    const countryCode = event.target.value;
    let phonePattern: RegExp;

    switch (countryCode) {
      case '+52': case '+1':
        phonePattern = /^[0-9]{10}$/;
        break;
      case '+34':
        phonePattern = /^[0-9]{9}$/;
        break;
      default:
        phonePattern = /^[0-9]{7,15}$/;
        break;
    }

    this.registerForm.get('telefono')?.setValidators([
      Validators.required,
      Validators.pattern(phonePattern)
    ]);
    this.registerForm.get('telefono')?.updateValueAndValidity();
  }

  // Método para verificar si el formulario es válido
  isFormValid(): boolean {
    return this.registerForm.valid;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      this.registerForm.markAllAsTouched();
      this.swalService.error('Por favor, complete todos los campos obligatorios correctamente');
      return;
    }

    const form = this.registerForm.value;
    const telefonoCompleto = form.codigoPais + form.telefono;

    const nuevoPaciente = {
      nombre: form.nombre,
      apeP: form.apeP,
      apeM: form.apeM,
      apodo: form.apodo,
      nombreReferido: form.nombreReferido,
      telefonoPaciente: telefonoCompleto,
      telefonoWhatsapp: telefonoCompleto,
      correoElectronico: form.correoElectronico,
      genero: form.genero,
      fechaNac: form.fechaNac,
      direccion: form.direccion,
      enListaNegra: false
    };

    this.pacientesService.crearPaciente(nuevoPaciente).subscribe({
      next: () => {
        console.log('Paciente registrado con éxito.');
        this.swalService.success('Paciente registrado con éxito');
        this.registerForm.reset();
        this.registerForm.get('codigoPais')?.setValue('+52');
        this.registerForm.markAsUntouched();
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        this.swalService.error('Error al registrar paciente', err.message || 'Ocurrió un error');
      }
    });
  }

  
}

