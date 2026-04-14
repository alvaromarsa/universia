import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    provideAnimations(),
    provideFirebaseApp(() =>
      initializeApp({
        "projectId":"universia-ac877",
        "appId":"1:586668173942:web:f64c034014c0b2d6fe0d57",
        "storageBucket":"universia-ac877.firebasestorage.app",
        "apiKey":"AIzaSyDO1KMunzOP66jgGb1qNhhmFMdc_B5DqO4",
        "authDomain":"universia-ac877.firebaseapp.com",
        "messagingSenderId":"586668173942",
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())],
};
