import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

enum Ficha {
  X = 1, O = -1
}
enum EstadoJuego {
  GANA_O = -1,  EMPATE = 0, GANA_X = 1, EN_CURSO, EN_ESPERA = 3
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
  public vsIA: boolean = false;
  public estadoJuego: EstadoJuego = EstadoJuego.EN_ESPERA;
  public text = "HOLA";

  private miFicha: Ficha = Ficha.X;
  private nJugadas: number = 0;

  private valorEstado(nJugadas: number): EstadoJuego {
    let aux = 0;
    // verificación en filas y columnas
    for (let i = 0; i < 3; i++) {
      aux = this.matriz[i * 3] + this.matriz[i * 3 + 1] + this.matriz[i * 3 + 2];
      if (aux === 3) return EstadoJuego.GANA_X;
      if (aux === -3) return EstadoJuego.GANA_O;
      aux = this.matriz[i] + this.matriz[i + 3] + this.matriz[i + 6];
      if (aux === 3) return EstadoJuego.GANA_X;
      if (aux === -3) return EstadoJuego.GANA_O;
    }
    aux = this.matriz[0] + this.matriz[4] + this.matriz[8];
    if (aux === 3) return EstadoJuego.GANA_X;
    if (aux === -3) return EstadoJuego.GANA_O;
    aux = this.matriz[2] + this.matriz[4] + this.matriz[6];
    if (aux === 3) return EstadoJuego.GANA_X;
    if (aux === -3) return EstadoJuego.GANA_O;
    
    if (nJugadas === 9) return EstadoJuego.EMPATE;
    
    return EstadoJuego.EN_CURSO; // flag para indicar que no es estado terminal
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

  private minimax(ficha: Ficha, nJugadas: number, alpha = -100, beta = 100): EstadoJuego {
    const valorEstado = this.valorEstado(nJugadas);
    if (valorEstado !== EstadoJuego.EN_CURSO) { // estado terminal
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
    } else { // se asume que es turno de O
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

  mejorJugada(ficha: Ficha): number {
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
    } else { // se asume que es turno de O
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

  efectuarJugada(i: number, ficha: Ficha) {
    this.matriz[i] = ficha;
    this.nJugadas++;
    if (this.nJugadas > 4)
    switch (this.valorEstado(this.nJugadas)) {
      case EstadoJuego.GANA_X:
        this.text = "X GANA"
        this.estadoJuego = EstadoJuego.EN_ESPERA;
        break;
      case EstadoJuego.GANA_O:
        this.text = "O GANA"
        this.estadoJuego = EstadoJuego.EN_ESPERA;
        break;
      case EstadoJuego.EMPATE:
        this.text = "EMPATE"
        this.estadoJuego = EstadoJuego.EN_ESPERA;
        break;
      default:
        break;
    }
  }

  iniciarJuego(vsIA = false) {
    this.vsIA = vsIA;
    this.miTurno = true;
    this.estadoJuego = EstadoJuego.EN_CURSO;
    this.nJugadas = 0;
    for (let i = 0; i < 9; i++) {
      this.matriz[i] = 0;
    }
    if (!vsIA) return;
    if (Math.random() <= 0.5) {
      this.miFicha = Ficha.X;
    } else {
      this.miFicha = Ficha.O;
      this.efectuarJugada(0, Ficha.X); // la mejor jugada inicial es en 0, o cualquier otra esquina
    }
  }

  public hacerJugada(event: Event) {
    if (this.estadoJuego !== EstadoJuego.EN_CURSO) return;
    let i: any = (event.target as HTMLDivElement).dataset["i"];
    if (!i) return;
    i = parseInt(i as string);
    if (this.matriz[i]) return;
    if (!this.vsIA) {
      this.efectuarJugada(i, (this.miTurno) ? Ficha.X : Ficha.O);
      this.miTurno = !this.miTurno;
      return;
    }
    this.efectuarJugada(i, this.miFicha);
    i = this.mejorJugada((this.miFicha == Ficha.X) ? Ficha.O : Ficha.X)
    this.efectuarJugada(i, (this.miFicha == Ficha.X) ? Ficha.O : Ficha.X);
  }
}
