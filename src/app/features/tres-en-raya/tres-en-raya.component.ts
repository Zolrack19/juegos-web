import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

enum Ficha { // X = 1, O = -1
  X, O
}

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
  public nJugadas: number = 0;
  ngOnInit(): void {
  }

  ngOnDestruct(): void {

  }

  private valorEstado(nJugadas: number): number {
    let aux = 0;
    // verificación en filas y columnas
    for (let i = 0; i < 3; i++) {
      aux = this.matriz[i * 3] + this.matriz[i * 3 + 1] + this.matriz[i * 3 + 2];
      if (aux === 3) return 1;
      if (aux === -3) return -1;
      aux = this.matriz[i] + this.matriz[i + 3] + this.matriz[i + 6];
      if (aux === 3) return 1;
      if (aux === -3) return -1;
    }
    aux = this.matriz[0] + this.matriz[4] + this.matriz[8];
    if (aux === 3) return 1;
    if (aux === -3) return -1;
    aux = this.matriz[2] + this.matriz[4] + this.matriz[6];
    if (aux === 3) return 1;
    if (aux === -3) return -1;
    
    if (nJugadas === 9) return 0; // empate
    
    return -2; // flag para indicar que no es estado terminal
  }

  private posiblesJugadas(): number[] {
    const jugadas: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (!this.matriz[i]) {
        jugadas.push(i);
      }
    }
    return jugadas;
  }

  private minimax(ficha: Ficha, nJugadas: number): number {
    const valorEstado = this.valorEstado(nJugadas);
    if (valorEstado !== -2) { // estado terminal
      return valorEstado;
    }

    if (ficha === Ficha.X) {
      let valor = -100;
      this.posiblesJugadas().forEach(i => {
        this.matriz[i] = 1;
        valor = Math.max(valor, this.minimax(Ficha.O, nJugadas + 1))
        this.matriz[i] = 0;
      });
      return valor;
    } else { // se asume que es turno de O
      let valor = 100;
      this.posiblesJugadas().forEach(i => {
        this.matriz[i] = -1;
        valor = Math.min(valor, this.minimax(Ficha.X, nJugadas + 1))
        this.matriz[i] = 0;
      });
      return valor;
    }
  }

  public rellenar(event: Event) {
    let i: any = (event.target as HTMLDivElement).dataset["i"];
    if (!i) return;
    i = parseInt(i as string);
    if (this.matriz[i]) return;
    this.matriz[i] = (this.turno) ? 1 : -1;
    this.turno = !this.turno;
  }
}
