import { Injectable } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

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
          return of(null);
        }

        const baseProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email ?? '',
          displayName: currentUser.displayName ?? '',
          rango: 'cadete',
        };

        const userProfileRef = doc(this.firestore, `users/${currentUser.uid}`);
        return docData(userProfileRef).pipe(
          map((profile) => {
            const firestoreProfile = profile as Partial<UserProfile> | undefined;

            return {
              uid: currentUser.uid,
              email: firestoreProfile?.email ?? baseProfile.email,
              displayName: firestoreProfile?.displayName ?? baseProfile.displayName,
              rango: firestoreProfile?.rango ?? baseProfile.rango,
            } satisfies UserProfile;
          }),
          startWith(baseProfile)
        );
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  // 1. Registro de nuevos usuarios
  async register(email: string, pass: string, name: string, rango: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    await setDoc(doc(this.firestore, `users/${userCredential.user.uid}`), {
      uid: userCredential.user.uid,
      email,
      displayName: name,
      rango,
    });
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
}
