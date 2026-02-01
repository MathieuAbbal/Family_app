import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-bottom-nav',
    imports: [RouterModule],
    template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-warm-100 pb-safe z-50">
      <div class="flex justify-around items-center h-16">
        <a routerLink="/home" routerLinkActive="text-family-pink" [routerLinkActiveOptions]="{exact: false}"
           class="flex flex-col items-center gap-0.5 text-gray-400 transition-colors">
          <span class="text-[10px] font-medium">Accueil</span>
        </a>
        <a routerLink="/photo" routerLinkActive="text-family-coral"
           class="flex flex-col items-center gap-0.5 text-gray-400 transition-colors">
          <span class="text-[10px] font-medium">Photos</span>
        </a>
        <a routerLink="/add-task" routerLinkActive="text-family-purple"
           class="flex flex-col items-center gap-0.5 text-gray-400 transition-colors">
          <span class="text-[10px] font-medium">Taches</span>
        </a>
        <a routerLink="/shopping" routerLinkActive="text-family-green"
           class="flex flex-col items-center gap-0.5 text-gray-400 transition-colors">
          <span class="text-[10px] font-medium">Courses</span>
        </a>
        <a routerLink="/map" routerLinkActive="text-family-sky"
           class="flex flex-col items-center gap-0.5 text-gray-400 transition-colors">
          <span class="text-[10px] font-medium">Carte</span>
        </a>
        <a routerLink="/calendar" routerLinkActive="text-family-orange"
           class="flex flex-col items-center gap-0.5 text-gray-400 transition-colors">
          <span class="text-[10px] font-medium">Calendrier</span>
        </a>
        <a routerLink="/documents" routerLinkActive="text-family-purple"
           class="flex flex-col items-center gap-0.5 text-gray-400 transition-colors">
          <span class="text-[10px] font-medium">Docs</span>
        </a>
      </div>
    </nav>
  `
})
export class BottomNavComponent {}
