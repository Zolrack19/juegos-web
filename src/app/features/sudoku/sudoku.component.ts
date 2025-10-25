import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Bucket {
  valor: Int8Array;
  valor_aux: Int8Array; // valor oculto para caché
  editable: boolean;
}

@Component({
  selector: 'app-sudoku',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './sudoku.component.html',
  styleUrl: './sudoku.component.css'
})
export class SudokuComponent implements AfterViewInit {

  public matriz: Bucket[][] = [];
  // para usar bits para mantener lógica del sudoku
  private rowMask: Uint32Array = new Uint32Array(9);
  private colMask: Uint32Array = new Uint32Array(9);
  private bloqueMask: Uint32Array = new Uint32Array(9);

  private temporizador: any = null;
  private nJugadas: number = 0;

  public hora: Int8Array = new Int8Array(1);
  public minuto: Int8Array = new Int8Array(1);
  public segundo: number = 0;

  public sudokuResuelto: boolean = false;
  public flagDialogOperacion: boolean = false;
  @ViewChild('tablero_sudoku') tableroRef!: ElementRef<HTMLDivElement>;
  @ViewChild('popup_dialog') popupDialog!: ElementRef<HTMLDialogElement>;

  public rowResaltada: number | null = null;
  public colResaltada: number | null = null;

  ngOnInit() {
    for (let i = 0; i < 9; i++) {
      const dummy: Bucket[] = [];
      for (let j = 0; j < 9; j++) {
        dummy.push({ valor: new Int8Array(1), valor_aux: new Int8Array(1), editable: true });
      }
      this.matriz.push(dummy);
    }
  }

  ngOnDestroy(): void {
    if (!this.temporizador) {
      clearInterval(this.temporizador)
    }
  }

  ngAfterViewInit(): void {
    this.actualizarTableroHTML();
  }

  pausar() {
    if (this.sudokuResuelto) return;
    if (!this.temporizador) {
      this.temporizador = setInterval(() => {
        if (++this.segundo >= 60) {
          this.segundo = 0;
          if (++this.minuto[0] >= 60) {
            this.minuto[0] = 0;
            this.hora[0]++;
          }
        }
      }, 1000);
      return;
    }
    clearInterval(this.temporizador);
    this.temporizador = null;
  }

