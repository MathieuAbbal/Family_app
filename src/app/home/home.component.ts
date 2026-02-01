import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../models/task.model';
import { Subscription } from 'rxjs';
import { TasksService } from '../services/tasks.service';
import { MatDialog } from '@angular/material/dialog';
import { KanbanComponent } from '../tasks/kanban/kanban.component';
import { RouterModule } from '@angular/router';



@Component({
    selector: 'app-home',
    imports: [KanbanComponent, RouterModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tasks: Task[] = [];
  tasksSubsription!: Subscription;


  constructor(
    private ts: TasksService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  // urgence
  listeUrgence = ['aucune', 'urgent', 'relative', 'pas urgent']
  getCouleurUrgence(item: string) {
    return item === "Pas urgent" ? "green" :
      item === "Urgent" ? "red" :
        item ===  "Relativement urgent" ? "orange" :
          "white"
  }
  ngOnInit(): void {
    this.tasksSubsription = this.ts.tasksSubject.subscribe(
      (tasks: Task[]) => {
        this.tasks = tasks;
        console.log(tasks)
      });
    this.ts.getTasks();
    this.ts.emitTasks();
  }

  ngOnDestroy() {
    if (this.tasksSubsription) { this.tasksSubsription.unsubscribe() };
  }

  onEdit(id: string) {
    this.router.navigate(['/task/edit', id]);
  }


}
