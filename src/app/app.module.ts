import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NavbarComponent } from './widgets/navbar/navbar.component';
import { CarouselComponent } from './widgets/carousel/carousel.component';
import { ContactFormComponent } from './widgets/contact-form/contact-form.component';
import { ThemeService } from './services/theme.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,

    NavbarComponent,
    CarouselComponent,
    ContactFormComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
