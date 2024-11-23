// Angular 16(含以前) 預設
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

// Angular 17 新作法 預設Standalone專案 不使用app.module.ts
// import { AppComponent } from './app/app.component';
// import { AppModule } from './app/app.module';
// import { appConfig } from './app/app.config';
// import { bootstrapApplication } from '@angular/platform-browser';
//
// bootstrapApplication(AppComponent, appConfig)
//   .catch((err) => console.error(err));
