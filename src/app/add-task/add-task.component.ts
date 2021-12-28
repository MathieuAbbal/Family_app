import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { TasksService } from '../services/tasks.service';
@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {
  submitted = false;
  constructor(private taskservice : TasksService ) { }

  ngOnInit(): void {
  }
  disableSelect = new FormControl(false);
  addtask(_form: any){
    console.log(_form.value)
    
  }

}
