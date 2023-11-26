import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksService } from '../services/tasks.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private formBuilder: UntypedFormBuilder,
    private _snackBar: MatSnackBar,
    private router: Router,
  ) { }

  taskToEdit!:any;
  editTaskForm!:UntypedFormGroup
  durationInSeconds = 5;
  initForm() {
    
  }




  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const index = parseInt(params['index'], 10);
      const task = this.tasksService.getTaskByIndex(index);
      if (task) {
        this.taskToEdit = task;
        console.log(this.taskToEdit);
        this.editTaskForm = this.formBuilder.group({
          name: [this.taskToEdit.name, [Validators.required]],
          urg: [this.taskToEdit.urg, [Validators.required]],
          title: [this.taskToEdit.title, [Validators.required]],
          descriptif: [this.taskToEdit.descriptif],
        });
      } else {
        console.log('Index invalide:', index);
      }
    });
  }
  onSubmit(){
    const updatedTask = this.editTaskForm.value as Task;
  const index = parseInt(this.route.snapshot.params['index'], 10);
  console.log('Tâche modifiée', updatedTask,'avec index', index);
  this.tasksService.updateTask(index, updatedTask);
  this.router.navigate(['/home']);
  }
  openSnackBar(){
    this._snackBar.open('Tâche modifiée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    });
   
  }

}
