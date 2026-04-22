import { Injectable } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  rango: string;
}

@Injectable({
  providedIn: 'root' // Esto lo hace disponible en toda la app
})
export class AuthService {
  private readonly profileDebugEnabled = true;
  private readonly profileWriteTimeoutMs = 1500;
  private readonly profileWriteMaxAttempts = 3;
  private readonly pendingUserProfiles = new Map<string, UserProfile>();
  private readonly repairedProfileIds = new Set<string>();

  // Observable para saber en todo momento si el usuario está logueado o no
  user$: Observable<User | null>;
  userProfile$: Observable<UserProfile | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.user$ = user(this.auth).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.userProfile$ = this.user$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          this.logProfileDebug('No hay usuario autenticado; el perfil queda en null');
          return of(null);
        }

        const baseProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email ?? '',
          displayName: currentUser.displayName ?? '',
          rango: '',
        };
        const pendingProfile = this.pendingUserProfiles.get(currentUser.uid);
        const fallbackProfile = pendingProfile ?? baseProfile;

        this.logProfileDebug('Usuario autenticado detectado; preparando lectura de perfil', {
          uid: currentUser.uid,
          email: baseProfile.email,
          displayName: baseProfile.displayName,
        });

        const userProfileRef = doc(this.firestore, `users/${currentUser.uid}`);
        return docData(userProfileRef).pipe(
          tap((profile) => {
            const firestoreProfile = profile as Partial<UserProfile> | undefined;

            this.logProfileDebug('Documento de perfil recibido desde Firestore', {
              uid: currentUser.uid,
              profile,
            });

            if (!firestoreProfile) {
              void this.repairMissingUserProfile(fallbackProfile);
              return;
            }

            this.pendingUserProfiles.delete(currentUser.uid);
          }),
          map((profile) => {
            const firestoreProfile = profile as Partial<UserProfile> | undefined;

            const resolvedProfile = {
              uid: currentUser.uid,
              email: firestoreProfile?.email ?? fallbackProfile.email,
              displayName: firestoreProfile?.displayName ?? fallbackProfile.displayName,
              rango: firestoreProfile?.rango ?? fallbackProfile.rango,
            } satisfies UserProfile;

            this.logProfileDebug('Perfil resuelto tras fusionar Auth y Firestore', resolvedProfile);

            return resolvedProfile;
          }),
          catchError((error) => {
            console.error('Error al cargar el perfil de usuario desde Firestore', error);
            this.logProfileDebug('Fallo leyendo el perfil; devolviendo perfil base', {
              uid: currentUser.uid,
              fallbackProfile,
              error,
            });
            return of(fallbackProfile);
          }),
          startWith(fallbackProfile),
          tap((profile) => {
            this.logProfileDebug('Emitiendo perfil al resto de la app', profile);
          })
        );
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
    });

    const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });

    const profile: UserProfile = {
      uid: userCredential.user.uid,
      email,
      displayName: name,
      rango,
    };

    this.logProfileDebug('Perfil preparado para persistencia tras registro', profile);
    this.pendingUserProfiles.set(profile.uid, profile);

    try {
      await this.persistUserProfileWithTimeout(profile);
    } catch (error) {
      console.error('Error al guardar el perfil del usuario en Firestore', error);
      this.logProfileDebug('Persistencia del perfil fallida tras registro', {
        uid: profile.uid,
        error,
      });
      throw error;
    }

    return userCredential;
  }

  // 2. Login de usuarios existentes
  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  // 3. Cerrar sesión
  logout() {
    return signOut(this.auth);
  }

  private async persistUserProfile(profile: UserProfile): Promise<void> {
    let lastError: unknown;

    for (let attempt = 0; attempt < this.profileWriteMaxAttempts; attempt += 1) {
      try {
        this.logProfileDebug('Intentando guardar perfil en Firestore', {
          attempt: attempt + 1,
          profile,
        });
        await setDoc(doc(this.firestore, `users/${profile.uid}`), profile);
        this.logProfileDebug('Perfil guardado correctamente en Firestore', {
          attempt: attempt + 1,
          uid: profile.uid,
          rango: profile.rango,
        });
        return;
      } catch (error) {
        lastError = error;
        this.logProfileDebug('Error al guardar perfil en Firestore', {
          attempt: attempt + 1,
          uid: profile.uid,
          error,
        });
      }
    }

    throw lastError;
  }

  private async persistUserProfileWithTimeout(profile: UserProfile): Promise<void> {
    let didTimeout = false;

    const persistPromise = this.persistUserProfile(profile)
      .then(() => {
        this.pendingUserProfiles.delete(profile.uid);
      })
      .catch((error) => {
        this.pendingUserProfiles.set(profile.uid, profile);
        throw error;
      });

    await Promise.race([
      persistPromise,
      this.wait(this.profileWriteTimeoutMs).then(() => {
        didTimeout = true;
      }),
    ]);

    if (didTimeout) {
      this.logProfileDebug('La persistencia del perfil sigue en curso; no se bloquea la redirección', {
        uid: profile.uid,
        rango: profile.rango,
      });
    }
  }

  private async repairMissingUserProfile(profile: UserProfile): Promise<void> {
    if (this.repairedProfileIds.has(profile.uid)) {
      return;
    }

    this.repairedProfileIds.add(profile.uid);

    try {
      this.logProfileDebug('Perfil inexistente en Firestore; creando documento base', profile);
      await setDoc(doc(this.firestore, `users/${profile.uid}`), profile, { merge: true });
      this.logProfileDebug('Documento base de perfil creado en Firestore', {
        uid: profile.uid,
      });
    } catch (error) {
      this.repairedProfileIds.delete(profile.uid);
      this.logProfileDebug('No se pudo crear el documento base del perfil', {
        uid: profile.uid,
        error,
      });
    }
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

  private wait(timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, timeoutMs);
    });
  }

}
