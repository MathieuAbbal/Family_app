import { Injectable } from '@angular/core';
import { db } from '../firebase';
import { ref, onValue, push, remove, update } from 'firebase/database';
import { Subject } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  items: Item[] = [];
  itemSubject = new Subject<Item[]>();

  constructor() {
    this.getItems();
  }

  emitItems() {
    this.itemSubject.next(this.items);
  }

  getItems() {
    onValue(ref(db, '/shopping'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this.items = Object.keys(data).map(key => ({ ...data[key], id: key }));
      } else {
        this.items = [];
      }
      this.emitItems();
    });
  }

  addItem(item: Omit<Item, 'id'>) {
    push(ref(db, '/shopping'), item);
  }

  removeItem(id: string) {
    remove(ref(db, '/shopping/' + id));
  }

  toggleChecked(id: string, checked: boolean) {
    update(ref(db, '/shopping/' + id), { checked });
  }

  clearChecked() {
    const checked = this.items.filter(i => i.checked);
    const updates: Record<string, null> = {};
    checked.forEach(i => updates['/shopping/' + i.id] = null);
    update(ref(db), updates);
  }
}
