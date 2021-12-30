import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../models/task.model';
import { Subscription } from 'rxjs';
import { TasksService } from '../services/tasks.service';

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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.tasksSubsription = this.ts.tasksSubject.subscribe(
      (tasks:Task[]) =>{
        this.tasks = tasks;
        console.log(tasks)
      });
    this.ts.getTasks();
    this.ts.emitTasks();
  }

  ngOnDestroy(){
    this.tasksSubsription.unsubscribe();
  }

}
