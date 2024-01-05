import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { provideRouter } from '@angular/router';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
