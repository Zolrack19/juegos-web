import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tres-en-raya',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tres-en-raya.component.html',
  styleUrl: './tres-en-raya.component.css'
})
export class TresEnRayaComponent {
  public matriz: Int8Array = new Int8Array(9);
  public nose: boolean = false;
  ngOnInit(): void {
  }

  ngOnDestruct(): void {

  }

  rellenar(i: number) {
    this.matriz[i] = (this.nose) ? 1 : -1;
    this.nose = !this.nose;
    console.log(this.nose);
  }
}
