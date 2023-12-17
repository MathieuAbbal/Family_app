import { Injectable } from '@angular/core';
import { TasksService } from './tasks.service';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {

  constructor(
    private tasksService: TasksService
  ) { }

  transferTask(from: any[], movedTask: any, to: any[], newStatus: string) {
    // Mettre à jour le statut de la tâche
    const updatedTask = {...movedTask, statut: newStatus};

    // Mettre à jour dans le service de tâches
    this.tasksService.updateTaskStatus(updatedTask);

    // Transférer la tâche entre les tableaux
    from.splice(from.indexOf(movedTask), 1);
    to.push(updatedTask);
  }
}
