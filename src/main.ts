import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { MiAppComponent } from './app/mi-app.component';

bootstrapApplication(MiAppComponent, appConfig)
  .catch((err) => console.error(err));
