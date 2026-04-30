/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Auth, User, UserCredential } from '@angular/fire/auth';
import { BehaviorSubject, firstValueFrom, Observable, take } from 'rxjs';

import { AuthService } from './auth.service';

type AuthServiceTestSeams = {
  observeCurrentUser(): Observable<User | null>;
  createUserCredential(email: string, pass: string): Promise<UserCredential>;
  signInUserCredential(email: string, pass: string): Promise<UserCredential>;
  signOutFromAuth(): Promise<void>;
  updateFirebaseProfile(currentUser: User, profile: { displayName: string }): Promise<void>;
};

describe('AuthService', () => {
  let service: AuthService;
  let authState$: BehaviorSubject<User | null>;
  let authStub: Partial<Auth> & { currentUser: User | null };

  beforeEach(() => {
    localStorage.clear();
    authState$ = new BehaviorSubject<User | null>(null);
    authStub = {
      currentUser: null,
      onIdTokenChanged: (next: (user: User | null) => void) => {
        const subscription = authState$.subscribe(next);
        return () => subscription.unsubscribe();
      },
    } as Partial<Auth> & { currentUser: User | null };

    const authServicePrototypeSeams = AuthService.prototype as unknown as AuthServiceTestSeams;

    spyOn(authServicePrototypeSeams, 'observeCurrentUser').and.returnValue(authState$.asObservable());
    spyOn(console, 'log');

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Auth, useValue: authStub },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should emit null profile when there is no authenticated user', async () => {
    const profile = await firstValueFrom(service.userProfile$.pipe(take(1)));

    expect(profile).toBeNull();
  });

  it('should resolve the profile from Firebase Auth and localStorage', async () => {
    const firebaseUser = {
      uid: 'user-1',
      email: 'astro@universia.dev',
      displayName: 'Firebase Name',
    } as User;

    localStorage.setItem(
      'universia_user_profile_user-1',
      JSON.stringify({ displayName: 'Local Name', rango: 'Capitana' })
    );
    authState$.next(firebaseUser);

    const profile = await firstValueFrom(service.userProfile$.pipe(take(1)));

    expect(profile).toEqual({
      uid: 'user-1',
      email: 'astro@universia.dev',
      displayName: 'Local Name',
      rango: 'Capitana',
    });
  });

  it('should register a user, update the display name, and persist the local profile', async () => {
    const authServiceSeams = service as unknown as AuthServiceTestSeams;
    const createdUser = {
      uid: 'user-2',
      email: 'new@universia.dev',
      displayName: '',
    } as User;
    const userCredential = {
      user: createdUser,
      providerId: 'password',
      operationType: 'signIn',
    } as UserCredential;

    const createUserSpy = spyOn(authServiceSeams, 'createUserCredential').and.resolveTo(userCredential);
    const updateProfileSpy = spyOn(authServiceSeams, 'updateFirebaseProfile').and.resolveTo();

    const result = await service.register('new@universia.dev', 'secret', 'Nova', 'Exploradora');

    expect(result).toBe(userCredential);
    expect(createUserSpy).toHaveBeenCalledOnceWith('new@universia.dev', 'secret');
    expect(updateProfileSpy).toHaveBeenCalledOnceWith(createdUser, { displayName: 'Nova' });
    expect(localStorage.getItem('universia_user_profile_user-2')).toBe(
      JSON.stringify({ displayName: 'Nova', rango: 'Exploradora' })
    );
  });

  it('should login, reload the user, and persist the hydrated local profile', async () => {
    const authServiceSeams = service as unknown as AuthServiceTestSeams;
    const reloadedUser = {
      uid: 'user-3',
      email: 'pilot@universia.dev',
      displayName: 'Pilot Name',
      reload: jasmine.createSpy('reload').and.resolveTo(),
    } as unknown as User;
    const userCredential = {
      user: reloadedUser,
      providerId: 'password',
      operationType: 'signIn',
    } as UserCredential;

    localStorage.setItem(
      'universia_user_profile_user-3',
      JSON.stringify({ displayName: 'Local Pilot', rango: 'Comandante' })
    );

    const loginSpy = spyOn(authServiceSeams, 'signInUserCredential').and.resolveTo(userCredential);

    const result = await service.login('pilot@universia.dev', 'secret');

    expect(result).toBe(userCredential);
    expect(loginSpy).toHaveBeenCalledOnceWith('pilot@universia.dev', 'secret');
    expect(reloadedUser.reload).toHaveBeenCalled();
    expect(localStorage.getItem('universia_user_profile_user-3')).toBe(
      JSON.stringify({ displayName: 'Local Pilot', rango: 'Comandante' })
    );
  });

  it('should throw when updating the display name without an authenticated user', async () => {
    await expectAsync(service.updateUserDisplayName('Nova')).toBeRejectedWithError(
      'No hay un usuario autenticado.'
    );
  });

  it('should trim and persist the updated display name while preserving rango', async () => {
    const authServiceSeams = service as unknown as AuthServiceTestSeams;
    const currentUser = {
      uid: 'user-4',
      displayName: 'Old Name',
    } as User;

    authStub.currentUser = currentUser;
    localStorage.setItem(
      'universia_user_profile_user-4',
      JSON.stringify({ displayName: 'Old Name', rango: 'Ingeniera' })
    );

    const updateProfileSpy = spyOn(authServiceSeams, 'updateFirebaseProfile').and.resolveTo();

    await service.updateUserDisplayName('  Nova Prime  ');

    expect(updateProfileSpy).toHaveBeenCalledOnceWith(currentUser, { displayName: 'Nova Prime' });
    expect(localStorage.getItem('universia_user_profile_user-4')).toBe(
      JSON.stringify({ displayName: 'Nova Prime', rango: 'Ingeniera' })
    );
  });

  it('should delegate logout to Firebase Auth signOut', async () => {
    const authServiceSeams = service as unknown as AuthServiceTestSeams;
    const signOutSpy = spyOn(authServiceSeams, 'signOutFromAuth').and.resolveTo();

    await service.logout();

    expect(signOutSpy).toHaveBeenCalledOnceWith();
  });
});
