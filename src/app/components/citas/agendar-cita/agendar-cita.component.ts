import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CalendarioService } from 'src/app/services/calendario.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { PromocionService, Promocion } from 'src/app/services/promocion.service';
import { PacientesService } from 'src/app/services/pacientes.service';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './agendar-cita.component.html',
  styleUrls: ['./agendar-cita.component.scss']
})
export class AgendarCitaComponent implements OnInit {
  
  // Datos que recibe desde el calendario al hacer clic en un espacio libre
  @Input() datosPreconfigurados: any = { doctorId: '', fechaCita: '', horaInicio: '', telefono: '' };
  
  // Eventos para comunicarse con el componente padre
  @Output() cerrarModal = new EventEmitter<void>();
  @Output() citaAgendada = new EventEmitter<any>();

  citaForm: FormGroup;
  cargando = false;
  
  // Catálogos para los selects
  servicios: any[] = [];
  promociones: Promocion[] = [];

  todosLosContactos: any[] = []; 
  contactosFiltrados: any[] = [];
  terminoBusqueda: string = '';

  // Variables para el buscador en tiempo real
  todosLosPacientes: any[] = [];
  todosLosPreguntones: any[] = [];
  
  personaEncontrada: any = null;
  tipoContacto: 'paciente' | 'pregunton' | 'nuevo' = 'nuevo';


  horaMinimaPermitida: string = '';
  horaMaximaPermitida: string = '';


  constructor(
    private fb: FormBuilder,
    private calendarioService: CalendarioService,
    private serviciosService: ServiciosService,
    private promocionService: PromocionService,
    private pacientesService: PacientesService
  ) {
    // Inicializamos el formulario con sus validaciones
    this.citaForm = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10,12}$')]],
      nombre: [''],
      apeP: [''],
      doctorId: ['', Validators.required],
      itemTipo: ['srv', Validators.required], // 'srv' = Servicio, 'prom' = Promoción
      itemId: ['', Validators.required],
      fechaCita: ['', Validators.required],
      horaInicio: ['', Validators.required],
      observaciones: [''],
      pago: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // 1. Si el padre nos mandó datos (ej. la fecha y el doctor), los metemos al formulario
    if (this.datosPreconfigurados) {
      this.citaForm.patchValue(this.datosPreconfigurados);
      this.horaMinimaPermitida = this.datosPreconfigurados.limiteMinimo;
      this.horaMaximaPermitida = this.datosPreconfigurados.limiteMaximo
    }
    
    // 2. Cargamos todo lo necesario del backend
    this.cargarCatalogos();
    this.cargarPacientesYEscuchar();

