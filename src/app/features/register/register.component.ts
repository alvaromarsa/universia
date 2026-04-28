import { ChangeDetectionStrategy, Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';


import { FormUtils } from '@shared/utils/form-utils';
import { AuthService } from 'src/app/core/services/auth.service';

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
      alert('Algo ha fallado en el despegue: ' + error);
    } finally {
      this.isSubmitting = false;
    }
  }
}
