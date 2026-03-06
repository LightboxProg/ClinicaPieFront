import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from 'src/app/services/chat.service';  
import { PlantillasMetaComponent } from '../plantillas-meta/plantillas-meta.component'; //  Importamos el hijo
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mensajes-masivos',
  standalone: true,
  imports: [CommonModule, FormsModule, PlantillasMetaComponent], 
  templateUrl: './mensajes-masivos.component.html',
  styleUrls: ['./mensajes-masivos.component.scss']
})
export class MensajesMasivosComponent implements OnInit, OnDestroy {
  // Configuración de la Audiencia
  audienciaSeleccionada: string = 'todos';
  diasSinContacto: number | null = null;
  mesesSinContacto: number | null = null;
  
  // Plantillas
  plantillasDisponibles: any[] = [];
  plantillaSeleccionada: any = null;
  
  // Variables Dinámicas
  variablesDinamicas: string[] = [];
  requiereImagen: boolean = false;
  urlImagenHeader: string = ''; // Para guardar el link de la imagen si la plantilla lo pide
  
  // Estado de la interfaz
  enviando: boolean = false;
  mensajeExito: string = '';
  error: string = '';

  private sub: Subscription = new Subscription();

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Escuchamos las plantillas desde tu servicio global
    this.sub.add(
      this.chatService.plantillas$.subscribe((data: any[]) => {
        this.plantillasDisponibles = data;
      })
    );

    // Si entramos a la pantalla y no hay plantillas cargadas, las pedimos al backend
    if (this.plantillasDisponibles.length === 0) {
      this.chatService.cargarPlantillasMeta().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // Se ejecuta al cambiar el Dropdown de plantillas
  onPlantillaSeleccionada(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const idPlantilla = selectElement.value;
    
    this.plantillaSeleccionada = this.plantillasDisponibles.find(p => p.id === idPlantilla);
    
    // Reseteamos las variables al cambiar de plantilla
    this.variablesDinamicas = [];
    this.requiereImagen = false;
    this.urlImagenHeader = '';

    if (this.plantillaSeleccionada) {
      // 1. Verificamos si requiere IMAGEN en el HEADER
      const header = this.plantillaSeleccionada.componentes.find((c: any) => c.type === 'HEADER');
      if (header && header.format === 'IMAGE') {
        this.requiereImagen = true;
      }

      // 2. Contamos cuántas variables {{x}} tiene el BODY
      const bodyComponent = this.plantillaSeleccionada.componentes.find((c: any) => c.type === 'BODY');
      if (bodyComponent && bodyComponent.text) {
        const coincidencias = bodyComponent.text.match(/\{\{\d+\}\}/g);
        if (coincidencias) {
          // Creamos un arreglo vacío del tamaño exacto de variables ("Juan", "12:00", etc.)
          this.variablesDinamicas = new Array(coincidencias.length).fill('');
        }
      }
    }
  }

  // Truco para que ngFor funcione bien con arreglos de strings primitivos e inputs
  trackByIndex(index: number, obj: any): any {
    return index;
  }

  // Enviar la campaña al Backend
  lanzarCampana(): void {
    if (!this.plantillaSeleccionada) {
      this.error = "Por favor selecciona una plantilla primero.";
      return;
    }

    this.enviando = true;
    this.mensajeExito = '';
    this.error = '';

    const payload = {
      audiencia: this.audienciaSeleccionada,
      diasSinContacto: this.diasSinContacto,
      mesesSinContacto: this.mesesSinContacto,
      nombrePlantilla: this.plantillaSeleccionada.nombre,
      idiomaPlantilla: this.plantillaSeleccionada.idioma,
      variablesBody: this.variablesDinamicas,
      urlImagen: this.urlImagenHeader // Se lo mandamos al backend por si n8n lo necesita
    };

    this.chatService.lanzarCampanaMasiva(payload).subscribe({
      next: (res: any) => {
        this.enviando = false;
        if (res.success) {
          this.mensajeExito = res.message;
          // Limpiamos los inputs
          this.variablesDinamicas.fill('');
          this.urlImagenHeader = '';
        }
      },
      error: (err: any) => {
        this.enviando = false;
        this.error = err.error?.error || 'Hubo un error al lanzar la campaña. Revisa la consola.';
        console.error('Error al enviar campaña', err);
      }
    });
  }
}