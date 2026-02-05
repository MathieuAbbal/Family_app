import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingItem, ShoppingCategory, SHOPPING_CATEGORIES } from '../models/shopping-item.model';
import { ShoppingService } from '../services/shopping.service';
import { auth, db } from '../firebase';
import { ref, get } from 'firebase/database';

@Component({
    selector: 'app-shopping',
    imports: [CommonModule, FormsModule],
    templateUrl: './shopping.component.html',
    styleUrls: ['./shopping.component.css']
})
export class ShoppingComponent {
  categories = SHOPPING_CATEGORIES;
  newItemName = '';
  newItemCategory: ShoppingCategory = 'autre';
  newItemQuantity = '';
  showAddForm = false;

  // Accès direct aux signals du service
  items = this.shoppingService.items;

  // Computed pour grouper par catégorie
  readonly uncheckedByCategory = computed(() => {
    const items = this.shoppingService.items();
    return this.categories
      .map(cat => ({
        ...cat,
        items: items.filter(i => !i.checked && i.category === cat.key)
      }))
      .filter(cat => cat.items.length > 0);
  });

  readonly checkedItems = computed(() => this.shoppingService.items().filter(i => i.checked));
  readonly totalItems = computed(() => this.shoppingService.items().filter(i => !i.checked).length);

  constructor(private shoppingService: ShoppingService) {}

  async addItem() {
    const nom = this.newItemName.trim();
    if (!nom) return;
    const user = auth.currentUser;
    let addedByName = '';
    let addedByPhoto = '';
    if (user) {
      const snap = await get(ref(db, `/users/${user.uid}`));
      const profile = snap.val() || {};
      addedByName = profile.displayName || user.displayName || '';
      addedByPhoto = profile.photoURL || user.photoURL || '';
    }
    this.shoppingService.addItem({
      nom,
      category: this.newItemCategory,
      quantity: this.newItemQuantity.trim() || '1',
      checked: false,
      addedBy: user?.uid || '',
      addedByName,
      addedByPhoto,
      addedAt: new Date().toISOString(),
    });
    this.newItemName = '';
    this.newItemQuantity = '';
    this.newItemCategory = 'autre';
    this.showAddForm = false;
  }

  toggleChecked(item: ShoppingItem) {
    this.shoppingService.toggleChecked(item.id, !item.checked);
  }

  removeItem(item: ShoppingItem) {
    this.shoppingService.removeItem(item.id);
  }

  clearChecked() {
    this.shoppingService.clearChecked();
  }

  getCategoryIcon(key: string): string {
    return this.categories.find(c => c.key === key)?.icon || '📦';
  }
}
