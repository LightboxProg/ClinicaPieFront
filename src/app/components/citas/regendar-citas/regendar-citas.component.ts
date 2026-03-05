import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CalendarioService } from 'src/app/services/calendario.service';
import * as moment from 'moment';

@Component({
  selector: 'app-regendar-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './regendar-citas.component.html',
  styleUrls: ['./regendar-citas.component.scss']
})
export class RegendarCitasComponent implements OnInit {

  @Input() citaOriginal: any = null; 
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() citaReagendada = new EventEmitter<any>();

  reagendarForm: FormGroup;
  cargando = false;
  doctores: any[] = []; 
  
  duracionMinutosOriginal: number = 30; 
  mensajeError: string = '';

  // NUEVAS VARIABLES PARA BLOQUEOS
  fechaMinima: string = ''; // Para no dejar seleccionar días en el pasado
  horariosDisponibles: string[] = []; // Para llenar la lista desplegable de horas

  mapaHorarioDoctor: any = {}; 
  errorHorarioEnVivo: string = '';
  turnosDelDiaSeleccionado: any[] = [];

  constructor(
    private fb: FormBuilder,
    private calendarioService: CalendarioService
  ) {
    this.reagendarForm = this.fb.group({
      newDoctorId: ['', Validators.required],
      nuevaFecha: ['', Validators.required],
      nuevaHoraInicio: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // 1. Bloquear fechas en el pasado (Hoy es lo mínimo)
    this.fechaMinima = moment().format('YYYY-MM-DD');

    this.cargarDoctores();

    if (this.citaOriginal) {
      this.duracionMinutosOriginal = this.calcularDuracion(this.citaOriginal.horaInicio, this.citaOriginal.horaFin);
      const doctorActual = this.citaOriginal.doctorId || this.citaOriginal.oldDoctorId;

      this.reagendarForm.patchValue({
        newDoctorId: doctorActual,
        nuevaFecha: this.citaOriginal.fechaCita || '',
        nuevaHoraInicio: this.citaOriginal.horaInicio || ''
      });

      if (doctorActual) this.cargarHorarioDoctor(doctorActual);
    }

    // Escuchadores
    this.reagendarForm.get('newDoctorId')?.valueChanges.subscribe(doctorId => {
      if (doctorId) this.cargarHorarioDoctor(doctorId);
    });

    this.reagendarForm.get('nuevaFecha')?.valueChanges.subscribe(fecha => {
      this.validarDiaYGenerarHoras(fecha); // 🌟 Cambio de función
    });
  }

  cargarDoctores(): void {
    this.calendarioService.getDoctoresActivos().subscribe({
      next: (data) => this.doctores = data,
      error: (err) => console.error('Error al cargar especialistas:', err)
    });
  }

  cargarHorarioDoctor(doctorId: string): void {
    this.calendarioService.getHorarioSemanalDoctor(doctorId).subscribe({
      next: (res) => {
        this.mapaHorarioDoctor = res.horario || {};
        this.validarDiaYGenerarHoras(this.reagendarForm.get('nuevaFecha')?.value);
      },
      error: () => console.error('No se pudo cargar el mapa de horarios del doctor.')
    });
  }

  // Valida el día y construye la lista de horas
  validarDiaYGenerarHoras(fecha: string): void {
    this.errorHorarioEnVivo = '';
    this.turnosDelDiaSeleccionado = [];
    this.horariosDisponibles = []; // Limpiamos las horas anteriores

    // Si la recepcionista cambia de doctor, limpiamos la hora seleccionada
    this.reagendarForm.get('nuevaHoraInicio')?.setValue('');

    if (!fecha || Object.keys(this.mapaHorarioDoctor).length === 0) return;

    const numeroDia = moment(fecha, 'YYYY-MM-DD').day(); 
    const turnosDelDia = this.mapaHorarioDoctor[numeroDia];

    if (!turnosDelDia || turnosDelDia.length === 0) {
      this.errorHorarioEnVivo = '❌ El especialista NO labora en este día.';
      this.reagendarForm.get('nuevaHoraInicio')?.disable({ emitEvent: false }); 
    } else {
      this.turnosDelDiaSeleccionado = turnosDelDia;
      this.reagendarForm.get('nuevaHoraInicio')?.enable({ emitEvent: false });
      
      // Si el doctor SÍ trabaja, generamos los bloques de tiempo
      this.generarHorariosDisponibles();
    }
  }

  // Construye opciones cada 30 minutos respetando turnos y comida
  generarHorariosDisponibles(): void {
    this.turnosDelDiaSeleccionado.forEach(turno => {
      let horaActual = moment(turno.horaInicio, 'HH:mm');
      const horaFinTurno = moment(turno.horaFin, 'HH:mm');

      // Mientras la cita alcance a terminar antes de que acabe el turno
      while (horaActual.clone().add(this.duracionMinutosOriginal, 'minutes').isSameOrBefore(horaFinTurno)) {
        this.horariosDisponibles.push(horaActual.format('HH:mm'));
        
        // Saltos de 30 minutos (puedes cambiarlo a 15, 20, etc.)
        horaActual.add(30, 'minutes'); 
      }
    });

    // Si la cita original ya tenía una hora, intentamos auto-seleccionarla si es válida
    if (this.citaOriginal && this.horariosDisponibles.includes(this.citaOriginal.horaInicio)) {
      this.reagendarForm.get('nuevaHoraInicio')?.setValue(this.citaOriginal.horaInicio);
    }
  }

  calcularDuracion(inicio: string, fin: string): number {
    if (!inicio || !fin) return 30;
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }

  calcularNuevaHoraFin(horaInicio: string, duracionMinutos: number): string {
    const [h, m] = horaInicio.split(':').map(Number);
    const totalMinutos = h * 60 + m + duracionMinutos;
    const outH = Math.floor(totalMinutos / 60);
    const outM = totalMinutos % 60;
    return `${outH.toString().padStart(2, '0')}:${outM.toString().padStart(2, '0')}`;
  }

  guardarReagenda(): void {
    if (this.reagendarForm.invalid || this.errorHorarioEnVivo) return;
    
    this.cargando = true;
    this.mensajeError = ''; 

    const horaInicioElegida = this.reagendarForm.get('nuevaHoraInicio')?.value;
    const horaFinCalculada = this.calcularNuevaHoraFin(horaInicioElegida, this.duracionMinutosOriginal);

    const payload = {
      citaId: this.citaOriginal._id || this.citaOriginal.id, 
      tipoContacto: this.citaOriginal.tipoContacto || 'paciente', 
      oldDoctorId: this.citaOriginal.oldDoctorId,
      newDoctorId: this.reagendarForm.value.newDoctorId,
      nuevaFecha: this.reagendarForm.value.nuevaFecha,
      nuevaHoraInicio: horaInicioElegida,
      nuevaHoraFin: horaFinCalculada 
    };

    this.calendarioService.reagendarCita(payload).subscribe({
      next: (res) => {
        this.cargando = false;
        this.citaReagendada.emit(res);
        this.cerrar();
      },
      error: (err) => {
        console.error('Error al reagendar:', err);
        this.cargando = false;
        this.mensajeError = err.error?.error || 'Hubo un problema de conexión al intentar reagendar.';
      }
    });
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
}