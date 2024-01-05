import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { AnotherPageComponent } from './another-page/another-page.component';
import { appConfig } from './app.config';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MenuComponent,
    AnotherPageComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
