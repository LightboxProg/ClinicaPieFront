import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserViewComponent } from '../user-view/user-view.component';
import { SwalService } from 'src/app/services/swal.service';
import { UserListElementComponent } from '../user-list-element/user-list-element.component';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UserListElementComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
  constructor(private loginService: LoginService, private router: Router) {
    if (!this.loginService.existeUsuario()) {
      this.router.navigate(['/login']);
    }
  }

}
