import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-bottom-nav',
    imports: [RouterModule, CommonModule],
    template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-warm-100 pb-safe z-50">
      <div class="flex justify-around items-center h-16">
        <a routerLink="/home" routerLinkActive="text-family-pink" [routerLinkActiveOptions]="{exact: false}"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400 transition-all active:scale-90">
          <span class="text-lg">🏠</span>
          <span class="text-[9px] font-medium">Accueil</span>
        </a>
        <a routerLink="/chat" routerLinkActive="text-family-coral"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400 transition-all active:scale-90">
          <span class="text-lg">📱</span>
          <span class="text-[9px] font-medium">Fil</span>
        </a>
        <a routerLink="/map" routerLinkActive="text-family-sky"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400 transition-all active:scale-90">
          <span class="text-lg">🗺️</span>
          <span class="text-[9px] font-medium">Carte</span>
        </a>
        <a routerLink="/shopping" routerLinkActive="text-family-green"
           class="flex flex-col items-center justify-center gap-0.5 text-gray-400 transition-all active:scale-90">
          <span class="text-lg">🛒</span>
          <span class="text-[9px] font-medium">Courses</span>
        </a>

        <!-- More menu -->
        <div class="relative">
          <button (click)="showMore = !showMore"
            [class]="showMore ? 'flex flex-col items-center justify-center gap-0.5 text-family-pink transition-all active:scale-90' : 'flex flex-col items-center justify-center gap-0.5 text-gray-400 transition-all active:scale-90'">
            <span class="text-lg">•••</span>
            <span class="text-[9px] font-medium">Plus</span>
          </button>

          @if (showMore) {
            <div class="absolute bottom-14 right-0 bg-white rounded-2xl shadow-lg border border-gray-100 p-2 min-w-[140px] z-50">
              <a routerLink="/add-task" (click)="showMore = false" routerLinkActive="text-family-purple"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm">
                <span>✏️</span> Taches
              </a>
              <a routerLink="/calendar" (click)="showMore = false" routerLinkActive="text-family-orange"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm">
                <span>📅</span> Agenda
              </a>
              <a routerLink="/documents" (click)="showMore = false" routerLinkActive="text-family-purple"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm">
                <span>📁</span> Docs
              </a>
              <a routerLink="/vacances" (click)="showMore = false" routerLinkActive="text-family-coral"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all text-sm">
                <span>🏖️</span> Vacances
              </a>
            </div>
          }
        </div>
      </div>
    </nav>

    <!-- Backdrop -->
    @if (showMore) {
      <div (click)="showMore = false" class="fixed inset-0 z-40"></div>
    }
  `
})
export class BottomNavComponent {
  showMore = false;
}
