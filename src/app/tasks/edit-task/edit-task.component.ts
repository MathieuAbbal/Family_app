import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { Task } from '../../models/task.model';
import { EditorModule } from '@tinymce/tinymce-angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-edit-task',
    imports: [ReactiveFormsModule, EditorModule],
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
    public dialog: MatDialog,
    private userService: AuthService
  ) { }

  taskToEdit!: any;
  editTaskForm!: UntypedFormGroup;
  durationInSeconds = 5;
  allUsers: any[] = [];

  initForm() { }

  onDelete(task: any) {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: "Etes-vous sûr(e) de vouloir supprimer la tâche" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.tasksService.removeTask(task.id);
        this.router.navigate(['/home']);
      }
    });
  }

  ngOnInit(): void {
    this.userService.getAllUsers().then((users: any[]) => this.allUsers = users).catch(() => {});
    const taskId = this.route.snapshot.params['id'];
    this.tasksService.tasksSubject.subscribe((tasks: Task[]) => {
      if (this.taskToEdit) return;
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        this.taskToEdit = task;
        this.editTaskForm = this.formBuilder.group({
          id: [task.id, [Validators.required]],
          name: [task.name, [Validators.required]],
          urg: [task.urg, [Validators.required]],
          title: [task.title, [Validators.required]],
          descriptif: [task.descriptif],
          createdDate: [task.createdDate || ''],
          statut: [task.statut || ''],
        });
      }
    });
    this.tasksService.getTasks();
    this.tasksService.emitTasks();
  }

  editTask() {
    let dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: "Etes-vous sûr(e) de vouloir modifier la tâche" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const updatedTask: Task = this.editTaskForm.value as Task;
        const taskId: string = this.route.snapshot.params['id'];
        this.tasksService.updateTaskById(taskId, updatedTask);
        this.router.navigate(['/home']);
        this.openSnackBar();
      }
    });
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
    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    language: 'fr_FR',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
  };

  goBack() {
    this.router.navigate(['/home']);
  }
}
