import { Component, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { Task } from '../../models/task.model';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';

@Component({
    selector: 'app-edit-task',
    imports: [ReactiveFormsModule],
    templateUrl: './edit-task.component.html',
    styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {
  taskToEdit: Task | null = null;
  editTaskForm!: FormGroup;
  allUsers: User[] = [];

  constructor(
    private route: ActivatedRoute,
    private tasksService: TasksService,
    private formBuilder: FormBuilder,
    private _snackBar: MatSnackBar,
    private router: Router,
    public dialog: MatDialog,
    private userService: AuthService
  ) {
    // Effect pour charger la tâche quand les données arrivent
    effect(() => {
      if (this.taskToEdit) return; // Déjà chargée
      const taskId = this.route.snapshot.params['id'];
      const task = this.tasksService.tasks().find(t => t.id === taskId);
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
  }

  onDelete(task: Task) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
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
    this.userService.getAllUsers()
      .then((users: User[]) => this.allUsers = users)
      .catch(() => this._snackBar.open('Erreur lors du chargement des utilisateurs', '', { duration: 5000 }));
  }

  editTask() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: "Etes-vous sûr(e) de vouloir modifier la tâche" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const updatedTask: Task = this.editTaskForm.value as Task;
        const taskId: string = this.route.snapshot.params['id'];
        this.tasksService.updateTaskById(taskId, updatedTask);
        this.router.navigate(['/home']);
        this._snackBar.open('Tâche modifiée', 'avec succès !!', { duration: 5000 });
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
