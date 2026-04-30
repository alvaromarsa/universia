import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private readonly notificationService: NotificationService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (isPlatformBrowser(this.platformId)) {
          console.error('Error HTTP interceptado:', error);
        }

        let errorMessage = 'Ha ocurrido un error en la misión.';

        if (this.isBrowserErrorEvent(error.error)) {
          // Error del cliente
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Error del servidor
          switch (error.status) {
            case 0:
              errorMessage = '❌ Error de conexión. Verifica tu conexión a internet.';
              break;
            case 400:
              errorMessage = '❌ Solicitud inválida. Por favor, verifica los datos.';
              break;
            case 401:
              errorMessage = '❌ No autorizado. Por favor, inicia sesión.';
              break;
            case 403:
              errorMessage = '❌ Acceso denegado. No tienes permiso para acceder a este recurso.';
              break;
            case 404:
              errorMessage = '❌ Recurso no encontrado. La misión ha fracasado.';
              break;
            case 500:
              errorMessage = '❌ Error del servidor. Por favor, intenta más tarde.';
              break;
            case 503:
              errorMessage = '❌ Servicio no disponible. Por favor, intenta más tarde.';
              break;
            default:
              errorMessage = `❌ Error ${error.status}: ${error.statusText || 'Error desconocido'}`;
          }
        }

        if (isPlatformBrowser(this.platformId)) {
          this.notificationService.error(errorMessage);
        }

        return throwError(() => error);
      })
    );
  }

  private isBrowserErrorEvent(value: unknown): value is ErrorEvent {
    return typeof ErrorEvent !== 'undefined' && value instanceof ErrorEvent;
  }
}