  reiniciarSudoku() {
    const celdas = this.tableroRef.nativeElement.querySelectorAll('input');
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.matriz[row][col].editable) {
          this.quitarDeMasks(1 << this.matriz[row][col].valor[0], row, col)
          this.matriz[row][col].valor[0] = 0;
          celdas.item(row * 9 + col).value = ""
        }
      }
    }
    this.sudokuResuelto = false;
  }

  resolverSudoku() {
    for (let row = 0; row < 9; row++) {
      this.rowMask[row] = 0b111111111_000000000_0;
      this.colMask[row] = 0b111111111_000000000_0;
      this.bloqueMask[row] = 0b111111111_000000000_0;
      for (let col = 0; col < 9; col++) {
        if (!this.matriz[row][col].valor[0]) {
          this.matriz[row][col].valor[0] = this.matriz[row][col].valor_aux[0];
        }
      }
    }
    this.sudokuResuelto = true;
    this.actualizarTableroHTML();
  }

  resolverBacktracking(): boolean {
    const celda = this.getCoordenadaCeldaVacia();
    if (!celda) { // no hay más celdas vacías
      return true;
    }
    const { row, col } = celda;

    for (let i = 1; i <= 9; i++) {
      const bit = 1 << i;
      if (this.valorValido(i, row, col)) {
        this.matriz[row][col].valor[0] = i;
        this.insertarEnMasks(bit, row, col);
        if (this.resolverBacktracking()) {
          this.matriz[row][col].editable = false;
          this.matriz[row][col].valor_aux[0] = i;
          return true;
        }
        this.matriz[row][col].valor[0] = 0;
        this.quitarDeMasks(bit, row, col);
      }
    }
    this.matriz[row][col].editable = true;
    return false;
  }

  getCoordenadaCeldaVacia(): { row: number, col: number } | null {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (!this.matriz[i][j].valor[0]) {
          return { row: i, col: j }; // rvalue de coordenadas
        }
      }
    }
    return null;
  }

  valorValido(valor: number, row: number, col: number): boolean {
    const bit_comparar = 1 << valor;
    const i_bloque = Math.trunc(row / 3) * 3 + Math.trunc(col / 3);
    return (
      (this.rowMask[row] & bit_comparar) === 0 &&
      (this.colMask[col] & bit_comparar) === 0 &&
      (this.bloqueMask[i_bloque] & bit_comparar) === 0
    );
  }

  nuevoSudoku() { // la parte más complicada
    if (!this.sudokuResuelto) {
      for (let i = 0; i < 9; i++) {
        this.rowMask[i] = 0b111111111_000000000_0; // este primer cero es un poco molesto
        this.colMask[i] = 0b111111111_000000000_0;
        this.bloqueMask[i] = 0b111111111_000000000_0;
      }
    }

    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
    for (let i = 0; i < 7; i += 3) {
      for (let j = 0; j < 9; j++) {
        const row = i + Math.trunc(j / 3);
        const col = i + j % 3;

        this.matriz[row][col].valor[0] = nums[j];
        this.matriz[row][col].valor_aux[0] = nums[j];
        this.matriz[row][col].editable = false;

        this.insertarEnMasks((1 << nums[j]), row, col);
        switch (i) {
          case 0:
            this.matriz[row][col + 3].valor[0] = 0;
            this.matriz[row][col + 6].valor[0] = 0;
            break;
          case 3:
            this.matriz[row][col - 3].valor[0] = 0;
            this.matriz[row][col + 3].valor[0] = 0;
            break;
          case 6:
            this.matriz[row][col - 6].valor[0] = 0;
            this.matriz[row][col - 3].valor[0] = 0;
            break;
          default: break;
        }
      }
      nums.sort(() => Math.random() - 0.5);
    }
    this.resolverBacktracking();
    this.nJugadas = 81;
    for (let i = 0; i < 7; i += 3) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 5; k++) { // n eliminaciones por fila
          const row = i + j;
          const col_rand = Math.trunc(Math.random() * 9)
          if (this.matriz[row][col_rand].editable) continue;

          const bit = 1 << this.matriz[row][col_rand].valor[0];
          this.quitarDeMasks(bit, row, col_rand);
          this.quitarDeMasks(1 << (this.matriz[row][col_rand].valor[0] + 9), row, col_rand)

          this.matriz[row][col_rand].valor[0] = 0;
          this.matriz[row][col_rand].editable = true;
          this.nJugadas--;
        }
      }
    }
    this.actualizarTableroHTML();
    this.sudokuResuelto = false;

    this.popupDialog.nativeElement.close();
  }

  verificarSolucionUsuario(): boolean {
    const mascara = 0b1111111110;

    for (let i = 0; i < 9; i++) {
      if ((this.rowMask[i] & mascara) !== mascara ||
        (this.colMask[i] & mascara) !== mascara ||
        (this.bloqueMask[i] & mascara) !== mascara) {
          console.log(`${i} ${mascara}\nrow: ${this.rowMask[i] & mascara}\ncol: ${this.colMask[i] & mascara}\nbloque: ${this.bloqueMask[i] & mascara}`);
          return false;
        }
    }
    return true;
  }

  ingresarNumero(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement;
    const valor: any = event.key;
    if (valor == "Tab" || valor == "Control" || valor == "Shift" || valor == "Alt") return;
    const row = parseInt(target.dataset["row"] as string);
    const col = parseInt(target.dataset["col"] as string);
    if (valor == this.matriz[row][col].valor[0]) return;
    switch (valor) {
      case "ArrowUp": {
        if (row - 1 > -1)
          (document.querySelector(`input[data-row="${row - 1}"][data-col="${col}"]`) as HTMLInputElement).focus();
        break;
      }
      case "ArrowDown": {
        if (row + 1 < 9)
          (document.querySelector(`input[data-row="${row + 1}"][data-col="${col}"]`) as HTMLInputElement).focus();
        break;
      }
      case "ArrowLeft": {
        if (col - 1 > -1)
          (document.querySelector(`input[data-row="${row}"][data-col="${col - 1}"]`) as HTMLInputElement).focus();
        break;
      }
      case "ArrowRight": {
        if (col + 1 < 9)
          (document.querySelector(`input[data-row="${row}"][data-col="${col + 1}"]`) as HTMLInputElement).focus();
        break;
      }
    }
    if (this.sudokuResuelto) return;
    if (!this.matriz[row][col].editable) {
      event.preventDefault();
      return;
    }
    if (valor == "Backspace" || valor == "Delete") {
      if (!this.matriz[row][col].valor[0]) return;
      this.nJugadas--;
      const valor_celda = this.matriz[row][col].valor[0]
      this.matriz[row][col].valor[0] = 0;
      target.value = "";
      if (!(this.rowMask[row] & (1 << (valor_celda + 9)))) {
        this.rowMask[row] ^= 1 << (valor_celda);
      }
      if (!(this.colMask[col] & (1 << (valor_celda + 9)))) {
        this.colMask[col] ^= 1 << (valor_celda);
      }
      const i_bloque = Math.trunc(row / 3) * 3 + Math.trunc(col / 3);
      if (!(this.bloqueMask[i_bloque] & (1 << (valor_celda + 9)))) {
        this.bloqueMask[i_bloque] ^= 1 << (valor_celda);
      }
      return;
    }
    if (!((/^[1-9]{1}$/).test(valor))) {
      event.preventDefault();
      return;
    }

    if (!this.matriz[row][col].valor[0]) {
      ++this.nJugadas
    }
    this.matriz[row][col].valor[0] = parseInt(valor);
    this.insertarEnMasks(1 << this.matriz[row][col].valor[0], row, col);

    if (this.nJugadas === 81) {
      if (this.verificarSolucionUsuario()) {
        alert("Felicidades!!")
      }
    }
    target.value = valor;
  }

  actualizarTableroHTML() {
    const celdas = this.tableroRef.nativeElement.querySelectorAll('input');
    let i = 0;
    let j = 0;
    celdas.forEach(celda => {
      celda.value = this.matriz[i][j].valor[0] ? String(this.matriz[i][j].valor[0]) : "";
      if (++j > 8) {
        j = 0;
        i++;
      }
    });
  }

  insertarEnMasks(bit: number, row: number, col: number): void {
    const i_bloque = Math.trunc(row / 3) * 3 + Math.trunc(col / 3);
    this.rowMask[row] |= bit;
    this.colMask[col] |= bit;
    this.bloqueMask[i_bloque] |= bit;
  }

  quitarDeMasks(bit: number, row: number, col: number): void {
    const i_bloque = Math.trunc(row / 3) * 3 + Math.trunc(col / 3);
    this.rowMask[row] &= ~bit;
    this.colMask[col] &= ~bit;
    this.bloqueMask[i_bloque] &= ~bit;
  }

  mostrarPopup(pregunta: string, flag: boolean): void {
    if (this.temporizador) {
      this.pausar();
    }
    (this.popupDialog.nativeElement.firstChild as HTMLHRElement).innerHTML = pregunta;
    this.popupDialog.nativeElement.showModal();
    this.flagDialogOperacion = flag;
  }

  operacionPopup() {
    if (this.flagDialogOperacion) this.reiniciarSudoku();
    else this.resolverSudoku();
    this.popupDialog.nativeElement.close();
  }

  quitarPintado() {
    this.rowResaltada = -1;
    this.colResaltada = -1;
  }

  pintarCeldas(event: FocusEvent) {
    const target = event.target as HTMLInputElement;
    this.rowResaltada = parseInt(target.dataset['row'] || '-1');
    this.colResaltada = parseInt(target.dataset['col'] || '-1');
  }

}
