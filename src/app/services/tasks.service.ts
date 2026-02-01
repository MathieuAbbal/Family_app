import { Injectable } from '@angular/core';
import { db } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
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
    set(ref(db, '/tasks'), this.tasks);
    console.log('Tâche sauvegarder', this.tasks);
  }
  getTasks() {
    onValue(ref(db, '/tasks'), (data) => {
      this.tasks = data.val() ? data.val() : [];
      this.emitTasks();
      console.log('Tâches récupérer', this.tasks);
    });
  }
  generateUniqueId(): string {
    const timestamp = new Date().getTime();
    const randomPart = Math.random().toString(36).substring(2, 15);
    const uniqueId = `${timestamp}-${randomPart}`;
    return uniqueId;
  }
  createNewTask(newTask: Task) {
    newTask.id = this.generateUniqueId();
    this.tasks.push(newTask);
    this.saveTasks();

    console.log('Tâche créer', this.tasks);
  }
  removeTask(taskId: string) {
    const taskIndexToRemove = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndexToRemove !== -1) {
      this.tasks.splice(taskIndexToRemove, 1);
      this.saveTasks();
      this.emitTasks();
      console.log('Tâche supprimée avec l\'ID:', taskId);
    } else {
      console.error('Tâche non trouvée avec l\'ID:', taskId);
    }
  }


  getTaskById(id: string): Task | null {
    const task = this.tasks.find((t) => t.id === id);
    return task || null;
  }

  updateTaskById(id: string, updatedTask: Task) {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = updatedTask;
      this.saveTasks();
      this.emitTasks();
    } else {
      console.error('ID de tâche invalide:', id);
    }
  }
  updateTaskStatus(updatedTask: Task) {
    const taskIndex = this.tasks.findIndex((t) => t.id === updatedTask.id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = updatedTask;
      this.saveTasks();
      this.emitTasks();
    }
  }


  ngOnDestroy() {
    this.tasksSubject.unsubscribe();
  }
}
