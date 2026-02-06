import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService  {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    // Wait for redirect result to be processed before checking auth state
    return this.authService.redirectReady.then(() => {
      return new Promise<boolean>((resolve) => {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            resolve(true);
          } else {
            this.router.navigate(['/auth', 'signin']);
            resolve(false);
          }
        });
      });
    });
  }
}
