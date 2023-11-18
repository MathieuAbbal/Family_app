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
  constructor() {
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
    
    console.log('Tâche créer', this.tasks);
  }
  removeTask(task:Task){
    const taskIndexToRemove = this.tasks.findIndex(
    (El)=> El === task);
    console.log(taskIndexToRemove);
    this.tasks.splice(taskIndexToRemove, 1);
    this.saveTasks();
    this.emitTasks();
  }


  getTaskByIndex(index: number): Task | null {
    if (index >= 0 && index < this.tasks.length) {
      return this.tasks[index];
    } else {
      // Gérer le cas où l'index est invalide
      console.error('Index invalide:', index);
      return null;
    }
  }
  
  updateTask(index: number, newTask: any) {
    if (index >= 0 && index < this.tasks.length) {
      this.tasks[index] = newTask;
      this.saveTasks(); 
      this.emitTasks();
    } else {
      console.error('Index invalide:', index);
    }
  }
  

  ngOnDestroy() {
    this.tasksSubject.unsubscribe();
  }
}
