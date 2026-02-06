import { Injectable, signal, computed } from '@angular/core';
import { db, auth, storage } from '../firebase';
import { ref, push, set, remove, update, onValue, off } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Vacation, ChecklistItem, VacationPhoto } from '../models/vacation.model';

@Injectable({
  providedIn: 'root'
})
export class VacationsService {
  // Signal principal pour les vacances
  private _vacations = signal<Vacation[]>([]);
  readonly vacations = this._vacations.asReadonly();

  // Computed: prochaines vacances (date de début dans le futur)
  readonly upcomingVacations = computed(() => {
    const now = new Date();
    return this._vacations().filter(v => new Date(v.startDate) > now);
  });

  // Computed: prochaines vacances (la plus proche)
  readonly nextVacation = computed(() => this.upcomingVacations()[0] || null);

  private vacationsRef = ref(db, '/vacations');

  constructor() {
    this.initListener();
  }

  private initListener() {
    onValue(this.vacationsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        this._vacations.set([]);
        return;
      }
      const vacations: Vacation[] = Object.keys(data).map(key => ({
        ...data[key],
        id: key,
      }));
      vacations.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      this._vacations.set(vacations);
    });
  }

  async addVacation(vacation: Omit<Vacation, 'id'>): Promise<string> {
    const newRef = push(this.vacationsRef);
    await set(newRef, { ...vacation, id: newRef.key });
    return newRef.key!;
  }

  async updateVacation(id: string, data: Partial<Vacation>): Promise<void> {
    await update(ref(db, `/vacations/${id}`), data);
  }

  async deleteVacation(id: string): Promise<void> {
    await remove(ref(db, `/vacations/${id}`));
  }

  // Checklist (callback-based car spécifique à une vacation)
  listenChecklist(vacationId: string, callback: (items: ChecklistItem[]) => void): () => void {
    const checkRef = ref(db, `/vacations/${vacationId}/checklist`);
    onValue(checkRef, (snap) => {
      const data = snap.val();
      if (!data) { callback([]); return; }
      callback(Object.keys(data).map(key => ({ ...data[key], id: key })));
    });
    return () => off(checkRef);
  }

  async addChecklistItem(vacationId: string, text: string): Promise<void> {
    const user = auth.currentUser;
    const newRef = push(ref(db, `/vacations/${vacationId}/checklist`));
    await set(newRef, {
      id: newRef.key,
      text,
      checked: false,
      addedBy: user?.displayName || '',
    });
  }

  async toggleChecklistItem(vacationId: string, itemId: string, checked: boolean): Promise<void> {
    await update(ref(db, `/vacations/${vacationId}/checklist/${itemId}`), { checked });
  }

  async deleteChecklistItem(vacationId: string, itemId: string): Promise<void> {
    await remove(ref(db, `/vacations/${vacationId}/checklist/${itemId}`));
  }

  // Photos (callback-based car spécifique à une vacation)
  listenPhotos(vacationId: string, callback: (photos: VacationPhoto[]) => void): () => void {
    const photosRef = ref(db, `/vacations/${vacationId}/photos`);
    onValue(photosRef, (snap) => {
      const data = snap.val();
      if (!data) { callback([]); return; }
      const photos = Object.keys(data).map(key => ({ ...data[key], id: key }));
      photos.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
      callback(photos);
    });
    return () => off(photosRef);
  }

  async uploadPhoto(vacationId: string, file: File, caption?: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    const path = `vacations/${vacationId}/${Date.now()}_${file.name}`;
    const sRef = storageRef(storage, path);
    await uploadBytes(sRef, file);
    const url = await getDownloadURL(sRef);

    const newRef = push(ref(db, `/vacations/${vacationId}/photos`));
    await set(newRef, {
      id: newRef.key,
      url,
      caption: caption || '',
      addedBy: user.uid,
      addedByName: user.displayName || '',
      addedAt: new Date().toISOString(),
    });
  }

  async deletePhoto(vacationId: string, photo: VacationPhoto): Promise<void> {
    await remove(ref(db, `/vacations/${vacationId}/photos/${photo.id}`));
  }
}
