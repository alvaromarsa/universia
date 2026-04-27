import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, updateProfile } from '@angular/fire/auth';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

import { environment } from '@env/environment';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  rango: string;
}

type StoredUserProfile = Pick<UserProfile, 'displayName' | 'rango'>;

@Injectable({
  providedIn: 'root' // Esto lo hace disponible en toda la app
})
export class AuthService {
  private readonly profileDebugEnabled = !environment.production;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly profileRefresh$ = new BehaviorSubject(0);

  // Observable para saber en todo momento si el usuario está logueado o no
  user$: Observable<User | null>;
  userProfile$: Observable<UserProfile | null>;

  constructor(
    private auth: Auth
  ) {
    this.user$ = this.observeCurrentUser().pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.userProfile$ = combineLatest([this.user$, this.profileRefresh$]).pipe(
      map(([currentUser]) => {
        if (!currentUser) {
          this.logProfileDebug('No hay usuario autenticado; el perfil queda en null');
          return null;
        }

        const storedProfile = this.readStoredProfile(currentUser.uid);

        const resolvedProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email ?? '',
          displayName: storedProfile?.displayName ?? currentUser.displayName ?? '',
          rango: storedProfile?.rango ?? '',
        };

        this.logProfileDebug('Perfil resuelto desde Firebase Auth y localStorage', resolvedProfile);

        return resolvedProfile;
      }),
      tap((profile) => {
        this.logProfileDebug('Emitiendo perfil al resto de la app', profile);
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  // 1. Registro de nuevos usuarios
  async register(email: string, pass: string, name: string, rango: string) {
    this.logProfileDebug('Inicio de registro de usuario', {
      email,
      displayName: name,
      rango,
      network: this.getNetworkDebugInfo(),
    });

    const userCredential = await this.createUserCredential(email, pass);
    await this.updateFirebaseProfile(userCredential.user, { displayName: name });

    this.writeStoredProfile(userCredential.user.uid, {
      displayName: name,
      rango,
    });
    this.notifyProfileRefresh();
    this.logProfileDebug('Perfil local guardado tras registro', {
      uid: userCredential.user.uid,
      displayName: name,
      rango,
    });

    return userCredential;
  }

  // 2. Login de usuarios existentes
  async login(email: string, pass: string) {
    const userCredential = await this.signInUserCredential(email, pass);
    await userCredential.user.reload();

    const refreshedUser = this.auth.currentUser ?? userCredential.user;
    const storedProfile = this.readStoredProfile(refreshedUser.uid);

    this.writeStoredProfile(refreshedUser.uid, {
      displayName: storedProfile?.displayName ?? refreshedUser.displayName ?? '',
      rango: storedProfile?.rango ?? '',
    });
    this.notifyProfileRefresh();

    this.logProfileDebug('Perfil local hidratado tras login', {
      uid: refreshedUser.uid,
      displayName: storedProfile?.displayName ?? refreshedUser.displayName ?? '',
      rango: storedProfile?.rango ?? '',
    });

    return userCredential;
  }

  // 3. Cerrar sesión
  logout() {
    return this.signOutFromAuth();
  }

  async updateUserDisplayName(displayName: string): Promise<void> {
    const trimmedDisplayName = displayName.trim();
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      throw new Error('No hay un usuario autenticado.');
    }

    if (!trimmedDisplayName) {
      throw new Error('El nombre de usuario no puede estar vacio.');
    }

    await this.updateFirebaseProfile(currentUser, { displayName: trimmedDisplayName });

    const storedProfile = this.readStoredProfile(currentUser.uid);
    this.writeStoredProfile(currentUser.uid, {
      displayName: trimmedDisplayName,
      rango: storedProfile?.rango ?? '',
    });
    this.notifyProfileRefresh();

    this.logProfileDebug('Nombre de usuario actualizado', {
      uid: currentUser.uid,
      displayName: trimmedDisplayName,
    });
  }

  private storageKey(uid: string): string {
    return `universia_user_profile_${uid}`;
  }

  private observeCurrentUser() {
    return user(this.auth);
  }

  private createUserCredential(email: string, pass: string) {
    return createUserWithEmailAndPassword(this.auth, email, pass);
  }

  private signInUserCredential(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  private signOutFromAuth() {
    return signOut(this.auth);
  }

  private updateFirebaseProfile(currentUser: User, profile: { displayName: string }) {
    return updateProfile(currentUser, profile);
  }

  private readStoredProfile(uid: string): StoredUserProfile | null {
    if (!this.isBrowser || !uid) {
      return null;
    }

    try {
      const storedProfile = localStorage.getItem(this.storageKey(uid));
      if (!storedProfile) {
        return null;
      }

      return JSON.parse(storedProfile) as StoredUserProfile;
    } catch (error) {
      this.logProfileDebug('No se pudo leer el perfil desde localStorage', {
        uid,
        error,
      });
      return null;
    }
  }

  private writeStoredProfile(uid: string, profile: StoredUserProfile): void {
    if (!this.isBrowser || !uid) {
      return;
    }

    try {
      localStorage.setItem(this.storageKey(uid), JSON.stringify(profile));
    } catch (error) {
      this.logProfileDebug('No se pudo guardar el perfil en localStorage', {
        uid,
        error,
      });
    }
  }

  private notifyProfileRefresh(): void {
    this.profileRefresh$.next(this.profileRefresh$.value + 1);
  }

  private logProfileDebug(message: string, payload?: unknown): void {
    if (!this.profileDebugEnabled) {
      return;
    }

    if (payload === undefined) {
      console.log('[AuthService][profile-debug]', message);
      return;
    }

    console.log('[AuthService][profile-debug]', message, payload);
  }

  private getNetworkDebugInfo(): { online: boolean | null; hasNavigator: boolean } {
    if (typeof navigator === 'undefined') {
      return {
        online: null,
        hasNavigator: false,
      };
    }

    return {
      online: navigator.onLine,
      hasNavigator: true,
    };
  }

}
