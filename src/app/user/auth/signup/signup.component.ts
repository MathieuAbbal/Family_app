import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder,UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: UntypedFormGroup;
  errorMessage!: string;



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
        console.log('utilisateur créer !',createNewUser )
      },
      (error) => {
        this.errorMessage = error;
      }
    );
  }
}

function createNewUser(arg0: string, createNewUser: any) {
  throw new Error('Function not implemented.');
}

