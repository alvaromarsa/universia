import { ChangeDetectionStrategy, Component} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { FormUtils } from '@shared/utils/form-utils';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

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

    loginForm: FormGroup = this.fb.group({

      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]

    })

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  isValidField(field: string): boolean | null {
  return FormUtils.isValidField(this.loginForm, field);

  }

  getFieldError(field: string): string | null {
  return FormUtils.getFieldError(this.loginForm, field);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).then(() => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      }).catch(error => {
        console.error('Login error:', error);
        alert('Error en el login: ' + error.message);
      });
    }
  }

}
