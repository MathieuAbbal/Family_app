import { Injectable } from '@angular/core';
import { TasksService } from './tasks.service';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class KanbanService {

  constructor(
    private tasksService: TasksService
  ) { }

  transferTask(from: Task[], movedTask: Task, to: Task[], newStatus: string) {
    const updatedTask = {...movedTask, statut: newStatus};

    this.tasksService.updateTaskStatus(updatedTask);

    from.splice(from.indexOf(movedTask), 1);
    to.push(updatedTask);
  }
}
