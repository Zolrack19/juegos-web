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
  public miTurno: boolean = true;
  public nJugadas: number = 0;
  ngOnInit(): void {
  }

  ngOnDestruct(): void {

  }

  private valorEstado(matriz: Int8Array, nJugadas: number): number {
    let aux = 0;
    // verificación en filas y columnas
    for (let i = 0; i < 3; i++) {
      aux = matriz[i * 3] + matriz[i * 3 + 1] + matriz[i * 3 + 2];
      if (aux === 3) return 1;
      if (aux === -3) return -1;
      aux = matriz[i] + matriz[i + 3] + matriz[i + 6];
      if (aux === 3) return 1;
      if (aux === -3) return -1;
    }
    aux = matriz[0] + matriz[4] + matriz[8];
    if (aux === 3) return 1;
    if (aux === -3) return -1;
    aux = matriz[2] + matriz[4] + matriz[6];
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

  private minimax(ficha: Ficha, nJugadas: number, alpha = -100, beta = 100): number {
    const valorEstado = this.valorEstado(this.matriz, nJugadas);
    if (valorEstado !== -2) { // estado terminal
      return valorEstado;
    }

    let valor = 0;
    if (ficha === Ficha.X) {
      valor = -100;
      for (const i of this.posiblesJugadas()) {
        this.matriz[i] = 1;
        valor = Math.max(valor, this.minimax(Ficha.O, nJugadas + 1, alpha, beta))
        this.matriz[i] = 0;
        alpha = Math.max(alpha, valor);
        if (alpha >= beta) break;
      }
    } else { // se asume que es miTurno de O
      valor = 100;
      for (const i of this.posiblesJugadas()) {
        this.matriz[i] = -1;
        valor = Math.min(valor, this.minimax(Ficha.X, nJugadas + 1, alpha, beta))
        this.matriz[i] = 0;
        beta = Math.min(beta, valor);
        if (alpha >= beta) break;
      }
    }
    return valor;
  }

  mejorJugada(ficha: Ficha) {
    let mejorIndice = -1;
    let mejorValor = 0;
    if (ficha === Ficha.X) {
      mejorValor = -100;
      this.posiblesJugadas().forEach(i => {
        this.matriz[i] = 1;
        const valor = Math.max(mejorValor, this.minimax(Ficha.O, this.nJugadas + 1))
        this.matriz[i] = 0;
        if (valor > mejorValor) {
          mejorValor = valor;
          mejorIndice = i;
        }
      })
    } else { // se asume que es miTurno de O
      mejorValor = 100;
      this.posiblesJugadas().forEach(i => {
        this.matriz[i] = -1;
        const valor = Math.min(mejorValor, this.minimax(Ficha.X, this.nJugadas + 1))
        this.matriz[i] = 0;
        if (valor < mejorValor) {
          mejorValor = valor;
          mejorIndice = i;
        }
      })
    }
    return mejorIndice;
  }

  public hacerJugada(event: Event) {
    let i: any = (event.target as HTMLDivElement).dataset["i"];
    if (!i) return;
    i = parseInt(i as string);
    if (this.matriz[i]) return;
    this.matriz[i] = 1;
    this.nJugadas++;

    i = this.mejorJugada(Ficha.O)
    this.nJugadas++;
    this.matriz[i] = -1;
  }
}
