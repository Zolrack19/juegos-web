import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cont-juegos',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './cont-juegos.component.html',
  styleUrl: './cont-juegos.component.css'
})
export class ContJuegosComponent {
  juegos = [
    {
      titulo: "Sudoku",
      imagen: "assets/logos-principal/sudoku.webp",
      descrp: "El tipico sudoku de toda la vida, no hay mucho que decir aquí",
      url: "sudoku"
    },
    {
      titulo: "Tres en Raya",
      imagen: "assets/logos-principal/tres-en-raya.webp",
      descrp: "Clásico tres en raya con modo offline nomás",
      url: "tres-en-raya"
    },
  ]
}
