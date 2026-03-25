import { Component, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { PacientesService } from 'src/app/services/pacientes.service';
import { LoginService } from 'src/app/services/login.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-filtros-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './filtros-pacientes.component.html',
  styleUrls: ['./filtros-pacientes.component.scss']
})
export class FiltrosPacientesComponent {
  private _filters = {
    searchTerm: '',
    genero: '',
    finado: null as boolean | null
  };

  get filters() {
    return this._filters;
  }

  set filters(value) {
    this._filters = value;
    this.emitChange();
  }

  @Output() filterChange = new EventEmitter<any>();

  onFilterChange() {
    this.emitChange();
  }

  resetFilters() {
    this.filters = {
      searchTerm: '',
      genero: '',
      finado: null
    };
  }

  private emitChange() {
    this.filterChange.emit({ ...this._filters });
  }
}