import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-mi-app',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './mi-app.component.html',
  styleUrl: './mi-app.component.css',
})
export class MiAppComponent {
  
}