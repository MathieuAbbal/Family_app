import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  signInForm!: UntypedFormGroup;
  errorMessage!: string;

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
        this.errorMessage = error;
      }
    );
  }
}
