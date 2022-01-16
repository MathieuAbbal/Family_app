import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TasksService } from '../services/tasks.service';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-dialog-delete',
  templateUrl: './dialog-delete.component.html',
  styleUrls: ['./dialog-delete.component.css']
})

export class DialogDeleteComponent implements OnInit {
  @Input()item:any
  constructor(private ts :TasksService,
    
    ) { }
  tasks: Task[] = [];
  tasksSubsription!: Subscription;

  onDeleteTask(task:Task) {
    this.ts.removeTask(task);
  }
 
  ngOnDestroy(){
    this.tasksSubsription.unsubscribe();
    
  }
  ngOnInit(): void {
  }

}
