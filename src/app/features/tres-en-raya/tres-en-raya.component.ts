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
  public turno: boolean = true;
  ngOnInit(): void {
  }

  ngOnDestruct(): void {

  }


  rellenar(event: Event) {
    let i: any = (event.target as HTMLDivElement).dataset["i"];
    if (!i) return;
    i = parseInt(i as string);
    if (this.matriz[i]) return;
    this.matriz[i] = (this.turno) ? 1 : -1;
    this.turno = !this.turno;
  }
}
