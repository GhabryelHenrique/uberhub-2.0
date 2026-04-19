import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UiInputComponent } from '../../shared/ui-input/ui-input.component';
import { UiButtonComponent } from '../../shared/ui-button/ui-button.component';
import { AuthSidePanelComponent } from '../../shared/auth-side-panel/auth-side-panel.component';

const COMUNIDADE_IMAGES = [
  'assets/images/comunidade/1.png',
  'assets/images/comunidade/2.jpeg',
  'assets/images/comunidade/3.jpg',
  'assets/images/comunidade/4.jpg',
  'assets/images/comunidade/5.jpg',
  'assets/images/comunidade/6.jpg',
  'assets/images/comunidade/7.png',
  'assets/images/comunidade/8.png',
  'assets/images/comunidade/9.jpg',
  'assets/images/comunidade/10.jpg',
];

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiInputComponent, UiButtonComponent, AuthSidePanelComponent],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  sideImage = COMUNIDADE_IMAGES[Math.floor(Math.random() * COMUNIDADE_IMAGES.length)];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.registerForm.get('phone')!.valueChanges.subscribe((val: string) => {
      const formatted = this.applyPhoneMask(val ?? '');
      if (formatted !== val) {
        this.registerForm.get('phone')!.setValue(formatted, { emitEvent: false });
      }
    });
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?':{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;

    return !passwordValid ? { passwordStrength: true } : null;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  private applyPhoneMask(raw: string): string {
    let value = raw.replace(/\D/g, '').slice(0, 11);
    if (value.length <= 2) return value.replace(/^(\d{0,2})/, '($1');
    if (value.length <= 6) return value.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
    if (value.length <= 10) return value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    return value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      console.log('Register:', this.registerForm.value);

      // Simulando registro
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      }, 2000);
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.registerForm.get(field);

    if (control?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo de ${minLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      if (field === 'username') {
        return 'Use apenas letras, números e underline';
      }
      if (field === 'phone') {
        return 'Formato: (00) 00000-0000';
      }
    }
    if (control?.hasError('passwordStrength')) {
      return 'Senha deve conter maiúsculas, minúsculas, números e caracteres especiais';
    }
    if (control?.hasError('passwordMismatch')) {
      return 'As senhas não coincidem';
    }

    return '';
  }

  // Helper methods for password validation display
  hasUpperCase(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[A-Z]/.test(password);
  }

  hasLowerCase(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[a-z]/.test(password);
  }

  hasNumeric(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[0-9]/.test(password);
  }

  hasSpecialChar(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[!@#$%^&*(),.?':{}|<>]/.test(password);
  }

  hasMinLength(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return password.length >= 8;
  }
}
