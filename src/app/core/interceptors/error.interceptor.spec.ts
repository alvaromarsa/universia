/// <reference types="jasmine" />

import {
  HttpErrorResponse,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';
import { ErrorInterceptor } from './error.interceptor';

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let consoleErrorSpy: jasmine.Spy;

  const request = new HttpRequest('GET', '/test-endpoint');

  beforeEach(() => {
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['error']);
    interceptor = new ErrorInterceptor(notificationService);
    consoleErrorSpy = spyOn(console, 'error');
  });

  it('should pass through successful responses without notifying', (done) => {
    const handler: HttpHandler = {
      handle: () => of(new HttpResponse({ status: 200, body: { ok: true } })),
    };

    interceptor.intercept(request, handler).subscribe({
      next: (event) => {
        expect(event).toEqual(jasmine.any(HttpResponse));
        expect(notificationService.error).not.toHaveBeenCalled();
        expect(consoleErrorSpy).not.toHaveBeenCalled();
        done();
      },
      error: done.fail,
    });
  });

  it('should notify a client-side error message and rethrow the error', (done) => {
    const clientError = new HttpErrorResponse({
      error: new ErrorEvent('NetworkError', { message: 'Fallo del navegador' }),
      status: 0,
    });

    const handler: HttpHandler = {
      handle: () => throwError(() => clientError),
    };

    interceptor.intercept(request, handler).subscribe({
      next: () => done.fail('Expected an error response'),
      error: (error) => {
        expect(error).toBe(clientError);
        expect(notificationService.error).toHaveBeenCalledOnceWith('Error: Fallo del navegador');
        expect(consoleErrorSpy).toHaveBeenCalledOnceWith('Error HTTP interceptado:', clientError);
        done();
      },
    });
  });

  const serverErrorCases = [
    [0, 'Unknown Error', '❌ Error de conexión. Verifica tu conexión a internet.'],
    [400, 'Bad Request', '❌ Solicitud inválida. Por favor, verifica los datos.'],
    [401, 'Unauthorized', '❌ No autorizado. Por favor, inicia sesión.'],
    [403, 'Forbidden', '❌ Acceso denegado. No tienes permiso para acceder a este recurso.'],
    [404, 'Not Found', '❌ Recurso no encontrado. La misión ha fracasado.'],
    [500, 'Server Error', '❌ Error del servidor. Por favor, intenta más tarde.'],
    [503, 'Service Unavailable', '❌ Servicio no disponible. Por favor, intenta más tarde.'],
  ] as const;

  serverErrorCases.forEach(([status, statusText, expectedMessage]) => {
    it(`should notify the mapped message for HTTP ${status}`, (done) => {
      const serverError = new HttpErrorResponse({
        status,
        statusText,
        url: '/test-endpoint',
      });

      const handler: HttpHandler = {
        handle: () => throwError(() => serverError),
      };

      interceptor.intercept(request, handler).subscribe({
        next: () => done.fail('Expected an error response'),
        error: (error) => {
          expect(error).toBe(serverError);
          expect(notificationService.error).toHaveBeenCalledOnceWith(expectedMessage);
          expect(consoleErrorSpy).toHaveBeenCalledOnceWith('Error HTTP interceptado:', serverError);
          done();
        },
      });
    });
  });

  it('should notify a fallback message for unmapped HTTP status codes', (done) => {
    const serverError = new HttpErrorResponse({
      status: 418,
      statusText: `I'm a teapot`,
      url: '/test-endpoint',
    });

    const handler: HttpHandler = {
      handle: () => throwError(() => serverError),
    };

    interceptor.intercept(request, handler).subscribe({
      next: () => done.fail('Expected an error response'),
      error: (error) => {
        expect(error).toBe(serverError);
        expect(notificationService.error).toHaveBeenCalledOnceWith("❌ Error 418: I'm a teapot");
        expect(consoleErrorSpy).toHaveBeenCalledOnceWith('Error HTTP interceptado:', serverError);
        done();
      },
    });
  });
});
