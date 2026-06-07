import { Component, Input, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CalendarioService } from 'src/app/services/calendario.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { PacientesService } from 'src/app/services/pacientes.service';
import { ServicioContratadoService } from 'src/app/services/servicio-contratado.service';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './agendar-cita.component.html',
  styleUrls: ['./agendar-cita.component.scss']
})
export class AgendarCitaComponent implements OnInit {

  @Input() datosPreconfigurados: any = { doctorId: '', fechaCita: '', horaInicio: '', telefono: '' };

  @Output() cerrarModal = new EventEmitter<void>();
  @Output() citaAgendada = new EventEmitter<any>();

  citaForm: FormGroup;
  cargando = false;

  servicios: any[] = [];
  serviciosContratadosPaciente: any[] = [];

  itemsList: any[] = [];

  todosLosContactos: any[] = [];
  contactosFiltrados: any[] = [];
  terminoBusqueda: string = '';

  todosLosPacientes: any[] = [];
  todosLosPreguntones: any[] = [];

  personaEncontrada: any = null;
  tipoContacto: 'paciente' | 'pregunton' | 'nuevo' = 'nuevo';

  horaMinimaPermitida: string = '';
  horaMaximaPermitida: string = '';
  doctoresDisponibles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private calendarioService: CalendarioService,
    private serviciosService: ServiciosService,
    private pacientesService: PacientesService,
    private servicioContratadoService: ServicioContratadoService,
    private cdr: ChangeDetectorRef
  ) {
    this.citaForm = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
      nombre: [''],
      apeP: [''],
      doctorId: ['', Validators.required],
      itemTipo: ['srv', Validators.required],
      itemId: ['', Validators.required],
      fechaCita: ['', Validators.required],
      horaInicio: ['', Validators.required],
      observaciones: [''],
      pago: [0, [Validators.min(0)]]
    });
  }

  // Inicializa el componente, asigna valores predeterminados y bloquea campos si es necesario
  ngOnInit(): void {
    if (this.datosPreconfigurados) {
      this.citaForm.patchValue(this.datosPreconfigurados);
      this.horaMinimaPermitida = this.datosPreconfigurados.limiteMinimo;
      this.horaMaximaPermitida = this.datosPreconfigurados.limiteMaximo;

      if (this.datosPreconfigurados.doctoresDisponibles) {
        this.doctoresDisponibles = this.datosPreconfigurados.doctoresDisponibles;

        if (this.doctoresDisponibles.length === 1) {
          this.citaForm.get('doctorId')?.disable();
        }
      }
    }

    this.cargarCatalogos();
    this.cargarPacientesYEscuchar();

    this.citaForm.get('itemTipo')?.valueChanges.subscribe(tipo => {
      this.citaForm.get('itemId')?.setValue('');
      this.actualizarItemsListPorTipo();
    });
  }

  // Obtiene la lista de servicios y promociones disponibles desde el backend
  cargarCatalogos(): void {
    this.serviciosService.obtenerServiciosIndividuales().subscribe({
      next: (res) => {
        this.servicios = res.data || res;
        this.actualizarItemsListPorTipo();
      },
      error: (err) => console.error(err)
    });
  }

  // Carga las listas de pacientes y preguntones, y activa la escucha de cambios en el teléfono
  cargarPacientesYEscuchar(): void {
    // Cargar pacientes que NO están en lista negra
    this.pacientesService.obtenerPacientesCitas().subscribe({
      next: (pacientes: any[]) => { // <-- tipar como any[] o mejor definir una interfaz
        this.todosLosPacientes = pacientes;
        this.actualizarListaMaestra();
        this.verificarTelefonoActual();
      },
      error: (err: any) => console.error('Error al cargar pacientes sin lista negra', err)
    });

    // Cargar preguntones que NO están en lista negra usando el nuevo método
    this.pacientesService.obtenerPreguntonesParaCitas().subscribe({
      next: (preguntones: any[]) => {
        this.todosLosPreguntones = preguntones;
        this.actualizarListaMaestra();
        this.verificarTelefonoActual();
      },
      error: (err: any) => console.error('Error al cargar preguntones', err)
    });

    // Escuchar cambios en el teléfono
    this.citaForm.get('telefono')?.valueChanges.subscribe((telefonoInput: string) => {
      if (telefonoInput && telefonoInput.length >= 10) {
        this.buscarPersona(telefonoInput);
      } else {
        this.resetearCamposNombres();
      }
    });
  }

  // Combina pacientes y preguntones en un solo arreglo para optimizar la búsqueda global
  actualizarListaMaestra(): void {
    this.todosLosContactos = [
      ...this.todosLosPacientes.map(p => ({ ...p, tipoContactoDb: 'paciente' })),
      ...this.todosLosPreguntones.map(p => ({ ...p, tipoContactoDb: 'pregunton' }))
    ];
  }

  actualizarItemsListPorTipo(): void {
    const tipo = this.citaForm.get('itemTipo')?.value;
    if (tipo === 'srv') {
      this.itemsList = this.servicios;
      console.log('Lista actualizada a servicios individuales:', this.itemsList.length);
    } else if (tipo === 'prom') {
      this.itemsList = this.serviciosContratadosPaciente;
      console.log('Lista actualizada a servicios contratados:', this.itemsList.length);
    }
  }

  // Filtra los contactos en tiempo real según lo que el usuario escribe en el input de búsqueda
  filtrarContactos(event: any): void {
    const termino = event.target.value.toLowerCase().trim();

    if (!termino || termino.length < 2) {
      this.contactosFiltrados = [];
      return;
    }

    this.contactosFiltrados = this.todosLosContactos.filter(c => {
      const nombreCompleto = `${c.nombre || ''} ${c.apeP || c.apellidos || c.apellido || ''}`.toLowerCase();
      const telefonos = `${c.telefonoWhatsapp || ''} ${c.numeroTelefono || ''} ${c.telefono || ''}`;

      return nombreCompleto.includes(termino) || telefonos.includes(termino);
    }).slice(0, 5);
  }

  // Asigna el teléfono del contacto seleccionado en la lista al formulario para detonar la autocompleción
  seleccionarContactoLista(contacto: any): void {
    this.terminoBusqueda = '';
    this.contactosFiltrados = [];

    const tel = contacto.telefonoWhatsapp || contacto.numeroTelefono || contacto.telefono || '';
    this.citaForm.patchValue({ telefono: tel });

    const nombre = contacto.nombre || '';
    const apeP = contacto.apeP || contacto.apellidos || contacto.apellido || '';
    this.citaForm.patchValue({ nombre, apeP });

    this.personaEncontrada = contacto;
    this.tipoContacto = contacto.tipoContactoDb === 'paciente' ? 'paciente' : 'pregunton';

    // Deshabilitar campos si corresponden
    if (nombre) this.citaForm.get('nombre')?.disable();
    else this.citaForm.get('nombre')?.enable();
    if (apeP) this.citaForm.get('apeP')?.disable();
    else this.citaForm.get('apeP')?.enable();

    // Si es paciente, cargar sus servicios contratados inmediatamente
    if (this.tipoContacto === 'paciente') {
      this.cargarServiciosContratadosPaciente(contacto._id);
    } else {
      this.serviciosContratadosPaciente = [];
      this.actualizarItemsListPorTipo();
    }
  }

  // Valida si ya existe un teléfono en el formulario al abrir el modal e inicia su búsqueda
  verificarTelefonoActual(): void {
    const telActual = this.citaForm.get('telefono')?.value;
    if (telActual && telActual.length >= 10) {
      this.buscarPersona(telActual);
    }
  }

  // Busca en los arreglos locales si el teléfono pertenece a un paciente o preguntón y autocompleta los datos
  buscarPersona(telefonoInput: string): void {
    const telABuscar = String(telefonoInput);

    let encontrado = this.todosLosPacientes.find(p =>
      String(p.telefono) === telABuscar ||
      String(p.telefonoWhatsapp) === telABuscar ||
      String(p.numeroTelefono) === telABuscar
    );

    if (encontrado) {
      this.personaEncontrada = encontrado;
      this.tipoContacto = 'paciente';
      if (encontrado && this.tipoContacto === 'paciente') {
        this.cargarServiciosContratadosPaciente(this.personaEncontrada._id);
      } else {
        // Si no es paciente, vaciamos la lista de servicios contratados
        this.serviciosContratadosPaciente = [];
        this.actualizarItemsListPorTipo();
      }
    } else {
      encontrado = this.todosLosPreguntones.find(p =>
        String(p.telefono) === telABuscar ||
        String(p.telefonoWhatsapp) === telABuscar ||
        String(p.numeroTelefono) === telABuscar
      );

      if (encontrado) {
        this.personaEncontrada = encontrado;
        this.tipoContacto = 'pregunton';
      } else {
        this.personaEncontrada = null;
        this.tipoContacto = 'nuevo';
      }
    }

    if (this.personaEncontrada) {
      this.citaForm.patchValue({
        nombre: this.personaEncontrada.nombre || '',
        apeP: this.personaEncontrada.apeP || this.personaEncontrada.apellidos || this.personaEncontrada.apellido || ''
      });

      if (this.citaForm.get('nombre')?.value) this.citaForm.get('nombre')?.disable();
      else this.citaForm.get('nombre')?.enable();

      if (this.citaForm.get('apeP')?.value) this.citaForm.get('apeP')?.disable();
      else this.citaForm.get('apeP')?.enable();

    } else {
      this.resetearCamposNombres();
    }
  }

  cargarServiciosContratadosPaciente(pacienteId: string): void {
    console.log('Cargando servicios contratados para paciente:', pacienteId);
    this.servicioContratadoService.obtenerServiciosPorPaciente(pacienteId).subscribe({
      next: (res) => {
        console.log('Respuesta servicios contratados:', res);
        this.serviciosContratadosPaciente = (res.data || []).filter((s: any) => s.sesionesRestantes > 0);
        console.log('Servicios contratados filtrados:', this.serviciosContratadosPaciente);
        this.actualizarItemsListPorTipo();
        // Forzar detección de cambios por si acaso
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar servicios contratados:', err)
    });
  }

  // Limpia los campos de nombre y apellido, y rehabilita su edición manual
  resetearCamposNombres(): void {
    this.personaEncontrada = null;
    this.tipoContacto = 'nuevo';
    this.serviciosContratadosPaciente = [];
    this.actualizarItemsListPorTipo();
    this.citaForm.patchValue({ nombre: '', apeP: '' });
    this.citaForm.get('nombre')?.enable();
    this.citaForm.get('apeP')?.enable();
  }

  // Construye el payload estrictamente con los datos que requiere el backend y ejecuta la petición HTTP
  guardarCita(): void {
    if (this.citaForm.invalid || this.horaFueraDeRango()) return;
    this.cargando = true;

    const formValues = this.citaForm.getRawValue();

    const payload = {
      telefono: formValues.telefono,
      doctorId: formValues.doctorId,
      itemTipo: formValues.itemTipo,
      itemId: formValues.itemId,
      fechaCita: formValues.fechaCita,
      horaInicio: formValues.horaInicio,
      observaciones: formValues.observaciones,
      pago: formValues.pago
    };

    this.calendarioService.agendarCita(payload).subscribe({
      next: (res) => {
        this.cargando = false;
        this.citaAgendada.emit(res);
        this.cerrar();
      },
      error: (err) => {
        console.error('Error al agendar cita:', err);
        alert('Error: ' + (err.error?.error || 'Hubo un error al guardar la cita en el sistema.'));
        this.cargando = false;
      }
    });
  }

  // Verifica que la hora seleccionada no esté fuera de los límites operativos del calendario
  horaFueraDeRango(): boolean {
    const horaElegida = this.citaForm.get('horaInicio')?.value;
    if (!horaElegida || !this.horaMinimaPermitida || !this.horaMaximaPermitida) return false;

    return horaElegida < this.horaMinimaPermitida || horaElegida > this.horaMaximaPermitida;
  }

  // Emite el evento para cerrar la ventana modal actual
  cerrar(): void {
    this.cerrarModal.emit();
  }
}