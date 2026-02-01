import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';

@Component({
    selector: 'app-add-task',
    imports: [ReactiveFormsModule],
    templateUrl: './add-task.component.html',
    styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {
  addTaskForm!: FormGroup;
  allUsers: User[] = [];

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
      name: ['', [Validators.required]],
      urg: ['', [Validators.required]],
      title: ['', [Validators.required]],
      descriptif: [''],
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  onSubmit() {
    const name = this.addTaskForm.get('name')?.value;
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
