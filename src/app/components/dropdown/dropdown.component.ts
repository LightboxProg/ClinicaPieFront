// dropdown.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent {
  @Input() options: string[] = [];

  isOpen = false;

  selectedOption: string | null = null;



  constructor(private loginService: LoginService, private router: Router) {
    if (!this.loginService.existeUsuario()) {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login']);
    }
  }


  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.isOpen = false;
  }
}
