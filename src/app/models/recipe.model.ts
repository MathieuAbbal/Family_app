import { ShoppingCategory } from './shopping-item.model';

export interface RecipeIngredient {
  nom: string;
  category: ShoppingCategory;
  quantity: string; // quantité pour 1 portion
}

export interface Recipe {
  id: string;
  name: string;
  icon: string;
  portions: number;
  ingredients: RecipeIngredient[];
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export const RECIPE_ICONS = ['🍝', '🍕', '🍔', '🥗', '🍲', '🍜', '🥘', '🍰', '🥧', '🍳', '🥪', '🌮'];
