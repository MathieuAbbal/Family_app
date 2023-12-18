import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TasksService } from 'src/app/services/tasks.service';
import { Task } from '../../models/task.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { KanbanService } from 'src/app/services/kanban.service';
@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {

  tasks: Task[] = [];
  tasksSubsription!: Subscription;
  constructor(
    private ts: TasksService,
    public dialog: MatDialog,
    private router: Router,
    private kanbanService: KanbanService
  ) { }

  new: Task[] = [];
  en_cours: Task[] = [];
  fait: Task[] = [];
  bloquer: Task[] = [];
  archiver: Task[] = [];
  ngOnInit(): void {
    this.tasksSubsription = this.ts.tasksSubject.subscribe(
      (tasks: Task[]) => {
        this.tasks = tasks;
        this.new = tasks.filter(task => task.statut === 'Nouveau');
        this.en_cours = tasks.filter(task => task.statut === 'En cours');
        this.fait = tasks.filter(task => task.statut === 'Fait');
        this.bloquer = tasks.filter(task => task.statut === 'Bloque');
        this.archiver = tasks.filter(task => task.statut === 'Archive');
      });
    this.ts.getTasks();
    this.ts.emitTasks();
  }

  drop(event: CdkDragDrop<any[]>) {
    console.log('drop', event);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedTask = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStatusFromContainer(event.container.id);
      this.kanbanService.transferTask(event.previousContainer.data, movedTask, event.container.data, newStatus);
    }
  }
  
  // Cette méthode détermine le nouveau statut basé sur l'ID du conteneur
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
  ngOnDestroy() {
    if (this.tasksSubsription) { this.tasksSubsription.unsubscribe() };
  }
}

