import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user, updateProfile } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Esto lo hace disponible en toda la app
})
export class AuthService {

  // Observable para saber en todo momento si el usuario está logueado o no
  user$: Observable<any>;

  constructor(private auth: Auth) {
    this.user$ = user(this.auth);
  }

  // 1. Registro de nuevos usuarios
  async register(email: string, pass: string, name: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
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
