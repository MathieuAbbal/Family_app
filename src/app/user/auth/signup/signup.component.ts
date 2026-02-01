import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-signup',
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: UntypedFormGroup;
  errorMessage!: string;
  showPassword = false;



  constructor(
    private formBuilder : UntypedFormBuilder,
    private authService : AuthService,
    private router:Router)
   { }

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/[0-9a-zA-Z]{6,}/)]],
      confirmPassword: ['', Validators.required],
    }, { validator: this.checkPasswords });
  }

  checkPasswords(group: UntypedFormGroup) { // Validation personnalisée pour la correspondance des mots de passe
    const password = group.get('password')!.value;
    const confirmPassword = group.get('confirmPassword')!.value;

    return password === confirmPassword ? null : { notSame: true };
  }
  onSubmit() {
    const email = this.signupForm.get('email')!.value;
    const password = this.signupForm.get('password')!.value;
    
    this.authService.createNewUser(email, password).then(
      () => {
        this.router.navigate(['/']);
        console.log('utilisateur cree !')
      },
      (error) => {
        this.errorMessage = this.translateError(error);
      }
    );
  }

  translateError(error: any): string {
    const code = error?.code || String(error);
    switch (code) {
      case 'auth/email-already-in-use': return 'Cette adresse email est deja utilisee.';
      case 'auth/invalid-email': return 'Adresse email invalide.';
      case 'auth/weak-password': return 'Le mot de passe doit contenir au moins 6 caracteres.';
      case 'auth/operation-not-allowed': return 'Operation non autorisee.';
      default: return 'Une erreur est survenue lors de la creation du compte.';
    }
  }
}
