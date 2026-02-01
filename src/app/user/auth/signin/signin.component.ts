import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-signin',
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  signInForm!: UntypedFormGroup;
  errorMessage!: string;
  showPassword = false;

  constructor(private authService: AuthService,
    private formBuilder: UntypedFormBuilder,
    private router: Router) { }

  ngOnInit(): void {
   this.initForm();
  }

  initForm() {
    this.signInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)]]
    });
  }


  onSubmit() {
    const email = this.signInForm.get('email')!.value;
    const password = this.signInForm.get('password')!.value;

    this.authService.signInUser(email, password).then(
      () => {
        this.router.navigate(['/home']);
      },
      (error) => {
        this.errorMessage = this.translateError(error);
      }
    );
  }

  translateError(error: any): string {
    const code = error?.code || String(error);
    switch (code) {
      case 'auth/user-not-found': return 'Aucun compte trouve avec cet email.';
      case 'auth/wrong-password': return 'Mot de passe incorrect.';
      case 'auth/invalid-email': return 'Adresse email invalide.';
      case 'auth/user-disabled': return 'Ce compte a ete desactive.';
      case 'auth/too-many-requests': return 'Trop de tentatives. Reessayez plus tard.';
      default: return 'Email ou mot de passe incorrect.';
    }
  }
}
