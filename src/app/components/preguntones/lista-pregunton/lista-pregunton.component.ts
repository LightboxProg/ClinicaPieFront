import { Component, ViewChild, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormComponent } from '../../forms/form/form.component';
import { SwalService } from 'src/app/services/swal.service';
import { PacientesService } from 'src/app/services/pacientes.service';
import { ElementPreguntonComponent } from '../element-pregunton/element-pregunton.component';

@Component({
  selector: 'app-lista-pregunton',
  standalone: true,
  imports: [CommonModule, FormsModule, ElementPreguntonComponent],
  templateUrl: './lista-pregunton.component.html',
  styleUrls: ['./lista-pregunton.component.scss']
})
export class ListaPreguntonComponent {
  preguntones: any[]=[];
  preguntonesFiltrados: any[] = [];
  @Input() filtro: string = '';
  @ViewChild(FormComponent) formComponent!: FormComponent;

  constructor(private router: Router, private swalService: SwalService,private pacienteService:PacientesService) {}

  ngOnInit() {
    this.pacienteService.preguntone$.subscribe((data) => {
      this.preguntones = data;
      this.aplicarFiltro();
    });
    this.pacienteService.obtenerPreguntones();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filtro']) {
      this.aplicarFiltro();
    }
  }

  aplicarFiltro() {
    if (!this.filtro) {
      this.preguntonesFiltrados = [...this.preguntones];
    } else {
      const term = this.filtro.toString();
      this.preguntonesFiltrados = this.preguntones.filter(p => 
        (p.numeroTelefono && p.numeroTelefono.toString().includes(term)) ||
        (p.telefonoWhatsapp && p.telefonoWhatsapp.toString().includes(term))
      );
    }
  }

}

