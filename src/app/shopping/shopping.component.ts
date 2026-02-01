import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Item, ItemCategory, CATEGORIES } from '../models/item.model';
import { ItemService } from '../services/item.service';
import { auth, db } from '../firebase';
import { ref, get } from 'firebase/database';

@Component({
    selector: 'app-shopping',
    imports: [CommonModule, FormsModule],
    templateUrl: './shopping.component.html',
    styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  categories = CATEGORIES;
  newItemName = '';
  newItemCategory: ItemCategory = 'autre';
  newItemQuantity = '';
  showAddForm = false;
  private sub!: Subscription;

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.sub = this.itemService.itemSubject.subscribe(
      (items: Item[]) => this.items = items
    );
    this.itemService.emitItems();
  }

  get uncheckedByCategory(): { key: ItemCategory; label: string; icon: string; items: Item[] }[] {
    return this.categories
      .map(cat => ({
        ...cat,
        items: this.items.filter(i => !i.checked && i.category === cat.key)
      }))
      .filter(cat => cat.items.length > 0);
  }

  get checkedItems(): Item[] {
    return this.items.filter(i => i.checked);
  }

  get totalItems(): number {
    return this.items.filter(i => !i.checked).length;
  }

  async addItem() {
    const nom = this.newItemName.trim();
    if (!nom) return;
    const user = auth.currentUser;
    let addedByName = '';
    if (user) {
      const snap = await get(ref(db, `/users/${user.uid}`));
      const profile = snap.val() || {};
      addedByName = profile.displayName || user.displayName || '';
    }
    this.itemService.addItem({
      nom,
      category: this.newItemCategory,
      quantity: this.newItemQuantity.trim() || '1',
      checked: false,
      addedBy: user?.uid || '',
      addedByName,
      addedAt: new Date().toISOString(),
    });
    this.newItemName = '';
    this.newItemQuantity = '';
    this.newItemCategory = 'autre';
    this.showAddForm = false;
  }

  toggleChecked(item: Item) {
    this.itemService.toggleChecked(item.id, !item.checked);
  }

  removeItem(item: Item) {
    this.itemService.removeItem(item.id);
  }

  clearChecked() {
    this.itemService.clearChecked();
  }

  getCategoryIcon(key: string): string {
    return this.categories.find(c => c.key === key)?.icon || '📦';
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
