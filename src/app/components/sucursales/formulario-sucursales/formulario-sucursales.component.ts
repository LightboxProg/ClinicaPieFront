import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { SwalService } from 'src/app/services/swal.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-formulario-sucursales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './formulario-sucursales.component.html',
  styleUrls: ['./formulario-sucursales.component.scss']
})
export class FormularioSucursalesComponent implements OnInit {
  sucursalForm: FormGroup;
  diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

  // Variables para la herramienta de llenado rápido
  genApertura: string = '09:00';
  genCierre: string = '18:00';

  // Modo edición
  modoEdicion: boolean = false;
  sucursalId: string | null = null;
  cargandoDatos: boolean = false;

  constructor(
    private fb: FormBuilder,
    private sucursalesService: SucursalesService,
    private swalService: SwalService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.sucursalForm = this.fb.group({
      nombre:  ['', [Validators.required]],
      urlMapa: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      email:    ['', [Validators.email]],
      direccion: this.fb.group({
        calle:        ['', Validators.required],
        numero:       ['', Validators.required],
        colonia:      [''],
        ciudad:       ['', Validators.required],
        estado:       [''],
        codigoPostal: ['']
      }),
      horarios: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.inicializarSemana();

    // Detectar si hay un :id en la URL → modo edición
    this.sucursalId = this.route.snapshot.paramMap.get('id');
    if (this.sucursalId) {
      this.modoEdicion = true;
      this.cargarDatosSucursal(this.sucursalId);
    }
  }

  // ——— Carga de datos para edición ———
  cargarDatosSucursal(id: string) {
    this.cargandoDatos = true;
    this.sucursalesService.obtenerSucursalPorId(id).subscribe({
      next: (res: any) => {
        const suc = res.data;

        // Rellenar campos básicos
        this.sucursalForm.patchValue({
          nombre:   suc.nombre,
          urlMapa:  suc.urlMapa,
          telefono: suc.telefono,
          email:    suc.email || '',
          direccion: {
            calle:        suc.direccion?.calle        || '',
            numero:       suc.direccion?.numero       || '',
            colonia:      suc.direccion?.colonia      || '',
            ciudad:       suc.direccion?.ciudad       || '',
            estado:       suc.direccion?.estado       || '',
            codigoPostal: suc.direccion?.codigoPostal || ''
          }
        });

        // Rellenar horarios si existen
        if (suc.horarios && suc.horarios.length > 0) {
          this.horariosArr.clear();
          suc.horarios.forEach((h: any) => {
            this.horariosArr.push(this.crearGrupoDia(
              h.dia,
              h.apertura || '09:00',
              h.cierre   || '18:00',
              h.cerrado  || false,
              h.tieneDescanso || false,
              h.descansoInicio || '',
              h.descansoFin    || ''
            ));
          });
        }

        this.cargandoDatos = false;
      },
      error: (err) => {
        console.error(err);
        this.swalService.error('Error', 'No se pudo cargar la sucursal');
        this.cargandoDatos = false;
        this.router.navigate(['/sucursales-lista']);
      }
    });
  }

  get horariosArr() {
    return this.sucursalForm.get('horarios') as FormArray;
  }

  inicializarSemana() {
    this.horariosArr.clear();
    this.diasSemana.forEach(dia => {
      this.horariosArr.push(this.crearGrupoDia(dia, '09:00', '18:00'));
    });
  }

  generarHorarioSemanal() {
    this.horariosArr.controls.forEach(control => {
      control.patchValue({
        apertura: this.genApertura,
        cierre: this.genCierre,
        cerrado: false,
        tieneDescanso: false
      });
    });
    this.swalService.success('Horario aplicado a toda la semana');
  }

  agregarDia() {
    this.horariosArr.push(this.crearGrupoDia('Extra', this.genApertura, this.genCierre));
  }

  crearGrupoDia(
    dia: string,
    apertura: string,
    cierre: string,
    cerrado: boolean = false,
    tieneDescanso: boolean = false,
    descansoInicio: string = '',
    descansoFin: string = ''
  ): FormGroup {
    const horarioGroup = this.fb.group({
      dia:            [dia],
      apertura:       [apertura, Validators.required],
      cierre:         [cierre,   Validators.required],
      cerrado:        [cerrado],
      tieneDescanso:  [tieneDescanso],
      descansoInicio: [descansoInicio],
      descansoFin:    [descansoFin]
    });

    horarioGroup.get('cerrado')?.valueChanges.subscribe((val: any) => {
      const cerr = !!val;
      const inputs = ['apertura', 'cierre', 'descansoInicio', 'descansoFin'];
      if (cerr) {
        inputs.forEach(k => horarioGroup.get(k)?.clearValidators());
        horarioGroup.get('tieneDescanso')?.setValue(false, { emitEvent: false });
      } else {
        horarioGroup.get('apertura')?.setValidators(Validators.required);
        horarioGroup.get('cierre')?.setValidators(Validators.required);
      }
      inputs.forEach(k => horarioGroup.get(k)?.updateValueAndValidity());
    });

    horarioGroup.get('tieneDescanso')?.valueChanges.subscribe((val: any) => {
      const tiene = !!val;
      const inicio = horarioGroup.get('descansoInicio');
      const fin    = horarioGroup.get('descansoFin');
      if (tiene) {
        inicio?.setValidators(Validators.required);
        fin?.setValidators(Validators.required);
      } else {
        inicio?.clearValidators();
        fin?.clearValidators();
        inicio?.setValue('');
        fin?.setValue('');
      }
      inicio?.updateValueAndValidity();
      fin?.updateValueAndValidity();
    });

    return horarioGroup;
  }

  onSubmit() {
    if (this.sucursalForm.invalid) {
      this.sucursalForm.markAllAsTouched();
      this.swalService.errorCampos('Revisa los campos obligatorios');
      return;
    }

    if (this.modoEdicion && this.sucursalId) {
      // ——— Actualizar sucursal existente ———
      this.sucursalesService.actualizarSucursal(this.sucursalId, this.sucursalForm.value).subscribe({
        next: () => {
          this.swalService.success('Sucursal actualizada correctamente');
          this.router.navigate(['/sucursales-lista']);
        },
        error: (e) => this.swalService.error('Error', e.error?.message)
      });
    } else {
      // ——— Crear nueva sucursal ———
      this.sucursalesService.crearSucursal(this.sucursalForm.value).subscribe({
        next: () => {
          this.swalService.success('Sucursal creada correctamente');
          this.sucursalForm.reset();
          this.inicializarSemana();
        },
        error: (e) => this.swalService.error('Error', e.error?.message)
      });
    }
  }

  cancelar() {
    this.router.navigate(['/sucursales-lista']);
  }
}