import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as moment from 'moment';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { CalendarioService } from 'src/app/services/calendario.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-bloqueo-sucursal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './bloqueo-sucursal.component.html',
  styleUrls: ['./bloqueo-sucursal.component.scss']
})
export class BloqueoSucursalComponent implements OnInit {
  @Input() sucursalId?: string; // Si se pasa, se preselecciona y se oculta el selector
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() bloqueoCreado = new EventEmitter<any>();

  bloqueoForm: FormGroup;
  sucursales: any[] = [];
  cargando = false;
  mensajeError = '';
  fechaMinima = moment().format('YYYY-MM-DD');
  usuario: any;

  constructor(
    private fb: FormBuilder,
    private sucursalesService: SucursalesService,
    private calendarioService: CalendarioService,
    private loginService: LoginService
  ) {
    this.bloqueoForm = this.fb.group({
      sucursalId: ['', Validators.required],
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      tipo: ['general'],
      motivo: ['']
    });
  }

  ngOnInit(): void {
    this.usuario = this.loginService.obtenerUsuario();
    this.cargarSucursales();

    // Si recibimos sucursalId, lo seteamos y deshabilitamos el campo
    if (this.sucursalId) {
      this.bloqueoForm.patchValue({ sucursalId: this.sucursalId });
      this.bloqueoForm.get('sucursalId')?.disable();
    }

    // Validación básica: horaFin > horaInicio
    this.bloqueoForm.get('horaFin')?.valueChanges.subscribe(() => {
      this.validarHoras();
    });
    this.bloqueoForm.get('horaInicio')?.valueChanges.subscribe(() => {
      this.validarHoras();
    });
  }

  cargarSucursales() {
    this.sucursalesService.obtenerSucursales().subscribe({
      next: (res) => this.sucursales = res.data || [],
      error: (err) => console.error('Error al cargar sucursales', err)
    });
  }

  validarHoras() {
    const inicio = this.bloqueoForm.get('horaInicio')?.value;
    const fin = this.bloqueoForm.get('horaFin')?.value;
    if (inicio && fin && fin <= inicio) {
      this.bloqueoForm.get('horaFin')?.setErrors({ horaInvalida: true });
    } else {
      const errors = this.bloqueoForm.get('horaFin')?.errors;
      if (errors) {
        delete errors['horaInvalida'];
        if (Object.keys(errors).length === 0) {
          this.bloqueoForm.get('horaFin')?.setErrors(null);
        }
      }
    }
  }

  crearBloqueo() {
    if (this.bloqueoForm.invalid) return;

    this.cargando = true;
    this.mensajeError = '';

    // Obtener valores (si sucursalId está deshabilitado, usamos el valor original)
    const formValue = this.bloqueoForm.getRawValue(); // getRawValue incluye campos deshabilitados
    const payload = {
      ...formValue,
      creadoPorId: this.usuario.id,
      creadoPorNombre: this.usuario.usuario
    };

    this.calendarioService.crearBloqueo(payload).subscribe({
      next: (res) => {
        this.cargando = false;
        this.bloqueoCreado.emit(res.bloqueo);
        this.cerrar();
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.error || 'Error al crear el bloqueo. Intenta de nuevo.';
        console.error(err);
      }
    });
  }

  cerrar() {
    this.cerrarModal.emit();
  }
}