    // 3. Si el usuario cambia entre Servicio y Promoción, borramos el tratamiento que había elegido
    this.citaForm.get('itemTipo')?.valueChanges.subscribe(() => {
      this.citaForm.get('itemId')?.setValue('');
    });
  }

  cargarCatalogos(): void {
    // Traer servicios
    this.serviciosService.obtenerServiciosIndividuales().subscribe({
      next: (res) => this.servicios = res.data || res,
      error: (err) => console.error('Error al cargar servicios', err)
    });

    // Traer promociones
    this.promocionService.obtenerPromociones({ vigente: true, activa: true }).subscribe({
      next: (res) => this.promociones = res.data,
      error: (err) => console.error('Error al cargar promociones', err)
    });
  }

  cargarPacientesYEscuchar(): void {
    this.pacientesService.obtenerPacientes();
    this.pacientesService.obtenerPreguntones();
    
    // Guardamos y combinamos los pacientes
    this.pacientesService.paciente$.subscribe(pacientes => {
      this.todosLosPacientes = pacientes;
      this.actualizarListaMaestra(); // 🌟 Actualizamos la lista
      this.verificarTelefonoActual();
    });

    // Guardamos y combinamos los preguntones
    this.pacientesService.preguntone$.subscribe(preguntones => {
      this.todosLosPreguntones = preguntones;
      this.actualizarListaMaestra(); // 🌟 Actualizamos la lista
      this.verificarTelefonoActual();
    });

    this.citaForm.get('telefono')?.valueChanges.subscribe(telefonoInput => {
      if (telefonoInput && telefonoInput.length >= 10) {
        this.buscarPersona(telefonoInput);
      } else {
        this.resetearCamposNombres();
      }
    });
  }

  // 🌟 FUNCIÓN NUEVA: Une ambas listas para facilitar la búsqueda
  actualizarListaMaestra(): void {
    this.todosLosContactos = [
      ...this.todosLosPacientes.map(p => ({ ...p, tipoContactoDb: 'paciente' })),
      ...this.todosLosPreguntones.map(p => ({ ...p, tipoContactoDb: 'pregunton' }))
    ];
  }

  // 🌟 FUNCIÓN NUEVA: Filtra mientras escribes (por nombre o teléfono)
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
    }).slice(0, 5); // Mostramos solo los 5 mejores resultados para no saturar la pantalla
  }

  // 🌟 FUNCIÓN NUEVA: Al hacer clic en un resultado de la lista
  seleccionarContactoLista(contacto: any): void {
    // 1. Limpiamos el buscador
    this.terminoBusqueda = '';
    this.contactosFiltrados = [];

    // 2. Extraemos el teléfono que tenga registrado
    const tel = contacto.telefonoWhatsapp || contacto.numeroTelefono || contacto.telefono || '';
    
    // 3. Lo inyectamos al formulario. 
    // ¡Al cambiar el teléfono, se disparará tu función buscarPersona automáticamente y hará toda la magia!
    this.citaForm.patchValue({ telefono: tel });
  }
  // Verifica si el modal se abrió con un teléfono ya escrito y lo busca
  verificarTelefonoActual(): void {
    const telActual = this.citaForm.get('telefono')?.value;
    if (telActual && telActual.length >= 10) {
      this.buscarPersona(telActual);
    }
  }

  buscarPersona(telefonoInput: string): void {
    const telABuscar = String(telefonoInput);

    // 1. Buscamos primero en pacientes (Revisando varios nombres de variables por si acaso)
    let encontrado = this.todosLosPacientes.find(p => 
      String(p.telefono) === telABuscar || 
      String(p.telefonoWhatsapp) === telABuscar ||
      String(p.numeroTelefono) === telABuscar
    );
    
    if (encontrado) {
      this.personaEncontrada = encontrado;
      this.tipoContacto = 'paciente';
    } else {
      // 2. Si no es paciente, buscamos en los leads (Preguntones)
      encontrado = this.todosLosPreguntones.find(p => 
        String(p.telefono) === telABuscar || 
        String(p.telefonoWhatsapp) === telABuscar ||
        String(p.numeroTelefono) === telABuscar
      );
      
      if (encontrado) {
        this.personaEncontrada = encontrado;
        this.tipoContacto = 'pregunton';
      } else {
        // 3. Si no existe en ningún lado
        this.personaEncontrada = null;
        this.tipoContacto = 'nuevo';
      }
    }
    
    // Autocompletamos y manejamos los bloqueos de campos
    if (this.personaEncontrada) {
      this.citaForm.patchValue({
        nombre: this.personaEncontrada.nombre || '',
        // Buscamos en varios posibles nombres para el apellido
        apeP: this.personaEncontrada.apeP || this.personaEncontrada.apellidos || this.personaEncontrada.apellido || '' 
      });
      
      // Si tiene nombre, lo bloqueamos
      if (this.citaForm.get('nombre')?.value) {
        this.citaForm.get('nombre')?.disable();
      } else {
        this.citaForm.get('nombre')?.enable();
      }

      // Si tiene apellido registrado, lo bloqueamos. Si está vacío (como Lvis), lo dejamos editable
      if (this.citaForm.get('apeP')?.value) {
        this.citaForm.get('apeP')?.disable();
      } else {
        this.citaForm.get('apeP')?.enable();
      }

    } else {
      this.resetearCamposNombres();
    }
  }

  resetearCamposNombres(): void {
    this.personaEncontrada = null;
    this.tipoContacto = 'nuevo';
    this.citaForm.patchValue({ nombre: '', apeP: '' });
    // Rehabilitamos los campos para que puedan escribir
    this.citaForm.get('nombre')?.enable();
    this.citaForm.get('apeP')?.enable();
  }

  guardarCita(): void {
    if (this.citaForm.invalid) return;
    if (this.citaForm.invalid || this.horaFueraDeRango()) return;
    this.cargando = true;

    const payload = this.citaForm.getRawValue();

    // 🌟 Si dejaron el nombre en blanco, le ponemos uno por defecto para el Calendar
    if (!payload.nombre || payload.nombre.trim() === '') {
      payload.nombre = 'Paciente por Confirmar';
    }

    if (this.personaEncontrada) {
      if (this.tipoContacto === 'paciente') payload.pacienteId = this.personaEncontrada._id;
      if (this.tipoContacto === 'pregunton') payload.preguntonId = this.personaEncontrada._id;
    }

    this.calendarioService.agendarCita(payload).subscribe({
      next: (res) => {
        this.cargando = false;
        this.citaAgendada.emit(res); // Le avisa al calendario de atrás que recargue las citas
        this.cerrar();
      },
      error: (err) => {
        console.error('Error al agendar cita:', err);
        alert('Error: ' + (err.error?.error || 'Hubo un error al guardar la cita en el sistema.'));
        this.cargando = false;
      }
    });
  }

  horaFueraDeRango(): boolean {
    const horaElegida = this.citaForm.get('horaInicio')?.value;
    if (!horaElegida || !this.horaMinimaPermitida || !this.horaMaximaPermitida) return false;
    
    // Comparamos los strings (ej. "11:30" < "10:00" o "11:30" > "14:00")
    return horaElegida < this.horaMinimaPermitida || horaElegida > this.horaMaximaPermitida;
  }

  cerrar(): void {
    this.cerrarModal.emit();
  }
}