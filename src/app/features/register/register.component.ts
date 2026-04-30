import { ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';


import { FormUtils } from '@shared/utils/form-utils';
import { AuthService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {

  // Hacemos pública la clase para usarla directamente en el HTML
  public formUtils = FormUtils;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}


    registerForm: FormGroup = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rango: ['cadete', [Validators.required]]
    });

async onRegister() {
    if (this.registerForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      await this.authService.register(
        this.registerForm.value.email,
        this.registerForm.value.password,
        this.registerForm.value.nombre,
        this.registerForm.value.rango
      );
      // Si todo va bien, mandamos al usuario a su perfil
      this.router.navigate(['/profile']);
    } catch (error) {
      console.error('❌ Error al registrar:', error);
      this.notificationService.error(this.getFriendlyRegisterErrorMessage(error));
    } finally {
      this.isSubmitting = false;
      this.cdr.markForCheck();
    }
  }

  private getFriendlyRegisterErrorMessage(error: unknown): string {
    const errorCode = this.getAuthErrorCode(error);

    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Ese correo ya esta registrado. Prueba con otro o inicia sesion.';
      case 'auth/invalid-email':
        return 'Introduce un correo valido.';
      case 'auth/weak-password':
        return 'La contrasena es demasiado debil. Usa al menos 6 caracteres.';
      case 'auth/network-request-failed':
        return 'No se pudo conectar. Comprueba tu conexion a Internet.';
      case 'auth/too-many-requests':
        return 'Has realizado demasiados intentos. Espera un momento antes de volver a intentarlo.';
      default:
        return 'No se pudo completar el registro. Intentalo de nuevo en unos minutos.';
    }
  }

  private getAuthErrorCode(error: unknown): string | null {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return null;
    }

    return typeof error.code === 'string' ? error.code : null;
  }
}
