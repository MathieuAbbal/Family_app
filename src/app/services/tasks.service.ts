import { Injectable, signal, computed } from '@angular/core';
import { db } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  // Signal principal pour les tâches
  private _tasks = signal<Task[]>([]);

  // Signal public en lecture seule
  readonly tasks = this._tasks.asReadonly();

  // Signals computed pour filtrage par statut
  readonly todoTasks = computed(() => this._tasks().filter(t => t.statut === 'todo'));
  readonly inProgressTasks = computed(() => this._tasks().filter(t => t.statut === 'inProgress'));
  readonly doneTasks = computed(() => this._tasks().filter(t => t.statut === 'done'));

  constructor() {
    this.initListener();
  }

  private initListener() {
    onValue(ref(db, '/tasks'), (data) => {
      this._tasks.set(data.val() ? data.val() : []);
    });
  }

  private saveTasks() {
    set(ref(db, '/tasks'), this._tasks());
  }

  private generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  createNewTask(newTask: Task) {
    newTask.id = this.generateUniqueId();
    this._tasks.update(tasks => [...tasks, newTask]);
    this.saveTasks();
  }

  removeTask(taskId: string) {
    const exists = this._tasks().some(t => t.id === taskId);
    if (exists) {
      this._tasks.update(tasks => tasks.filter(t => t.id !== taskId));
      this.saveTasks();
    }
  }

  getTaskById(id: string): Task | null {
    return this._tasks().find(t => t.id === id) || null;
  }

  updateTaskById(id: string, updatedTask: Task) {
    const exists = this._tasks().some(t => t.id === id);
    if (exists) {
      this._tasks.update(tasks => tasks.map(t => t.id === id ? updatedTask : t));
      this.saveTasks();
    }
  }

  updateTaskStatus(updatedTask: Task) {
    this._tasks.update(tasks => tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    this.saveTasks();
  }
}
