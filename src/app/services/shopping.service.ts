import { Injectable, signal, computed } from '@angular/core';
import { db, auth } from '../firebase';
import { ref, onValue, push, remove, update, get, set } from 'firebase/database';
import { ShoppingItem, ShoppingList } from '../models/shopping-item.model';

@Injectable({
  providedIn: 'root',
})
export class ShoppingService {
  // Signals pour les listes
  private _lists = signal<ShoppingList[]>([]);
  private _activeListId = signal<string | null>(null);
  private _items = signal<ShoppingItem[]>([]);
  private _listItemCounts = signal<Record<string, number>>({});
  private _migrationDone = false;

  // Signals publics
  readonly lists = this._lists.asReadonly();
  readonly activeListId = this._activeListId.asReadonly();
  readonly items = this._items.asReadonly();
  readonly listItemCounts = this._listItemCounts.asReadonly();

  // Liste active
  readonly activeList = computed(() => {
    const id = this._activeListId();
    return this._lists().find(l => l.id === id) || null;
  });

  // Computed signals utiles
  readonly uncheckedItems = computed(() => this._items().filter(i => !i.checked));
  readonly checkedItems = computed(() => this._items().filter(i => i.checked));
  readonly totalUnchecked = computed(() => this.uncheckedItems().length);

  private itemsUnsubscribe: (() => void) | null = null;

  constructor() {
    this.initListsListener();
  }

  private async initListsListener() {
    // Vérifier migration au démarrage
    await this.checkAndMigrate();

    // Écouter les listes
    onValue(ref(db, '/shopping_lists'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lists = Object.keys(data).map(key => ({
          id: key,
          name: data[key].name || 'Liste',
          icon: data[key].icon || '🛒',
          createdBy: data[key].createdBy || '',
          createdAt: data[key].createdAt || '',
        }));
        this._lists.set(lists);

        // Calculer le nombre d'articles non cochés par liste
        const counts: Record<string, number> = {};
        for (const key of Object.keys(data)) {
          const items = data[key].items;
          if (items) {
            counts[key] = Object.values(items).filter((i: any) => !i.checked).length;
          } else {
            counts[key] = 0;
          }
        }
        this._listItemCounts.set(counts);

        // Sélectionner la première liste si aucune n'est active
        if (!this._activeListId() && lists.length > 0) {
          this.setActiveList(lists[0].id);
        }
      } else {
        this._lists.set([]);
        this._listItemCounts.set({});
        this._activeListId.set(null);
        this._items.set([]);
      }
    });
  }

  private async checkAndMigrate() {
    if (this._migrationDone) return;
    this._migrationDone = true;

    // Vérifier si /shopping_lists existe
    const listsSnap = await get(ref(db, '/shopping_lists'));
    if (listsSnap.exists()) return; // Déjà migré

    // Vérifier si /shopping contient des données
    const oldSnap = await get(ref(db, '/shopping'));
    if (!oldSnap.exists()) return; // Rien à migrer

    const oldData = oldSnap.val();
    const items = Object.keys(oldData).map(key => ({ ...oldData[key], id: key }));
    if (items.length === 0) return;

    // Créer la liste par défaut
    const user = auth.currentUser;
    const newListRef = push(ref(db, '/shopping_lists'));
    const listId = newListRef.key!;

    const listData: Omit<ShoppingList, 'id'> = {
      name: 'Courses',
      icon: '🛒',
      createdBy: user?.uid || '',
      createdAt: new Date().toISOString(),
    };

    // Préparer les items pour la nouvelle structure
    const updates: Record<string, unknown> = {};
    updates[`/shopping_lists/${listId}/name`] = listData.name;
    updates[`/shopping_lists/${listId}/icon`] = listData.icon;
    updates[`/shopping_lists/${listId}/createdBy`] = listData.createdBy;
    updates[`/shopping_lists/${listId}/createdAt`] = listData.createdAt;

    // Copier les items
    items.forEach(item => {
      const { id, ...itemData } = item;
      updates[`/shopping_lists/${listId}/items/${id}`] = itemData;
    });

    // Supprimer l'ancien path
    updates['/shopping'] = null;

    await update(ref(db), updates);
  }

  setActiveList(listId: string) {
    this._activeListId.set(listId);

    // Arrêter l'ancien listener
    if (this.itemsUnsubscribe) {
      this.itemsUnsubscribe();
    }

    // Écouter les items de la nouvelle liste
    const unsubscribe = onValue(ref(db, `/shopping_lists/${listId}/items`), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        this._items.set(Object.keys(data).map(key => ({ ...data[key], id: key })));
      } else {
        this._items.set([]);
      }
    });

    this.itemsUnsubscribe = unsubscribe;
  }

  async createList(name: string, icon: string): Promise<string> {
    const user = auth.currentUser;
    const newListRef = push(ref(db, '/shopping_lists'));
    const listId = newListRef.key!;

    await set(newListRef, {
      name,
      icon,
      createdBy: user?.uid || '',
      createdAt: new Date().toISOString(),
    });

    return listId;
  }

  async deleteList(listId: string) {
    await remove(ref(db, `/shopping_lists/${listId}`));

    // Si c'était la liste active, passer à une autre
    if (this._activeListId() === listId) {
      const remaining = this._lists().filter(l => l.id !== listId);
      if (remaining.length > 0) {
        this.setActiveList(remaining[0].id);
      } else {
        this._activeListId.set(null);
        this._items.set([]);
      }
    }
  }

  async updateList(listId: string, data: { name: string; icon: string }) {
    await update(ref(db, `/shopping_lists/${listId}`), data);
  }

  updateItem(id: string, data: Partial<ShoppingItem>) {
    const listId = this._activeListId();
    if (!listId) return;
    update(ref(db, `/shopping_lists/${listId}/items/${id}`), data);
  }

  addItem(item: Omit<ShoppingItem, 'id'>) {
    const listId = this._activeListId();
    if (!listId) return;
    push(ref(db, `/shopping_lists/${listId}/items`), item);
  }

  removeItem(id: string) {
    const listId = this._activeListId();
    if (!listId) return;
    remove(ref(db, `/shopping_lists/${listId}/items/${id}`));
  }

  toggleChecked(id: string, checked: boolean) {
    const listId = this._activeListId();
    if (!listId) return;
    update(ref(db, `/shopping_lists/${listId}/items/${id}`), { checked });
  }

  clearChecked() {
    const listId = this._activeListId();
    if (!listId) return;

    const checked = this._items().filter(i => i.checked);
    const updates: Record<string, null> = {};
    checked.forEach(i => updates[`/shopping_lists/${listId}/items/${i.id}`] = null);
    update(ref(db), updates);
  }
}
