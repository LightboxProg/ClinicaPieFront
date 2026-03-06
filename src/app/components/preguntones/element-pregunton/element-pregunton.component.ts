import { Component, Input, Output, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PacientesService } from 'src/app/services/pacientes.service';
import Swal from 'sweetalert2';
import { LoginService } from 'src/app/services/login.service';
import { ModalComponent } from '../../modal/modal.component';
import { FormsModule } from '@angular/forms';
import { ListaNegraService } from 'src/app/services/lista-negra.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-element-pregunton',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule],
  templateUrl: './element-pregunton.component.html',
  styleUrls: ['./element-pregunton.component.scss']
})
export class ElementPreguntonComponent implements OnInit, OnDestroy {
  @Input() pregunton: any;
  user: any;
  showListaNegraModal = false;
  razon = '';
  detalles = '';
  tipo = 'permanente';
  pacientesEnListaNegra: any[] = [];
  private usuarioSubscription: Subscription = new Subscription();

  private limpiarFormulario(): void {
    this.razon = '';
    this.detalles = '';
    this.tipo = 'permanente';
  }

  constructor(
    private router: Router,
    private pacientesService: PacientesService,
    private listaNegraService: ListaNegraService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  formatearFecha(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'No proporcionada';
    const [año, mes, dia] = fechaNacimiento.split('T')[0].split('-');
    if (!año || !mes || !dia) return 'No proporcionada';
    return `${mes.padStart(2, '0')}/${dia.padStart(2, '0')}/${año}`;
  }

  verPerfil(idPaciente: string) {
    this.router.navigate(['/perfil', 'paciente', idPaciente]);
  }

}