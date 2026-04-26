/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { User } from '@angular/fire/auth';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { firstValueFrom, isObservable, of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { guestGuard } from './guest.guard';

describe('guestGuard', () => {
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

  async function executeGuard(): Promise<boolean | UrlTree> {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as never, {} as never));

    if (isObservable(result)) {
      return firstValueFrom(result);
    }

    return Promise.resolve(result);
  }

  it('should allow navigation when the user is not authenticated', async () => {
    configureTestingModule(null);

    await expectAsync(executeGuard()).toBeResolvedTo(true);
  });

  it('should redirect authenticated users to profile', async () => {
    const router = configureTestingModule({ uid: 'user-1' } as User);

    const result = await executeGuard();

    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toBe('/profile');
  });
});
