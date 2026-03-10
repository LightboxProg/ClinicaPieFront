import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() title: string = 'Default Title';
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (this.isVisible) {
      this.close.emit();
    }
  }

  closeModal(): void {
    this.isVisible = false;
    this.close.emit();
  }
}