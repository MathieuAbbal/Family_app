import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task } from '../models/task.model';
import { Router } from '@angular/router';
import { TasksService } from '../services/tasks.service';
@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
})
export class AddTaskComponent implements OnInit {
  
  addTaskForm!: FormGroup;
  
  

  constructor(
    private formBuilder: FormBuilder,
    private ts: TasksService,
    private router : Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.addTaskForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      urg: ['', [Validators.required]],
      title: ['', [Validators.required]],
      descriptif: [''],
    });
  }
  onSaveTask(){
    
  }
  onSubmit() {
    const name = this.addTaskForm.get('name')?.value;
    const urg = this.addTaskForm.get('urg')?.value;
    const title = this.addTaskForm.get('title')?.value;
    const descriptif = this.addTaskForm.get('descriptif')?.value;
   
    const newTask = new Task(name, urg,title,descriptif);
    this.ts.crateNewTask(newTask)
    console.log(newTask)
    this.router.navigate(['/home'])
    
  
  }

}
