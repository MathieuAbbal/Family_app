import { Component, OnInit } from '@angular/core';

import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';
import { Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { EditorModule } from '@tinymce/tinymce-angular';

@Component({
    selector: 'app-add-task',
    imports: [ReactiveFormsModule, EditorModule],
    templateUrl: './add-task.component.html',
    styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {
  addTaskForm!: UntypedFormGroup;
  durationInSeconds = 5;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ts: TasksService,
    private router: Router,
    private _snackBar: MatSnackBar,
    private userService: AuthService
  ) { }
  openSnackBar() {
    this._snackBar.open('Tache ajoutée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    });
  }
  allUsers: any
  ngOnInit(): void {
    this.userService.getAllUsers()
    .then(users => {
      this.allUsers = users;
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des utilisateurs :", error);
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
    const newTask = new Task('',name, urg, title, descriptif, statut, date);
    this.ts.createNewTask(newTask);
    console.log(newTask);
    this.router.navigate(['/home']);
  }

  tinymceInitParams = {
    selector: "textarea",
    browser_spellcheck: true,
    height: 300,
    plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
    language: 'fr_FR',
    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
  };
  getUserInfo() { }
}
