import { Component, OnInit, OnDestroy } from '@angular/core';

import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Item } from '../models/item.model';
import { ItemService } from '../services/item.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-shopping',
    imports: [DragDropModule, ReactiveFormsModule],
    templateUrl: './shopping.component.html',
    styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit, OnDestroy {
  addItemForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private is: ItemService) { }
  items: Item[] = [];
  basket: Item[] = [];
  itemsSubsciption!: Subscription;
  basketSub!: Subscription;

  drop(event: CdkDragDrop<Item[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const movedItem = event.previousContainer.data[event.previousIndex];
      this.is.transferItem(event.previousContainer.data, movedItem, event.container.data);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.getItem();
    this.getBasket();
  }

  getBasket() {
    this.basketSub = this.is.basketSubject.subscribe(
      (basket: Item[]) => { this.basket = basket; }
    );
    this.is.getBasket();
  }

  getItem() {
    this.itemsSubsciption = this.is.itemSubject.subscribe(
      (item: Item[]) => { this.items = item; }
    );
  }

  initForm() {
    this.addItemForm = this.formBuilder.group({
      item: ['', [Validators.required]],
    });
    this.itemsSubsciption = this.is.itemSubject.subscribe(
      (item: Item[]) => { this.items = item; }
    );
    this.is.getItems();
    this.is.emitItems();
  }

  onSubmit() {
    const item = this.addItemForm.get('item')?.value;
    const newItem = new Item(item);
    this.is.crateNewItem(newItem);
    this.addItemForm.reset();
  }

  OnDelete(item: Item) {
    this.is.removeItem(item);
  }

  ngOnDestroy() {
    if (this.itemsSubsciption) { this.itemsSubsciption.unsubscribe(); }
    if (this.basketSub) { this.basketSub.unsubscribe(); }
  }
}
