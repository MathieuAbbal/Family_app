import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShoppingItem, ShoppingCategory, SHOPPING_CATEGORIES } from '../models/shopping-item.model';

@Component({
  selector: 'app-edit-item-dialog',
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="p-6">
      <h2 class="font-display text-xl font-bold mb-4 text-gradient">Modifier l'article</h2>
      <div class="space-y-3">
        <input [(ngModel)]="nom" placeholder="Nom de l'article..." class="input-fun w-full" autofocus />
        <div class="flex gap-3">
          <input [(ngModel)]="quantity" placeholder="Qté (ex: 2, 500g...)" class="input-fun flex-1" />
          <select [(ngModel)]="category" class="input-fun flex-1">
            @for (cat of categories; track cat.key) {
              <option [value]="cat.key">{{cat.icon}} {{cat.label}}</option>
            }
          </select>
        </div>
      </div>
      <div class="flex gap-3 mt-6">
        <button (click)="dialogRef.close()" class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
          Annuler
        </button>
        <button (click)="save()" [disabled]="!nom.trim()" class="flex-1 btn-gradient text-sm disabled:opacity-50">
          Enregistrer
        </button>
      </div>
    </div>
  `
})
export class EditItemDialogComponent {
  nom: string;
  quantity: string;
  category: ShoppingCategory;
  categories = SHOPPING_CATEGORIES;

  constructor(
    public dialogRef: MatDialogRef<EditItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ShoppingItem
  ) {
    this.nom = data.nom;
    this.quantity = data.quantity || '';
    this.category = data.category;
  }

  save() {
    if (!this.nom.trim()) return;
    this.dialogRef.close({
      nom: this.nom.trim(),
      quantity: this.quantity.trim() || '1',
      category: this.category,
    });
  }
}
