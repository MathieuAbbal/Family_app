import { Injectable, signal, computed } from '@angular/core';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { ShoppingItem } from '../models/shopping-item.model';

@Injectable({
  providedIn: 'root',
})
export class ShoppingService {
  // Signal principal
  private _items = signal<ShoppingItem[]>([]);

  // Signal public en lecture seule
  readonly items = this._items.asReadonly();

  // Computed signals utiles
  readonly uncheckedItems = computed(() => this._items().filter(i => !i.checked));
  readonly checkedItems = computed(() => this._items().filter(i => i.checked));
  readonly totalUnchecked = computed(() => this.uncheckedItems().length);

  constructor() {
    this.initListener();
  }

  private initListener() {
    onValue(ref(db, '/shopping'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this._items.set(Object.keys(data).map(key => ({ ...data[key], id: key })));
      } else {
        this._items.set([]);
      }
    });
  }

  addItem(item: Omit<ShoppingItem, 'id'>) {
    push(ref(db, '/shopping'), item);
  }

  removeItem(id: string) {
    remove(ref(db, '/shopping/' + id));
  }

  toggleChecked(id: string, checked: boolean) {
    update(ref(db, '/shopping/' + id), { checked });
  }

  clearChecked() {
    const checked = this._items().filter(i => i.checked);
    const updates: Record<string, null> = {};
    checked.forEach(i => updates['/shopping/' + i.id] = null);
    update(ref(db), updates);
  }
}
