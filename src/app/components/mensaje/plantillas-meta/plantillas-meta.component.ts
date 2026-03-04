import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plantillas-meta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plantillas-meta.component.html',
  styleUrls: ['./plantillas-meta.component.scss']
})
export class PlantillasMetaComponent {
  // 🌟 Recibe la plantilla completa seleccionada en el padre
  @Input() plantilla: any = null;
  
  // 🌟 Recibe lo que el usuario va escribiendo en tiempo real
  @Input() valoresVariables: string[] = [];

  // Busca una parte específica de la plantilla (HEADER, BODY, FOOTER, BUTTONS)
  getComponente(tipo: string): any {
    if (!this.plantilla || !this.plantilla.componentes) return null;
    return this.plantilla.componentes.find((c: any) => c.type === tipo);
  }

  // Sustituye los {{1}}, {{2}} por el texto real en vivo
  getBodyConVariables(): string {
    const body = this.getComponente('BODY');
    if (!body || !body.text) return '';
    
    let textoDinamico = body.text;
    
    // Recorremos las variables y las reemplazamos en el texto
    this.valoresVariables.forEach((valor, index) => {
      // Creamos una expresión regular para buscar {{1}}, {{2}}, etc.
      const regex = new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g');
      
      // Si el usuario ya escribió algo, lo ponemos. Si no, dejamos el {{x}} original
      textoDinamico = textoDinamico.replace(regex, valor ? valor : `{{${index + 1}}}`);
    });
    
    return textoDinamico;
  }
}