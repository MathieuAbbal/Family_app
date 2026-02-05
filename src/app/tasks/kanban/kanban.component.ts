import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { TasksService } from 'src/app/services/tasks.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';
import { Task } from '../../models/task.model';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { KanbanService } from 'src/app/services/kanban.service';

@Component({
    selector: 'app-kanban',
    imports: [CommonModule, DragDropModule, RouterModule],
    templateUrl: './kanban.component.html',
    styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {
  userAvatars: { [name: string]: string } = {};
  allUserAvatars: string[] = [];

  // Arrays mutables pour drag & drop (synchronisés via effect)
  new: Task[] = [];
  en_cours: Task[] = [];
  fait: Task[] = [];
  bloquer: Task[] = [];
  archiver: Task[] = [];

  constructor(
    private ts: TasksService,
    public dialog: MatDialog,
    private router: Router,
    private kanbanService: KanbanService,
    private authService: AuthService
  ) {
    // Effect pour synchroniser les arrays avec les signals Firebase
    effect(() => {
      const tasks = this.ts.tasks();
      this.new = tasks.filter(t => t.statut === 'Nouveau');
      this.en_cours = tasks.filter(t => t.statut === 'En cours');
      this.fait = tasks.filter(t => t.statut === 'Fait');
      this.bloquer = tasks.filter(t => t.statut === 'Bloque');
      this.archiver = tasks.filter(t => t.statut === 'Archive');
    });
  }

  ngOnInit(): void {
    this.authService.getAllUsers().then((users: User[]) => {
      users.forEach(u => {
        if (u.displayName && u.photoURL) {
          this.userAvatars[u.displayName] = u.photoURL;
          this.allUserAvatars.push(u.photoURL);
        }
      });
    });
  }

  isForEveryone(task: Task): boolean {
    return task.name === 'Tout le monde';
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedTask = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStatusFromContainer(event.container.id);
      this.kanbanService.transferTask(event.previousContainer.data, movedTask, event.container.data, newStatus);
    }
  }

  getStatusFromContainer(containerId: string): string {
    switch (containerId) {
      case 'newContainer': return 'Nouveau';
      case 'inProgressContainer': return 'En cours';
      case 'doneContainer': return 'Fait';
      case 'bloqueContainer': return 'Bloque';
      case 'archiveContainer': return 'Archive';
      default: return 'Nouveau';
    }
  }

  getUrgencyClass(urgency: string): string {
    switch(urgency) {
      case 'Urgent':
        return 'flex h-6 items-center rounded-full bg-red-100 px-3 text-xs font-semibold text-red-600';
      case 'Relativement urgent':
        return 'flex h-6 items-center rounded-full bg-yellow-100 px-3 text-xs font-semibold text-yellow-600';
      case 'Pas urgent':
        return 'flex h-6 items-center rounded-full bg-green-100 px-3 text-xs font-semibold text-green-600';
      default:
        return 'flex h-6 items-center rounded-full bg-gray-100 px-3 text-xs font-semibold text-gray-600';
    }
  }

  onEdit(id: string) {
    this.router.navigate(['/task/edit', id]);
  }
}
