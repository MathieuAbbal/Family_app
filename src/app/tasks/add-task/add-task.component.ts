import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Task } from '../../models/task.model';
import { Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
})
export class AddTaskComponent implements OnInit {
  addTaskForm!: UntypedFormGroup;
  durationInSeconds = 5;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ts: TasksService,
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}
  openSnackBar() {
    this._snackBar.open('Tache ajoutée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    });
  }
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

  onSubmit() {
    const name = this.addTaskForm.get('name')?.value;
    const urg = this.addTaskForm.get('urg')?.value;
    const title = this.addTaskForm.get('title')?.value;
    const descriptif = this.addTaskForm.get('descriptif')?.value;
    const statut = 'New';
    const date = new Date().toISOString();
    const newTask = new Task(name, urg, title, descriptif,statut,date);
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
}
