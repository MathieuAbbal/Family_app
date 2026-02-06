import { Component, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { Task } from '../../models/task.model';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';

@Component({
    selector: 'app-edit-task',
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './edit-task.component.html',
    styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {
  taskToEdit: Task | null = null;
  editTaskForm!: FormGroup;
  allUsers: User[] = [];
  selectedUsers: Set<string> = new Set();
  selectAll = false;

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
          urg: [task.urg, [Validators.required]],
          title: [task.title, [Validators.required]],
          descriptif: [task.descriptif],
          createdDate: [task.createdDate || ''],
          statut: [task.statut || ''],
        });

        // Initialiser la sélection d'utilisateurs
        if (task.name === 'Tout le monde') {
          this.selectAll = true;
        } else {
          const names = task.name.split(', ').map(n => n.trim()).filter(n => n);
          names.forEach(n => this.selectedUsers.add(n));
        }
      }
    });
  }

  onDelete(task: Task) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: "Etes-vous sur(e) de vouloir supprimer la tache" },
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

  toggleUser(userName: string) {
    if (this.selectedUsers.has(userName)) {
      this.selectedUsers.delete(userName);
    } else {
      this.selectedUsers.add(userName);
    }
    this.selectAll = false;
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedUsers.clear();
    }
  }

  isUserSelected(userName: string): boolean {
    return this.selectedUsers.has(userName);
  }

  get hasSelection(): boolean {
    return this.selectAll || this.selectedUsers.size > 0;
  }

  editTask() {
    if (!this.hasSelection) {
      this._snackBar.open('Selectionne au moins une personne', '', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: "Etes-vous sur(e) de vouloir modifier la tache" },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const name = this.selectAll ? 'Tout le monde' : Array.from(this.selectedUsers).join(', ');
        const updatedTask: Task = {
          ...this.editTaskForm.value as Task,
          name
        };
        const taskId: string = this.route.snapshot.params['id'];
        this.tasksService.updateTaskById(taskId, updatedTask);
        this.router.navigate(['/home']);
        this._snackBar.open('Tache modifiee', 'avec succes !!', { duration: 5000 });
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
