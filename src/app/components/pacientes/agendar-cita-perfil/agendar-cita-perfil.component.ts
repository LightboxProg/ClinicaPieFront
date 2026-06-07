import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CalendarioService } from 'src/app/services/calendario.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-agendar-cita-perfil',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './agendar-cita-perfil.component.html',
  styleUrls: ['./agendar-cita-perfil.component.scss']
})
export class AgendarCitaPerfilComponent implements OnInit, OnChanges {

  @Input() paciente: any;
  @Input() serviciosContratados: any[] = [];

  @Output() cerrarModal = new EventEmitter<void>();
  @Output() citaAgendada = new EventEmitter<any>();

  citaForm: FormGroup;
  cargando = false;
  cargandoDisponibilidad = false;

  sucursales: any[] = [];
  doctoresDisponibles: any[] = [];
  servicios: any[] = [];

  diasLaborales: string[] = [];
  bloquesDisponibles: any[] = [];
  mensajeDisponibilidad: string = '';
  errorTiempo: string = '';

  itemsList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private calendarioService: CalendarioService,
    private serviciosService: ServiciosService,
    private sucursalesService: SucursalesService,
    private loginService: LoginService
  ) {
    this.citaForm = this.fb.group({
      telefono: ['', Validators.required],
      sucursalId: ['', Validators.required],
      doctorId: [{ value: '', disabled: true }, Validators.required],
      itemTipo: ['srv', Validators.required],
      itemId: ['', Validators.required],
      fechaCita: [{ value: '', disabled: true }, Validators.required],
      horaInicio: [{ value: '', disabled: true }, Validators.required],
      observaciones: ['']
    });
  }

  // Inicializa el formulario y activa los escuchadores de cambios
  ngOnInit(): void {
    if (this.paciente) {
      const tel = this.paciente.telefonoWhatsapp || this.paciente.telefonoPaciente || this.paciente.telefono || '';
      this.citaForm.patchValue({ telefono: tel });
    }

    this.cargarCatalogosBasicos();
    this.escucharCambiosFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['serviciosContratados'] && this.citaForm.get('itemTipo')?.value === 'prom') {
      this.itemsList = this.serviciosContratadosActivos;
    }
  }

  get serviciosContratadosActivos(): any[] {
    return (this.serviciosContratados || []).filter(s => s.sesionesRestantes > 0);
  }

  // Carga catalogos principales de servicios, promociones y sucursales
  cargarCatalogosBasicos(): void {
    this.sucursalesService.obtenerSucursales().subscribe({
      next: (res) => this.sucursales = res.data || res,
      error: (err) => console.error(err)
    });

    this.serviciosService.obtenerServiciosIndividuales().subscribe({
      next: (res) => {
        this.servicios = res.data || res;
        // Inicializar itemsList con servicios individuales (por defecto)
        this.itemsList = this.servicios;
      },
      error: (err) => console.error(err)
    });

    // this.promocionService.obtenerPromociones({ vigente: true, activa: true }).subscribe({
    //   next: (res) => this.promociones = res.data,
    //   error: (err) => console.error(err)
    // });
  }

  // Vincula los cambios de seleccion con las validaciones dinamicas
  escucharCambiosFormulario(): void {
    this.citaForm.get('sucursalId')?.valueChanges.subscribe(sucursalId => {
      this.citaForm.patchValue({ doctorId: '', fechaCita: '', horaInicio: '' });
      this.citaForm.get('fechaCita')?.disable();
      this.citaForm.get('horaInicio')?.disable();

      if (sucursalId) {
        this.cargarDoctoresPorSucursal(sucursalId);
      } else {
        this.citaForm.get('doctorId')?.disable();
        this.doctoresDisponibles = [];
      }
    });

    this.citaForm.get('doctorId')?.valueChanges.subscribe(doctorId => {
      this.citaForm.patchValue({ fechaCita: '', horaInicio: '' });
      this.bloquesDisponibles = [];

      if (doctorId) {
        this.cargarHorarioBaseDoctor(doctorId);
      } else {
        this.citaForm.get('fechaCita')?.disable();
        this.citaForm.get('horaInicio')?.disable();
      }
    });

    this.citaForm.get('fechaCita')?.valueChanges.subscribe(fecha => {
      this.citaForm.patchValue({ horaInicio: '' });

      if (fecha && this.citaForm.get('doctorId')?.value) {
        this.consultarDisponibilidadExacta(this.citaForm.get('doctorId')?.value, fecha);
      } else {
        this.citaForm.get('horaInicio')?.disable();
        this.bloquesDisponibles = [];
      }
    });

    this.citaForm.get('itemTipo')?.valueChanges.subscribe(tipo => {
      this.citaForm.get('itemId')?.setValue('');
      if (tipo === 'srv') {
        this.itemsList = this.servicios;
      } else if (tipo === 'prom') {
        this.itemsList = this.serviciosContratadosActivos;
      }
      this.validarAjusteTiempo();
    });

    this.citaForm.get('itemId')?.valueChanges.subscribe(() => {
      this.validarAjusteTiempo();
    });

    this.citaForm.get('horaInicio')?.valueChanges.subscribe(() => {
      this.validarAjusteTiempo();
    });
  }

  // Utiliza el LoginService para cargar los doctores asignados a la sucursal
  cargarDoctoresPorSucursal(sucursalId: string): void {
    this.loginService.obtenerDoctoresPorSucursal(sucursalId).subscribe({
      next: (res) => {
        this.doctoresDisponibles = res.data || res;
        this.citaForm.get('doctorId')?.enable();
      },
      error: (err) => {
        console.error(err);
        this.citaForm.get('doctorId')?.disable();
      }
    });
  }

  // Trae configuracion base de dias de trabajo del especialista
  cargarHorarioBaseDoctor(doctorId: string): void {
    this.calendarioService.getHorarioSemanalDoctor(doctorId).subscribe({
      next: (res) => {
        if (res.success && res.horario) {
          this.diasLaborales = Object.keys(res.horario);
          this.citaForm.get('fechaCita')?.enable();
        }
      },
      error: (err) => console.error(err)
    });
  }

  // Valida dia de la semana e interrumpe el flujo si es dia inhabil
  validarDiaLaboral(): boolean {
    const fechaSeleccionada = this.citaForm.get('fechaCita')?.value;
    if (!fechaSeleccionada || this.diasLaborales.length === 0) return true;

    const partes = fechaSeleccionada.split('-');
    const dateObj = new Date(partes[0], partes[1] - 1, partes[2]);
    const diaSemana = dateObj.getDay().toString();

    if (!this.diasLaborales.includes(diaSemana)) {
      this.mensajeDisponibilidad = 'El especialista no labora en el dia seleccionado. Elige otro.';
      this.bloquesDisponibles = [];
      this.citaForm.get('horaInicio')?.disable();

      this.citaForm.patchValue({ fechaCita: '' }, { emitEvent: false });
      return false;
    }
    return true;
  }

  // Consulta API de bloques libres segun el dia seleccionado
  consultarDisponibilidadExacta(doctorId: string, fecha: string): void {
    if (!this.validarDiaLaboral()) return;

    this.cargandoDisponibilidad = true;
    this.mensajeDisponibilidad = '';
    this.bloquesDisponibles = [];

    this.calendarioService.getDisponibilidadDoctor(doctorId, fecha).subscribe({
      next: (res) => {
        this.cargandoDisponibilidad = false;
        if (res.bloques) {
          this.bloquesDisponibles = res.bloques.filter((b: any) => b.estado === 'disponible');

          if (this.bloquesDisponibles.length > 0) {
            this.citaForm.get('horaInicio')?.enable();
          } else {
            this.citaForm.get('horaInicio')?.disable();
            this.mensajeDisponibilidad = 'Agenda llena o bloqueada para este dia.';
          }
        }
      },
      error: (err) => {
        this.cargandoDisponibilidad = false;
        console.error(err);
        this.mensajeDisponibilidad = 'Error al verificar la agenda.';
      }
    });
  }

  // Extrae duracion del tratamiento o sumatoria de promo en minutos
  obtenerDuracionTratamiento(): number {
    // const tipo = this.citaForm.get('itemTipo')?.value;
    // const itemId = this.citaForm.get('itemId')?.value;
    // if (!itemId) return 0;

    // if (tipo === 'srv') {
    //   const srv = this.servicios.find(s => s._id === itemId);
    //   return srv ? srv.duracion : 60;
    // } else if (tipo === 'prom') {
    //   const prom = this.promociones.find(p => p._id === itemId);
    //   if (!prom || !prom.servicios) return 60;
    //   return prom.servicios.reduce((total: number, s: any) => total + (s.servicio?.duracion || 60), 0);
    // }
    // return 60;

    const tipo = this.citaForm.get('itemTipo')?.value;
    const itemId = this.citaForm.get('itemId')?.value;
    if (!itemId) return 0;

    if (tipo === 'srv') {
      const srv = this.servicios.find(s => s._id === itemId);
      return srv ? srv.duracion : 60;
    } else if (tipo === 'prom') {
      const contratado = this.serviciosContratados.find(sc => sc._id === itemId);
      return contratado?.servicio?.duracion || 60;
    }
    return 60;

  }

  // Transforma formatos de tiempo legibles a formato numerico evaluable
  convertirHoraAMinutos(horaLegible: string): number {
    if (horaLegible.includes('AM') || horaLegible.includes('PM')) {
      const [horaMin, ampm] = horaLegible.split(' ');
      let [h, m] = horaMin.split(':').map(Number);
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    } else {
      const [h, m] = horaLegible.split(':').map(Number);
      return h * 60 + m;
    }
  }

  // Analiza si el bloque de tiempo seleccionado soporta la extension del servicio
  validarAjusteTiempo(): void {
    this.errorTiempo = '';
    const horaStr = this.citaForm.get('horaInicio')?.value;

    if (!horaStr || this.bloquesDisponibles.length === 0 || !this.citaForm.get('itemId')?.value) {
      this.citaForm.get('horaInicio')?.setErrors(null);
      return;
    }

    const duracion = this.obtenerDuracionTratamiento();
    const inicioElegidoMin = this.convertirHoraAMinutos(horaStr);
    const finElegidoMin = inicioElegidoMin + duracion;

    const cabeEnBloque = this.bloquesDisponibles.some(bloque => {
      const inicioBloqueMin = this.convertirHoraAMinutos(bloque.inicio);
      const finBloqueMin = this.convertirHoraAMinutos(bloque.fin);
      return inicioElegidoMin >= inicioBloqueMin && finElegidoMin <= finBloqueMin;
    });

    if (!cabeEnBloque) {
      this.errorTiempo = `El tratamiento requiere ${duracion} min y excederia el limite del bloque libre.`;
      this.citaForm.get('horaInicio')?.setErrors({ fueraDeRango: true });
    } else {
      this.citaForm.get('horaInicio')?.setErrors(null);
    }
  }

  // Prepara payload e invoca guardado hacia el backend
  guardarCita(): void {
    if (this.citaForm.invalid) return;
    this.cargando = true;

    const raw = this.citaForm.getRawValue();
    const payload = {
      telefono: raw.telefono,
      sucursalId: raw.sucursalId,
      doctorId: raw.doctorId,
      fechaCita: raw.fechaCita,
      horaInicio: raw.horaInicio,
      observaciones: raw.observaciones,
      itemTipo: raw.itemTipo,
      itemId: raw.itemId
    };

    this.calendarioService.agendarCita(payload).subscribe({
      next: (res) => {
        this.cargando = false;
        this.citaAgendada.emit(res);
        this.cerrar();
      },
      error: (err) => {
        console.error(err);
        alert('Error: ' + (err.error?.error || 'Error al guardar'));
        this.cargando = false;
      }
    });
  }

  // Devuelve fecha actual en formato texto
  hoy(): Date {
    return new Date();
  }
  // Cierra el componente interactivo
  cerrar(): void {
    this.cerrarModal.emit();
  }

  filtroDiasLaborales = (d: Date | null): boolean => {

    if (!d) return false;
    const diaDeLaSemanaStr = d.getDay().toString();
    return this.diasLaborales.includes(diaDeLaSemanaStr);
  };

}