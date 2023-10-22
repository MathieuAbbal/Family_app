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
  basket: Item[] = [];
  basketSubject = new Subject<Item[]>();
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
  emitBasket() {
    this.basketSubject.next(this.basket);
  }
  
  saveBasket() {
    firebase.database().ref('/basket').set(this.basket);
    console.log('Item sauvegarder dans le panier', this.basket);
  }
  getBasket() {
    firebase.database().ref('/basket').on('value', (data) => {
      this.basket = data.val() ? data.val() : [];
      this.emitBasket();
      console.log('Panier récupérer', this.items);
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

  transferItem(from: any[], item: any, to: any[]) {
    // Remove item from the source list
    from.splice(from.indexOf(item), 1);
    // Add item to the destination list
    to.push(item);
    // Update local arrays
    if (from === this.items) {
      this.items = from;
      this.basket = to;
    } else {
      this.basket = from;
      this.items = to;
    }
    // Save updated lists to Firebase
    this.saveItems();
    this.saveBasket();
    // Emit updated data
    this.emitItems();
    this.emitBasket();
  }
  
  ngOnDestroy() {
    if (this.itemSubject) { this.itemSubject.unsubscribe() };
    if (this.basketSubject){this.basketSubject.unsubscribe()}
  }












}
