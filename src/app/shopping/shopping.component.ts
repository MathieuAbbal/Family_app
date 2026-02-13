import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ShoppingItem, ShoppingCategory, SHOPPING_CATEGORIES, LIST_ICONS } from '../models/shopping-item.model';
import { ShoppingService } from '../services/shopping.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { EditItemDialogComponent } from './edit-item-dialog.component';
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

  // Form pour nouvelle/édition de liste
  showNewListModal = false;
  newListName = '';
  newListIcon = '🛒';
  editListMode = false;

  // Sélecteur catégorie dans l'input d'ajout
  showCategorySelect = false;

  // Modal suppression liste
  showDeleteListModal = false;

  // Accès aux signals du service
  lists = this.shoppingService.lists;
  activeList = this.shoppingService.activeList;
  items = this.shoppingService.items;
  listItemCounts = this.shoppingService.listItemCounts;

  // Computed pour grouper par catégorie (tri alphabétique)
  readonly uncheckedByCategory = computed(() => {
    const items = this.shoppingService.items();
    return this.categories
      .map(cat => ({
        ...cat,
        items: items
          .filter(i => !i.checked && i.category === cat.key)
          .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
      }))
      .filter(cat => cat.items.length > 0);
  });

  readonly checkedItems = computed(() => this.shoppingService.items().filter(i => i.checked));
  readonly totalItems = computed(() => this.shoppingService.items().filter(i => !i.checked).length);

  constructor(
    private shoppingService: ShoppingService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  // Gestion des listes
  selectList(listId: string) {
    this.shoppingService.setActiveList(listId);
  }

  openNewListModal() {
    this.editListMode = false;
    this.newListName = '';
    this.newListIcon = '🛒';
    this.showNewListModal = true;
  }

  openEditListModal() {
    const list = this.activeList();
    if (!list) return;
    this.editListMode = true;
    this.newListName = list.name;
    this.newListIcon = list.icon;
    this.showNewListModal = true;
  }

  closeNewListModal() {
    this.showNewListModal = false;
  }

  async createList() {
    const name = this.newListName.trim();
    if (!name) return;

    if (this.editListMode) {
      const list = this.activeList();
      if (list) {
        await this.shoppingService.updateList(list.id, { name, icon: this.newListIcon });
        this.snackBar.open('Liste modifiée !', '', { duration: 3000 });
      }
    } else {
      const listId = await this.shoppingService.createList(name, this.newListIcon);
      this.shoppingService.setActiveList(listId);
      this.snackBar.open('Liste créée !', '', { duration: 3000 });
    }
    this.closeNewListModal();
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
    // Garder la catégorie sélectionnée pour le prochain ajout
    this.snackBar.open('Article ajouté !', '', { duration: 2000 });
  }

  editItem(item: ShoppingItem) {
    this.dialog.open(EditItemDialogComponent, {
      width: '95vw',
      maxWidth: '400px',
      panelClass: 'rounded-dialog',
      data: item
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.shoppingService.updateItem(item.id, result);
        this.snackBar.open('Article modifié', '', { duration: 2000 });
      }
    });
  }

  toggleChecked(item: ShoppingItem) {
    this.shoppingService.toggleChecked(item.id, !item.checked);
  }

  confirmRemoveItem(item: ShoppingItem) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: `Supprimer "${item.nom}" de la liste ?` }
    }).afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.shoppingService.removeItem(item.id);
        this.snackBar.open('Article supprimé', '', { duration: 2000 });
      }
    });
  }

  confirmClearChecked() {
    this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: 'Vider le panier ?' }
    }).afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.shoppingService.clearChecked();
        this.snackBar.open('Panier vidé', '', { duration: 2000 });
      }
    });
  }

  getCategoryIcon(key: string): string {
    return this.categories.find(c => c.key === key)?.icon || '📦';
  }
}
