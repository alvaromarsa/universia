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
    try {
      const user = await this.authService.register(this.registerForm.value.email, this.registerForm.value.password, this.registerForm.value.nombre);
      console.log('🚀 Usuario creado con éxito:', user);
      // Guardar el rango en localStorage
      localStorage.setItem('userRank', this.registerForm.value.rango);
      // Si todo va bien, mandamos al usuario a la página de home
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('❌ Error al registrar:', error);
      alert('Algo ha fallado en el despegue: ' + error);
    }
  }
}
