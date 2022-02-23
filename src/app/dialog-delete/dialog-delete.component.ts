import { Component, Inject, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TasksService } from '../services/tasks.service';
import { Task } from '../models/task.model';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-dialog-delete',
  templateUrl: './dialog-delete.component.html',
  styleUrls: ['./dialog-delete.component.css']
})

export class DialogDeleteComponent implements OnInit {
  @Input()item:any
  constructor(
    private ts :TasksService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
    ) {console.log("DATA",data) }
  tasks: Task[] = [];
  tasksSubsription!: Subscription;

  onDeleteTask(task:Task) {
    this.ts.removeTask(task);
  }
 
  ngOnDestroy(){
    if(this.tasksSubsription){this.tasksSubsription.unsubscribe()};
    
  }
  ngOnInit(): void {
  }

}
