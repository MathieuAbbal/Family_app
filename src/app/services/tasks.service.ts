import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';

import { Task} from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  tasks: Task [] = [];
  tasksSubject = new Subject<Task[]>();

  constuctor() {
    this.getTasks();
  }

  emitTasks() {
    this.tasksSubject.next(this.tasks);
    console.log(this.tasks);
  }
  saveTasks() {
    firebase.database().ref('/tasks').set(this.tasks);
    console.log('Tâche sauvegarder', this.tasks);
  }
  getTasks() {
    firebase
      .database()
      .ref('/tasks')
      .on('value', (data) => {
        this.tasks = data.val() ? data.val() : [];
        this.emitTasks();
        console.log('Tâches récupérer', this.tasks);
      });
  }
  crateNewTask(newTask: Task) {
    this.tasks.push(newTask);
    this.saveTasks();
    this.emitTasks();
    console.log('Tâche créer', this.tasks);
  }
  removeTask(task:Task){
    const taskIndexToRemove = this.tasks.findIndex(
    (taskEl)=> taskEl === task);
    this.tasks.splice(taskIndexToRemove, 1);
    this.saveTasks;
    this.emitTasks;
  }
  
}
