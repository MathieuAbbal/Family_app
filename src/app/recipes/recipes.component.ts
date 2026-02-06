import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Recipe, RecipeIngredient, RECIPE_ICONS } from '../models/recipe.model';
import { SHOPPING_CATEGORIES, ShoppingCategory } from '../models/shopping-item.model';
import { RecipesService } from '../services/recipes.service';
import { ShoppingService } from '../services/shopping.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-recipes',
    imports: [CommonModule, FormsModule],
    templateUrl: './recipes.component.html',
    styleUrls: ['./recipes.component.css']
})
export class RecipesComponent {
  recipeIcons = RECIPE_ICONS;
  categories = SHOPPING_CATEGORIES;

  // Signals
  recipes = this.recipesService.recipes;
  shoppingLists = this.shoppingService.lists;

  // Vue: liste ou édition
  view: 'list' | 'edit' | 'detail' = 'list';
  selectedRecipe: Recipe | null = null;

  // Form nouvelle recette / édition
  editMode: 'create' | 'edit' = 'create';
  recipeName = '';
  recipeIcon = '🍝';
  recipePortions = 4;
  recipeIngredients: RecipeIngredient[] = [];

  // Form nouvel ingrédient
  newIngredientName = '';
  newIngredientQuantity = '';
  newIngredientCategory: ShoppingCategory = 'autre';

  // Modal ajouter aux courses
  showAddToListModal = false;
  selectedListId = '';
  portionMultiplier = 1;

  // Modal suppression
  showDeleteModal = false;
  recipeToDelete: Recipe | null = null;

  constructor(
    private recipesService: RecipesService,
    private shoppingService: ShoppingService,
    private snackBar: MatSnackBar
  ) {}

  // Navigation
  openCreateForm() {
    this.editMode = 'create';
    this.recipeName = '';
    this.recipeIcon = '🍝';
    this.recipePortions = 4;
    this.recipeIngredients = [];
    this.view = 'edit';
  }

  openEditForm(recipe: Recipe) {
    this.editMode = 'edit';
    this.selectedRecipe = recipe;
    this.recipeName = recipe.name;
    this.recipeIcon = recipe.icon;
    this.recipePortions = recipe.portions;
    this.recipeIngredients = [...recipe.ingredients];
    this.view = 'edit';
  }

  openDetail(recipe: Recipe) {
    this.selectedRecipe = recipe;
    this.view = 'detail';
  }

  backToList() {
    this.view = 'list';
    this.selectedRecipe = null;
  }

  // Gestion ingrédients
  addIngredient() {
    const nom = this.newIngredientName.trim();
    if (!nom) return;

    this.recipeIngredients.push({
      nom,
      quantity: this.newIngredientQuantity.trim() || '1',
      category: this.newIngredientCategory,
    });

    this.newIngredientName = '';
    this.newIngredientQuantity = '';
    this.newIngredientCategory = 'autre';
  }

  removeIngredient(index: number) {
    this.recipeIngredients.splice(index, 1);
  }

  // Sauvegarde recette
  async saveRecipe() {
    const name = this.recipeName.trim();
    if (!name || this.recipeIngredients.length === 0) return;

    if (this.editMode === 'create') {
      await this.recipesService.createRecipe({
        name,
        icon: this.recipeIcon,
        portions: this.recipePortions,
        ingredients: this.recipeIngredients,
      });
      this.snackBar.open('Recette créée !', '', { duration: 3000 });
    } else if (this.selectedRecipe) {
      await this.recipesService.updateRecipe(this.selectedRecipe.id, {
        name,
        icon: this.recipeIcon,
        portions: this.recipePortions,
        ingredients: this.recipeIngredients,
      });
      this.snackBar.open('Recette mise à jour !', '', { duration: 3000 });
    }

    this.backToList();
  }

  // Suppression
  openDeleteModal(recipe: Recipe) {
    this.recipeToDelete = recipe;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.recipeToDelete = null;
  }

  async confirmDelete() {
    if (!this.recipeToDelete) return;
    await this.recipesService.deleteRecipe(this.recipeToDelete.id);
    this.closeDeleteModal();
    this.snackBar.open('Recette supprimée', '', { duration: 3000 });
    if (this.view !== 'list') {
      this.backToList();
    }
  }

  // Ajouter aux courses
  openAddToListModal(recipe: Recipe) {
    this.selectedRecipe = recipe;
    this.portionMultiplier = 1;
    const lists = this.shoppingLists();
    this.selectedListId = lists.length > 0 ? lists[0].id : '';
    this.showAddToListModal = true;
  }

  closeAddToListModal() {
    this.showAddToListModal = false;
  }

  decreaseMultiplier() {
    if (this.portionMultiplier > 0.5) {
      this.portionMultiplier -= 0.5;
    }
  }

  increaseMultiplier() {
    this.portionMultiplier += 0.5;
  }

  async confirmAddToList() {
    if (!this.selectedRecipe || !this.selectedListId) return;

    await this.recipesService.addToShoppingList(
      this.selectedRecipe,
      this.selectedListId,
      this.portionMultiplier
    );

    const list = this.shoppingLists().find(l => l.id === this.selectedListId);
    this.snackBar.open(
      `${this.selectedRecipe.ingredients.length} ingrédients ajoutés à "${list?.name}"`,
      '',
      { duration: 3000 }
    );
    this.closeAddToListModal();
  }

  getCategoryIcon(key: string): string {
    return this.categories.find(c => c.key === key)?.icon || '📦';
  }
}
