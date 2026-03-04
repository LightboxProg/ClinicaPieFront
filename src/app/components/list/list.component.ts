import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListElementPhotoComponent } from '../list-elements/list-element-photo/list-element-photo.component';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ListElementPhotoComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent {


  constructor(private loginService: LoginService, private router: Router) {
    if (!this.loginService.existeUsuario()) {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login']);
    }
  }

}
