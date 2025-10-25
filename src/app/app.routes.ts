import { RouterModule, Routes } from '@angular/router';
import { SudokuComponent } from './features/sudoku/sudoku.component';
import { NgModule } from '@angular/core';
import { ContJuegosComponent } from './features/contenedor-principal/cont-juegos.component';
import { TresEnRayaComponent } from './features/tres-en-raya/tres-en-raya.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: ContJuegosComponent },
  { path: 'sudoku', component: SudokuComponent },
  { path: 'tres-en-raya', component: TresEnRayaComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
