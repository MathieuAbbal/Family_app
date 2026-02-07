import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShoppingItem, ShoppingCategory, SHOPPING_CATEGORIES, LIST_ICONS } from '../models/shopping-item.model';
import { ShoppingService } from '../services/shopping.service';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  listIcons = LIST_ICONS;

  // Form pour nouvel item
  newItemName = '';
  newItemCategory: ShoppingCategory = 'autre';
  newItemQuantity = '';
  showAddForm = false;

  // Form pour nouvelle liste
  showNewListModal = false;
  newListName = '';
  newListIcon = '🛒';

  // Modal suppression liste
  showDeleteListModal = false;

  // Accès aux signals du service
  lists = this.shoppingService.lists;
  activeList = this.shoppingService.activeList;
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

  constructor(
    private shoppingService: ShoppingService,
    private snackBar: MatSnackBar
  ) {}

  // Gestion des listes
  selectList(listId: string) {
    this.shoppingService.setActiveList(listId);
  }

  openNewListModal() {
    this.newListName = '';
    this.newListIcon = '🛒';
    this.showNewListModal = true;
  }

  closeNewListModal() {
    this.showNewListModal = false;
  }

  async createList() {
    const name = this.newListName.trim();
    if (!name) return;

    const listId = await this.shoppingService.createList(name, this.newListIcon);
    this.shoppingService.setActiveList(listId);
    this.closeNewListModal();
    this.snackBar.open('Liste créée !', '', { duration: 3000 });
  }

  openDeleteListModal() {
    this.showDeleteListModal = true;
  }

  closeDeleteListModal() {
    this.showDeleteListModal = false;
  }

  async confirmDeleteList() {
    const activeList = this.activeList();
    if (!activeList) return;

    await this.shoppingService.deleteList(activeList.id);
    this.closeDeleteListModal();
    this.snackBar.open('Liste supprimée', '', { duration: 3000 });
  }

  // Gestion des items
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
    this.snackBar.open('Article ajouté !', '', { duration: 2000 });
  }

  toggleChecked(item: ShoppingItem) {
    this.shoppingService.toggleChecked(item.id, !item.checked);
  }

  removeItem(item: ShoppingItem) {
    this.shoppingService.removeItem(item.id);
    this.snackBar.open('Article supprimé', '', { duration: 2000 });
  }

  clearChecked() {
    this.shoppingService.clearChecked();
    this.snackBar.open('Panier vidé', '', { duration: 2000 });
  }

  getCategoryIcon(key: string): string {
    return this.categories.find(c => c.key === key)?.icon || '📦';
  }
}
