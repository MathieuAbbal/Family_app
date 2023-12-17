import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { Task } from '../../models/task.model';
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

  taskToEdit!: any;
  editTaskForm!: UntypedFormGroup
  durationInSeconds = 5;
  initForm() {

  }
  onDelete(task: any) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: "Etes-vous sûr(e) de vouloir supprimer la tâche" },

    })
    dialogRef.afterClosed().subscribe(
      result => {
        if (result === true) {
          this.tasksService.removeTask(task)
          this.router.navigate(['/home'])
        }
        else { return }
      }
    )
  }



  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const taskId = params['id'];
      const task = this.tasksService.getTaskById(taskId);
      if (task) {
        this.taskToEdit = task;
        console.log(this.taskToEdit);
        this.editTaskForm = this.formBuilder.group({
          id: [this.taskToEdit.id, [Validators.required]],
          name: [this.taskToEdit.name, [Validators.required]],
          urg: [this.taskToEdit.urg, [Validators.required]],
          title: [this.taskToEdit.title, [Validators.required]],
          descriptif: [this.taskToEdit.descriptif],
          createdDate: [this.taskToEdit.createdDate || ''],
          statut: [this.taskToEdit.statut || ''],
        });

      } else {
        console.log('Id inconnu:', taskId)
      }
    });

  }
  editTask() {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: "Etes-vous sûr(e) de vouloir modifier la tâche" },

    })
    dialogRef.afterClosed().subscribe(
      result => {
        if (result === true) {
          const updatedTask: Task = this.editTaskForm.value as Task;
          const taskId: string = this.route.snapshot.params['id'];
          console.log('Tâche modifiée', updatedTask, 'avec ID', taskId);
          this.tasksService.updateTaskById(taskId, updatedTask);
          this.router.navigate(['/home']);
          this.openSnackBar();
        }
        else { return }
      }
    )

  }
  openSnackBar() {
    this._snackBar.open('Tâche modifiée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    });

  }
  tinymceInitParams = {
    selector: "textarea",
    browser_spellcheck: true,
    height: 300,
    plugins: 'lists anchor autolink charmap codesample emoticons image link  media searchreplace table visualblocks wordcount',
    language: 'fr_FR',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',

  };

  goBack() {
    this.router.navigate(['/home']);
  }
}
