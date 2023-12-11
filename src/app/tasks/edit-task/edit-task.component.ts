import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
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
    public dialog: MatDialog
  ) { }

  taskToEdit!:any;
  editTaskForm!:UntypedFormGroup
  durationInSeconds = 5;
  initForm() {
    
  }
  onDelete(task: any) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent,  { 
      data: { customMessage: "Etes-vous sûr(e) de vouloir supprimer la tâche" } ,
      
    })
    dialogRef.afterClosed().subscribe(
      result => {
        if (result === true) {
          this.tasksService.removeTask(task)
        }
        else { return }
      }
    )
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
          createdDate: [this.taskToEdit.createdDate || ''],
          statut: [this.taskToEdit.statut || ''],
        });
        
      } else {
        console.log('Index invalide:', index);
      }
    });

  }
  editTask(){
    let dialogRef = this.dialog.open(ConfirmDialogComponent,  { 
      data: { customMessage: "Etes-vous sûr(e) de vouloir modifier la tâche" } ,
      
    })
    dialogRef.afterClosed().subscribe(
      result => {
        if (result === true) {
          const updatedTask = this.editTaskForm.value as Task;
          const index = parseInt(this.route.snapshot.params['index'], 10);
          console.log('Tâche modifiée', updatedTask,'avec index', index);
          this.tasksService.updateTask(index, updatedTask);
          this.router.navigate(['/home']);
          this.openSnackBar();
        }
        else { return }
      }
    )
   
  }
  openSnackBar(){
    this._snackBar.open('Tâche modifiée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    });
  
  }
  tinymceInitParams = {
    selector: "div#textareaId",
    height: 250,
    language: 'fr_FR'
  };
goBack(){
  this.router.navigate(['/home']);
}
}
