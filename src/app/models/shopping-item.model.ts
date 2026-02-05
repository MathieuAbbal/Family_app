export type ShoppingCategory =
  | 'fruits_legumes'
  | 'produits_laitiers'
  | 'viandes'
  | 'epicerie'
  | 'boissons'
  | 'surgeles'
  | 'hygiene'
  | 'autre';

export const SHOPPING_CATEGORIES: { key: ShoppingCategory; label: string; icon: string }[] = [
  { key: 'fruits_legumes', label: 'Fruits & Légumes', icon: '🥦' },
  { key: 'produits_laitiers', label: 'Produits laitiers', icon: '🧀' },
  { key: 'viandes', label: 'Viandes & Poissons', icon: '🥩' },
  { key: 'epicerie', label: 'Épicerie', icon: '🍝' },
  { key: 'boissons', label: 'Boissons', icon: '🥤' },
  { key: 'surgeles', label: 'Surgelés', icon: '🧊' },
  { key: 'hygiene', label: 'Hygiène & Maison', icon: '🧴' },
  { key: 'autre', label: 'Autre', icon: '📦' },
];

export interface ShoppingItem {
  id: string;
  nom: string;
  category: ShoppingCategory;
  quantity: string;
  checked: boolean;
  addedBy: string;
  addedByName: string;
  addedByPhoto?: string;
  addedAt: string;
}
