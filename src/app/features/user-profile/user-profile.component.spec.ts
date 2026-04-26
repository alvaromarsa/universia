/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AuthService, UserProfile } from 'src/app/core/services/auth.service';
import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent', () => {
  let authServiceStub: {
    userProfile$: BehaviorSubject<UserProfile | null>;
    logout: jasmine.Spy<() => Promise<void>>;
    updateUserDisplayName: jasmine.Spy<(displayName: string) => Promise<void>>;
  };

  beforeEach(async () => {
    authServiceStub = {
      userProfile$: new BehaviorSubject<UserProfile | null>(buildUserProfile()),
      logout: jasmine.createSpy('logout').and.resolveTo(),
      updateUserDisplayName: jasmine.createSpy('updateUserDisplayName').and.resolveTo(),
    };

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceStub },
      ],
    }).compileComponents();
  });

  it('should render the current user profile data', () => {
    const fixture = TestBed.createComponent(UserProfileComponent);
    fixture.detectChanges();

    const textContent = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(textContent).toContain('Panel de Usuario');
    expect(textContent).toContain('Ada Lovelace');
    expect(textContent).toContain('ada@universia.dev');
    expect(textContent).toContain('Capitana');
  });

  it('should start and cancel display name editing', () => {
    const fixture = TestBed.createComponent(UserProfileComponent);
    const component = fixture.componentInstance;

    component.startDisplayNameEdit('Ada Lovelace');

    expect(component.isEditingDisplayName).toBeTrue();
    expect(component.displayNameDraft).toBe('Ada Lovelace');
    expect(component.displayNameError).toBe('');

    component.cancelDisplayNameEdit();

    expect(component.isEditingDisplayName).toBeFalse();
    expect(component.displayNameDraft).toBe('');
    expect(component.displayNameError).toBe('');
  });

  it('should reject an empty display name before calling the service', async () => {
    const fixture = TestBed.createComponent(UserProfileComponent);
    const component = fixture.componentInstance;

    component.startDisplayNameEdit('Ada Lovelace');
    component.displayNameDraft = '   ';

    await component.saveDisplayName();

    expect(authServiceStub.updateUserDisplayName).not.toHaveBeenCalled();
    expect(component.displayNameError).toBe('Introduce un nombre de usuario valido.');
    expect(component.isSavingDisplayName).toBeFalse();
    expect(component.isEditingDisplayName).toBeTrue();
  });

  it('should save the trimmed display name and exit edit mode', async () => {
    const fixture = TestBed.createComponent(UserProfileComponent);
    const component = fixture.componentInstance;

    component.startDisplayNameEdit('Ada Lovelace');
    component.displayNameDraft = '  Comandante Ada  ';

    await component.saveDisplayName();

    expect(authServiceStub.updateUserDisplayName).toHaveBeenCalledOnceWith('Comandante Ada');
    expect(component.isSavingDisplayName).toBeFalse();
    expect(component.displayNameError).toBe('');
    expect(component.isEditingDisplayName).toBeFalse();
  });

  it('should show an error and keep edit mode when saving the display name fails', async () => {
    authServiceStub.updateUserDisplayName.and.rejectWith(new Error('write failed'));
    spyOn(console, 'error');

    const fixture = TestBed.createComponent(UserProfileComponent);
    const component = fixture.componentInstance;

    component.startDisplayNameEdit('Ada Lovelace');
    component.displayNameDraft = 'Ada Nova';

    await component.saveDisplayName();

    expect(authServiceStub.updateUserDisplayName).toHaveBeenCalledOnceWith('Ada Nova');
    expect(component.isEditingDisplayName).toBeTrue();
    expect(component.isSavingDisplayName).toBeFalse();
    expect(component.displayNameError).toBe('No se pudo actualizar el nombre de usuario.');
    expect(console.error).toHaveBeenCalled();
  });

  it('should logout and render the logged out confirmation state', async () => {
    const fixture = TestBed.createComponent(UserProfileComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    await component.logout();
    fixture.detectChanges();

    const textContent = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(authServiceStub.logout).toHaveBeenCalledOnceWith();
    expect(component.isLoggedOut).toBeTrue();
    expect(textContent).toContain('Sesión cerrada con éxito');
    expect(textContent).toContain('Volver al Home');
  });
});

function buildUserProfile(): UserProfile {
  return {
    uid: 'user-1',
    email: 'ada@universia.dev',
    displayName: 'Ada Lovelace',
    rango: 'Capitana',
  };
}
