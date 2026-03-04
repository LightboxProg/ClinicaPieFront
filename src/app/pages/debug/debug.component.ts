import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DebugService } from 'src/app/services/debug.service';
import { ChatContainerComponent } from 'src/app/components/chat-container/chat-container.component';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [
    CommonModule,
    ChatContainerComponent
  ],
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent {
 

  constructor() {
  
    }

}
