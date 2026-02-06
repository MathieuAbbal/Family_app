import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VacationsService } from '../services/vacations.service';
import { KanbanComponent } from '../tasks/kanban/kanban.component';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-home',
    imports: [KanbanComponent, RouterModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {

  // Accès direct au signal du service
  nextVacation = this.vacService.nextVacation;

  constructor(
    private vacService: VacationsService,
    private router: Router
  ) {}

  daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  onEdit(id: string) {
    this.router.navigate(['/task/edit', id]);
  }
}
