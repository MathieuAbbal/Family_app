import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { EditProfileService } from '../../user/edit-profile.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    imports: [RouterModule],
    template: `
    <aside class="w-64 h-screen bg-white/80 backdrop-blur-lg border-r border-warm-100 flex flex-col p-4 sticky top-0">
      <div class="flex items-center gap-3 px-3 py-4 mb-6">
        <h1 class="font-display font-extrabold text-xl text-gradient">Family App</h1>
      </div>

      <nav class="flex-1 space-y-1">
        <a routerLink="/home" routerLinkActive="bg-gradient-to-r from-family-pink/10 to-family-orange/10 text-family-pink"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-warm-50 transition-all font-medium">
         Tableau de bord
        </a>
        <a routerLink="/chat" routerLinkActive="bg-gradient-to-r from-family-coral/10 to-family-orange/10 text-family-coral"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-warm-50 transition-all font-medium">
          Fil d'actu
        </a>
        <a routerLink="/add-task" routerLinkActive="bg-gradient-to-r from-family-purple/10 to-family-lavender/10 text-family-purple"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-warm-50 transition-all font-medium">
          Nouvelle tache
        </a>
        <a routerLink="/shopping" routerLinkActive="bg-gradient-to-r from-family-green/10 to-family-green/10 text-family-green"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-warm-50 transition-all font-medium">
           Courses
        </a>
        <a routerLink="/recipes" routerLinkActive="bg-gradient-to-r from-family-orange/10 to-family-coral/10 text-family-orange"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-warm-50 transition-all font-medium">
           Recettes
        </a>
        <a routerLink="/map" routerLinkActive="bg-gradient-to-r from-family-sky/10 to-family-sky/10 text-family-sky"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-warm-50 transition-all font-medium">
           Carte
        </a>
        <a routerLink="/calendar" routerLinkActive="bg-gradient-to-r from-family-yellow/10 to-family-orange/10 text-family-orange"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-warm-50 transition-all font-medium">
           Calendrier
        </a>
        <a routerLink="/documents" routerLinkActive="bg-gradient-to-r from-family-purple/10 to-family-lavender/10 text-family-purple"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-warm-50 transition-all font-medium">
           Documents
        </a>
        <a routerLink="/vacances" routerLinkActive="bg-gradient-to-r from-family-coral/10 to-family-orange/10 text-family-coral"
           class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-warm-50 transition-all font-medium">
           Vacances
        </a>
      </nav>

      <div class="border-t border-warm-100 pt-4">
        <button (click)="onSignOut()"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-400 transition-all font-medium w-full text-left">
           Deconnexion
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit, OnDestroy {
  userName = '';
  userPhoto = '';
  private userSubscription!: Subscription;

  constructor(
    private editProfileService: EditProfileService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userSubscription = this.editProfileService.getUserData().subscribe(user => {
      if (user) {
        this.userName = user.displayName || '';
        this.userPhoto = user.photoURL || 'https://i.pinimg.com/originals/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg';
      }
    });
  }

  onSignOut() {
    this.authService.signOutUser();
  }

  ngOnDestroy() {
    if (this.userSubscription) { this.userSubscription.unsubscribe(); }
  }
}
