import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaNegraComponent } from '../lista-negra/lista-negra.component';
import { ListaNegraService } from 'src/app/services/lista-negra.service';

@Component({
  selector: 'app-lista-pacientes-ln',
  standalone: true,
  imports: [CommonModule, ListaNegraComponent],
  templateUrl: './lista-pacientes-ln.component.html',
  styleUrls: ['./lista-pacientes-ln.component.scss']
})
export class ListaPacientesLnComponent {
  @Input() entrada: any;
  pacientesListaNegra: any[] = [];

  constructor(private ListaNegraService: ListaNegraService) {}

  ngOnInit(): void {
    this.ListaNegraService.getPacientesListaNegra().subscribe({
      next: (res) => {
        console.log('Datos recibidos del servicio:', res);
        this.pacientesListaNegra = res.data; 
      },
      error: (err) => console.error(err)
    });
  }

}
