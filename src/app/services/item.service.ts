import { Injectable } from '@angular/core';
import { db } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
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
    set(ref(db, '/items'), this.items);
    console.log('Item sauvegarder', this.items);
  }

  getItems() {
    onValue(ref(db, '/items'), (data) => {
      this.items = data.val() ? data.val() : [];
      this.emitItems();
      console.log('Item récupérer', this.items);
    });
  }
  emitBasket() {
    this.basketSubject.next(this.basket);
  }

  saveBasket() {
    set(ref(db, '/basket'), this.basket);
    console.log('Item sauvegarder dans le panier', this.basket);
  }
  getBasket() {
    onValue(ref(db, '/basket'), (data) => {
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
    from.splice(from.indexOf(item), 1);
    to.push(item);
    if (from === this.items) {
      this.items = from;
      this.basket = to;
    } else {
      this.basket = from;
      this.items = to;
    }
    this.saveItems();
    this.saveBasket();
    this.emitItems();
    this.emitBasket();
  }

  ngOnDestroy() {
    if (this.itemSubject) { this.itemSubject.unsubscribe() };
    if (this.basketSubject){this.basketSubject.unsubscribe()}
  }
}
