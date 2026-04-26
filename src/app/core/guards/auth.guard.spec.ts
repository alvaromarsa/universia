/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { User } from '@angular/fire/auth';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  function configureTestingModule(user: User | null): Router {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user$: of(user),
          },
        },
      ],
    });

    return TestBed.inject(Router);
  }

  async function executeGuard(url = '/favorites'): Promise<boolean | UrlTree> {
    const result = TestBed.runInInjectionContext(() => authGuard({} as never, { url } as never));

    if (isObservable(result)) {
      return firstValueFrom(result);
    }

    return Promise.resolve(result);
  }

  it('should allow navigation when the user is authenticated', async () => {
    configureTestingModule({ uid: 'user-1' } as User);

    await expectAsync(executeGuard()).toBeResolvedTo(true);
  });

  it('should redirect to login with returnUrl when the user is not authenticated', async () => {
    const router = configureTestingModule(null);

    const result = await executeGuard('/favorites');

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/login?returnUrl=%2Ffavorites');
  });
});
