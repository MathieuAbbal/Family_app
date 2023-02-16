import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Subject } from 'rxjs';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  items: Item[] = [];
  itemSubject = new Subject<Item[]>();
  constructor() { }
  emitItems() {
    this.itemSubject.next(this.items);
    console.log(this.items);
  }
  saveItems() {
    firebase.database().ref('/items').set(this.items);
    console.log('Item sauvegarder', this.items);
  }
  getItems() {
    firebase
      .database()
      .ref('/items')
      .on('value', (data) => {
        this.items = data.val() ? data.val() : [];
        this.emitItems();
        console.log('Item récupérer', this.items);
      });
  }
  crateNewItem(newItem: Item) {
    this.items.push(newItem);
    this.saveItems();

    console.log('Item créer', this.items);
  }
  removeItem(items: Item) {
    const itemIndexToRemove = this.items.findIndex(
      (El) => El === items);
    console.log(itemIndexToRemove);
    this.items.splice(itemIndexToRemove, 1);
    this.saveItems();
    this.emitItems();
  }
  ngOnDestroy() {
    if (this.itemSubject) { this.itemSubject.unsubscribe() };
  }












}
