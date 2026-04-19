import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  sideImage = COMUNIDADE_IMAGES[Math.floor(Math.random() * COMUNIDADE_IMAGES.length)];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      console.log('Login:', this.loginForm.value);

      // Simulando login
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      }, 1500);
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  getErrorMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (control?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('minlength')) {
      return 'Mínimo de 6 caracteres';
    }
    return '';
  }
}
