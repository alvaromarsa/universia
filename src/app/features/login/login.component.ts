import { ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { FormUtils } from '@shared/utils/form-utils';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'login-component',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {

  formUtils = FormUtils;
  isSubmitting = false;

    loginForm: FormGroup = this.fb.group({

      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]

    })

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) { }

  isValidField(field: string): boolean | null {
  return FormUtils.isValidField(this.loginForm, field);

  }

  getFieldError(field: string): string | null {
  return FormUtils.getFieldError(this.loginForm, field);
  }

  onSubmit() {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).then(() => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      }).catch(error => {
        console.error('Login error:', error);
        this.notificationService.error(this.getFriendlyLoginErrorMessage(error));
      }).finally(() => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      });
  }

  private getFriendlyLoginErrorMessage(error: unknown): string {
    const errorCode = this.getAuthErrorCode(error);

    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-email':
        return 'Credenciales incorrectas. Revisa el correo y la contrasena.';
      case 'auth/too-many-requests':
        return 'Has realizado demasiados intentos. Espera un momento antes de volver a intentarlo.';
      case 'auth/network-request-failed':
        return 'No se pudo conectar. Comprueba tu conexion a Internet.';
      default:
        return 'No se pudo iniciar sesion. Intentalo de nuevo en unos minutos.';
    }
  }

  private getAuthErrorCode(error: unknown): string | null {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return null;
    }

    return typeof error.code === 'string' ? error.code : null;
  }

}
