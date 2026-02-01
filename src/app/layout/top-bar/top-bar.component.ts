import { Component } from '@angular/core';

import { UserAvatarComponent } from '../../user/user-avatar/user-avatar.component';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-top-bar',
    imports: [UserAvatarComponent],
    template: `
    <header class="flex items-center justify-between px-4 md:px-6 py-3 bg-white/60 backdrop-blur-sm border-b border-warm-100">
      <div class="flex items-center gap-2 md:hidden">
        <span class="font-display font-bold text-lg text-gradient">Family App</span>
      </div>
      <div class="hidden md:block"></div>
      <div class="flex items-center gap-3">
        <app-user-avatar></app-user-avatar>
        <button (click)="onSignOut()" class="md:hidden text-gray-400 hover:text-red-400 transition-colors text-sm font-medium">
          Deconnexion
        </button>
      </div>
    </header>
  `
})
export class TopBarComponent {
  constructor(private authService: AuthService) {}

  onSignOut() {
    this.authService.signOutUser();
  }
}
