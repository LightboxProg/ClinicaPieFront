import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SwalService } from 'src/app/services/swal.service';
import { SucursalesService } from 'src/app/services/sucursales.service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.scss'],
})
export class UserRegisterComponent implements OnInit {
  registerForm: FormGroup;
  sucursalesList: any[] = []; // Array para guardar las sucursales

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private http: HttpClient, // Necesitamos HTTP para cargar sucursales
    private router: Router,
    private swalService: SwalService,
    private sucursalesService: SucursalesService,
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apeM: ['', Validators.required],
      apeP: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/)]],
      tipo: ['', [Validators.required]],
      especialidad: [''],
      sucursal: [''],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    });

    this.registerForm.get('tipo')?.valueChanges.subscribe(tipo => {
      const sucursalControl = this.registerForm.get('sucursal');
      const especialidadControl = this.registerForm.get('especialidad');

      // Validación de sucursal
      if (tipo === 'Administrador') {
        sucursalControl?.clearValidators();
        sucursalControl?.setValue('');
      } else {
        sucursalControl?.setValidators([Validators.required]);
      }
      sucursalControl?.updateValueAndValidity();

      // Validación de especialidad
      if (tipo === 'Doctor') {
        especialidadControl?.setValidators([Validators.required]);
      } else {
        especialidadControl?.clearValidators();
        especialidadControl?.setValue('');
      }
      especialidadControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.cargarSucursales();
  }

  // Cargar sucursales desde tu API
  cargarSucursales() {
    this.sucursalesService.obtenerSucursales().subscribe({
      next: (res) => {
        // Verificamos si la respuesta fue exitosa según tu backend
        if (res.status === 'success') {
          this.sucursalesList = res.data;
        }
      },
      error: (err) => {
        console.error('Error cargando sucursales:', err);
        // Usamos tu servicio de alertas para avisar si falla
        this.swalService.error('No se pudieron cargar las sucursales', 'Error de conexión');
      }
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }

  isFormValid(): boolean {
    return this.registerForm.valid;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.swalService.errorCampos('Por favor, complete todos los campos correctamente');
      return;
    }
    this.nuevoUsuario();
  }

  nuevoUsuario(): void {
    const userData = { ...this.registerForm.value };

    if (userData.tipo !== 'Doctor') {
      delete userData.especialidad;
    }

    if (userData.tipo === 'Administrador') {
      delete userData.sucursal;
    }

    console.log('Datos enviados:', userData);

    // Guardar en LocalStorage (Opcional según tu lógica)
    const usuariosGuardados = localStorage.getItem('usuarios');
    const usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
    usuarios.push(userData);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Enviar al servidor
    this.userService.addUser(userData).subscribe({
      next: (response) => {
        this.swalService.success('Usuario registrado con éxito');
        this.registerForm.reset();
        this.registerForm.markAsUntouched();
        // Recargar sucursales por si acaso o redirigir
      },
      error: (error) => {
        console.error('Error:', error);
        const msg = error.error?.message || 'Error al registrar el usuario';
        this.swalService.error(msg, 'Registro fallido');
      },
    });
  }


}
