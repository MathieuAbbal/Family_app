import { enableProdMode, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import * as fr from '@angular/common/locales/fr';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing';
import { environment } from './environments/environment';

import { AuthService } from './app/services/auth.service';
import { AuthGuardService } from './app/services/auth-guard.service';
import { TasksService } from './app/services/tasks.service';
import { PhotosService } from './app/services/photos.service';
import { EditProfileService } from './app/user/edit-profile.service';

registerLocaleData(fr.default);

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(
      MatSnackBarModule,
      MatDialogModule,
      ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: environment.production,
        registrationStrategy: 'registerWhenStable:30000'
      })
    ),
    AuthService,
    AuthGuardService,
    TasksService,
    PhotosService,
    EditProfileService,
    { provide: LOCALE_ID, useValue: 'fr-FR' },
  ]
}).catch(err => console.error(err));
