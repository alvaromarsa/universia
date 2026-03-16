import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


import { FormUtils } from '@shared/utils/form-utils';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {

  // Hacemos pública la clase para usarla directamente en el HTML si quieres
  public formUtils = FormUtils;

  constructor(private fb: FormBuilder) {}


    registerForm: FormGroup = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rango: ['cadete', [Validators.required]]
    });

  registrarPiloto() {
    if (this.registerForm.valid) {
      console.log('🚀 Nuevo recluta registrado:', this.registerForm.value);
      // Aquí podrías navegar al login después de registrar
    }
  }
}
