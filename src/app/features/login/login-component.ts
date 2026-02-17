import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { FormUtils } from '../../shared/utils/form-utils';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'login-component',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {

  formUtils = FormUtils;

    loginForm: FormGroup = this.fb.group({

      name: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]

    })

  constructor(private fb: FormBuilder) { }

  isValidField(field: string): boolean | null {
    console.log(this.loginForm);
  return FormUtils.isValidField(this.loginForm, field);

  }

  getFieldError(field: string): string | null {
  return FormUtils.getFieldError(this.loginForm, field);
  }


}
