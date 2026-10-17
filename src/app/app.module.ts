import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { NavbarComponent } from './widgets/navbar/navbar.component';
import { CarouselComponent } from './widgets/carousel/carousel.component';
import { ContactFormComponent } from './widgets/contact-form/contact-form.component';
import { SnakeCursorComponent } from './widgets/snake-cursor/snake-cursor.component';
import { LangSuggestComponent } from './widgets/lang-suggest/lang-suggest.component';
import { TranslatePipe } from './i18n/translate.pipe';

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
    ContactFormComponent,
    SnakeCursorComponent,
    LangSuggestComponent,
    TranslatePipe
  ],
  // Reuse the prerendered DOM instead of discarding and re-rendering it on startup.
  providers: [provideClientHydration(withEventReplay())],
  bootstrap: [AppComponent]
})
export class AppModule { }
