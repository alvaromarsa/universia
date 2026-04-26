/// <reference types="jasmine" />

import {
  HttpErrorResponse,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';

import { LoadingService } from '../services/loading.service';
import { LoadingInterceptor } from './loading.interceptor';

describe('LoadingInterceptor', () => {
  let interceptor: LoadingInterceptor;
  let loadingService: jasmine.SpyObj<LoadingService>;

  const request = new HttpRequest('GET', '/test-endpoint');

  beforeEach(() => {
    loadingService = jasmine.createSpyObj<LoadingService>('LoadingService', ['start', 'stop']);
    interceptor = new LoadingInterceptor(loadingService);
  });

  it('should start loading before delegating the request', (done) => {
    const handler: HttpHandler = {
      handle: () => {
        expect(loadingService.start).toHaveBeenCalledOnceWith();
        expect(loadingService.stop).not.toHaveBeenCalled();
        return of(new HttpResponse({ status: 200, body: { ok: true } }));
      },
    };

    interceptor.intercept(request, handler).subscribe({
      next: () => {
        expect(loadingService.stop).not.toHaveBeenCalled();
      },
      complete: () => {
        queueMicrotask(() => {
          expect(loadingService.stop).toHaveBeenCalledOnceWith();
          done();
        });
      },
      error: done.fail,
    });
  });

  it('should stop loading when the request errors', (done) => {
    const httpError = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
      url: '/test-endpoint',
    });

    const handler: HttpHandler = {
      handle: () => throwError(() => httpError),
    };

    interceptor.intercept(request, handler).subscribe({
      next: () => done.fail('Expected an error response'),
      error: (error) => {
        expect(error).toBe(httpError);
        expect(loadingService.start).toHaveBeenCalledOnceWith();
        expect(loadingService.stop).not.toHaveBeenCalled();

        queueMicrotask(() => {
          expect(loadingService.stop).toHaveBeenCalledOnceWith();
          done();
        });
      },
    });
  });

  it('should stop loading when the request subscription is cancelled', () => {
    const response$ = new Subject<HttpResponse<unknown>>();
    const handler: HttpHandler = {
      handle: () => response$,
    };

    const subscription = interceptor.intercept(request, handler).subscribe();

    expect(loadingService.start).toHaveBeenCalledOnceWith();
    expect(loadingService.stop).not.toHaveBeenCalled();

    subscription.unsubscribe();

    expect(loadingService.stop).toHaveBeenCalledOnceWith();
  });
});
