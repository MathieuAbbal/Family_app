import { Injectable, signal } from '@angular/core';
import { db, auth } from '../firebase';
import { ref, onValue, push, remove, update, get } from 'firebase/database';
import { Recipe, RecipeIngredient } from '../models/recipe.model';
import { ShoppingService } from './shopping.service';

@Injectable({
  providedIn: 'root',
})
export class RecipesService {
  private _recipes = signal<Recipe[]>([]);
  readonly recipes = this._recipes.asReadonly();

  constructor(private shoppingService: ShoppingService) {
    this.initListener();
  }

  private initListener() {
    onValue(ref(db, '/recipes'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const recipes = Object.keys(data).map(key => ({
          id: key,
          name: data[key].name || '',
          icon: data[key].icon || '🍽️',
          portions: data[key].portions || 4,
          ingredients: data[key].ingredients || [],
          createdBy: data[key].createdBy || '',
          createdByName: data[key].createdByName || '',
          createdAt: data[key].createdAt || '',
        }));
        this._recipes.set(recipes);
      } else {
        this._recipes.set([]);
      }
    });
  }

  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdBy' | 'createdByName' | 'createdAt'>): Promise<string> {
    const user = auth.currentUser;
    let createdByName = '';

    if (user) {
      const snap = await get(ref(db, `/users/${user.uid}`));
      const profile = snap.val() || {};
      createdByName = profile.displayName || user.displayName || '';
    }

    const newRecipeRef = push(ref(db, '/recipes'));
    const recipeId = newRecipeRef.key!;

    await update(ref(db, `/recipes/${recipeId}`), {
      ...recipe,
      createdBy: user?.uid || '',
      createdByName,
      createdAt: new Date().toISOString(),
    });

    return recipeId;
  }

  async updateRecipe(id: string, data: Partial<Omit<Recipe, 'id' | 'createdBy' | 'createdByName' | 'createdAt'>>) {
    await update(ref(db, `/recipes/${id}`), data);
  }

  async deleteRecipe(id: string) {
    await remove(ref(db, `/recipes/${id}`));
  }

  getRecipe(id: string): Recipe | undefined {
    return this._recipes().find(r => r.id === id);
  }

  async addToShoppingList(recipe: Recipe, listId: string, portionMultiplier: number = 1) {
    const user = auth.currentUser;
    let addedByName = '';
    let addedByPhoto = '';

    if (user) {
      const snap = await get(ref(db, `/users/${user.uid}`));
      const profile = snap.val() || {};
      addedByName = profile.displayName || user.displayName || '';
      addedByPhoto = profile.photoURL || user.photoURL || '';
    }

    // Sélectionner la liste cible
    this.shoppingService.setActiveList(listId);

    // Ajouter chaque ingrédient à la liste
    for (const ingredient of recipe.ingredients) {
      const adjustedQuantity = this.adjustQuantity(ingredient.quantity, portionMultiplier);

      this.shoppingService.addItem({
        nom: ingredient.nom,
        category: ingredient.category,
        quantity: adjustedQuantity,
        checked: false,
        addedBy: user?.uid || '',
        addedByName,
        addedByPhoto,
        addedAt: new Date().toISOString(),
      });
    }
  }

  private adjustQuantity(baseQuantity: string, multiplier: number): string {
    // Essayer d'extraire un nombre du début de la quantité
    const match = baseQuantity.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      const unit = match[2];
      const adjusted = Math.round(num * multiplier * 10) / 10; // Arrondi à 1 décimale
      return unit ? `${adjusted} ${unit}` : `${adjusted}`;
    }
    // Si pas de nombre, retourner tel quel
    return baseQuantity;
  }
}
