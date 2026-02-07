import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import packageJson from '../../../../../package.json';

@Component({
    selector: 'app-signin',
    imports: [],
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  errorMessage = '';
  appVersion = packageJson.version;

  constructor(private authService: AuthService, private router: Router) {}

  signInWithGoogle() {
    this.authService.signInWithGoogle().then(
      () => { this.router.navigate(['/home']); },
      (error) => {
        console.error('Google Sign-In error:', error);
        const code = error?.code || '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
          this.errorMessage = '';
        } else {
          this.errorMessage = `Erreur lors de la connexion Google (${code})`;
        }
      }
    );
  }
}
