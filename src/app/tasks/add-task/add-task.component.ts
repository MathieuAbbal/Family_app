import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';

@Component({
    selector: 'app-add-task',
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './add-task.component.html',
    styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {
  addTaskForm!: FormGroup;
  allUsers: User[] = [];
  selectedUsers: Set<string> = new Set();
  selectAll = false;

  constructor(
    private formBuilder: FormBuilder,
    private ts: TasksService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private userService: AuthService
  ) { }

  ngOnInit(): void {
    this.userService.getAllUsers()
    .then(users => {
      this.allUsers = users;
    })
    .catch(() => {
      this._snackBar.open('Erreur lors du chargement des utilisateurs', '', { duration: 5000 });
    });
    this.initForm();
  }

  initForm() {
    this.addTaskForm = this.formBuilder.group({
      urg: ['', [Validators.required]],
      title: ['', [Validators.required]],
      descriptif: [''],
    });
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

  goBack() {
    this.router.navigate(['/home']);
  }

  onSubmit() {
    if (!this.hasSelection) {
      this._snackBar.open('Sélectionne au moins une personne', '', { duration: 3000 });
      return;
    }

    const name = this.selectAll ? 'Tout le monde' : Array.from(this.selectedUsers).join(', ');
    const urg = this.addTaskForm.get('urg')?.value;
    const title = this.addTaskForm.get('title')?.value;
    const descriptif = this.addTaskForm.get('descriptif')?.value;
    const statut = 'Nouveau';
    const date = new Date().toISOString();
    const newTask = new Task('', name, urg, title, descriptif, statut, date);
    this.ts.createNewTask(newTask);
    this._snackBar.open('Tache ajoutée', 'avec succès !!', { duration: 5000 });
    this.router.navigate(['/home']);
  }
}
