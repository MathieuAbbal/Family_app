import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item } from '../models/item.model';
import { ItemService } from '../services/item.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.css'],
})
export class ShoppingComponent implements OnInit {
  addItemForm!: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private is: ItemService) {}
  items:any[] = [];

  basket = ['Oranges', 'Bananes', 'Concombres'];

  itemsSubsciption!:Subscription


  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  ngOnInit(): void {
    this.initForm();
  //  this.getItem()
  }
  getItem(){
    this.itemsSubsciption = this.is.itemSubject.subscribe(
      (item:any[])=>{
        this.items = item
        console.log('itemGet', this.items)
      }
    ) 
  }
  initForm() {
    this.addItemForm = this.formBuilder.group({
      item: ['', [Validators.required]],
    })
    this.itemsSubsciption = this.is.itemSubject.subscribe(
      (item:any[])=>{
        this.items = item
        console.log('item', this.items)
      }
      
    )
    this.is.getItems()
    this.is.emitItems()
  }
  onSubmit() {
    const item = this.addItemForm.get('item')?.value;

    const newItem = new Item(item);
    this.is.crateNewItem(newItem);
    console.log(newItem);
  }
}
