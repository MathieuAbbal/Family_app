import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../models/task.model';
import { Subscription } from 'rxjs';
import { TasksService } from '../services/tasks.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogDeleteComponent } from '../dialog-delete/dialog-delete.component';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tasks: Task[] = [];
  tasksSubsription!: Subscription;


  constructor(
    private ts :TasksService,
    public dialog:MatDialog,
    private router: Router
  ) { }

  // urgence
 listeUrgence = ['aucune', 'urgent', 'relative', 'pasUrgent']
 getCouleurUrgence(item:string) {
   return item === "aucune" ? "grey" :
     item === "urgent" ? "red" :
       item === "relative" ? "orange" :
         "green"
 }
  ngOnInit(): void {
    this.tasksSubsription = this.ts.tasksSubject.subscribe(
      (tasks:Task[]) =>{
        this.tasks = tasks;
        console.log(tasks)
      });
    this.ts.getTasks();
    this.ts.emitTasks();
  }
  openDialog(){
    const dialogRef = this.dialog.open(DialogDeleteComponent,{
      data: this.tasks
    });

    dialogRef.afterClosed().subscribe( result =>{
      console.log({result})
    });
  } 
  onDeleteTask(task:Task) {
    this.ts.removeTask(task);
  }
  ngOnDestroy(){
    if(this.tasksSubsription){this.tasksSubsription.unsubscribe()};
  }

}
