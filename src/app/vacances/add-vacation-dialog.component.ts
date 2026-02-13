import { Component, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { auth } from '../firebase';
import { Vacation } from '../models/vacation.model';

interface GeoResult {
  name: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-add-vacation-dialog',
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="p-6">
      <h2 class="font-display text-xl font-bold mb-4"><span>🏖️</span> <span class="text-gradient">{{editMode ? 'Modifier le voyage' : 'Nouveau voyage'}}</span></h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Titre</label>
          <input [(ngModel)]="title" placeholder="Ex: Vacances a Barcelone" class="input-fun w-full text-sm">
        </div>

        <div class="relative">
          <label class="block text-sm font-medium text-gray-600 mb-1">Destination</label>
          <input [(ngModel)]="destinationQuery" (input)="searchDestination()" placeholder="Rechercher un lieu..."
            class="input-fun w-full text-sm">
          @if (geoResults.length) {
            <div class="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-48 overflow-y-auto">
              @for (r of geoResults; track r.name) {
                <button (click)="selectDestination(r)"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors truncate">
                  {{r.name}}
                </button>
              }
            </div>
          }
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Debut</label>
            <input [(ngModel)]="startDate" type="date" class="input-fun w-full text-sm">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Fin</label>
            <input [(ngModel)]="endDate" type="date" class="input-fun w-full text-sm">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">Description (optionnel)</label>
          <textarea [(ngModel)]="description" rows="2" placeholder="Notes, idees..."
            class="input-fun w-full text-sm resize-none"></textarea>
        </div>
      </div>

      <div class="flex gap-3 mt-6">
        <button (click)="dialogRef.close()" class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
          Annuler
        </button>
        <button (click)="save()" [disabled]="!canSave" class="flex-1 btn-gradient text-sm disabled:opacity-50">
          {{editMode ? 'Enregistrer' : 'Creer'}}
        </button>
      </div>
    </div>
  `
})
export class AddVacationDialogComponent {
  title = '';
  destinationQuery = '';
  destination = '';
  lat?: number;
  lng?: number;
  startDate = '';
  endDate = '';
  description = '';
  geoResults: GeoResult[] = [];
  editMode = false;
  private searchTimeout: any;

  constructor(
    public dialogRef: MatDialogRef<AddVacationDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: Vacation
  ) {
    if (data) {
      this.editMode = true;
      this.title = data.title;
      this.destination = data.destination;
      this.destinationQuery = data.destination;
      this.lat = data.lat;
      this.lng = data.lng;
      this.startDate = data.startDate;
      this.endDate = data.endDate;
      this.description = data.description || '';
    }
  }

  get canSave(): boolean {
    return !!this.title.trim() && !!this.destination && !!this.startDate && !!this.endDate;
  }

  searchDestination(): void {
    clearTimeout(this.searchTimeout);
    if (this.destinationQuery.length < 3) {
      this.geoResults = [];
      return;
    }
    this.searchTimeout = setTimeout(async () => {
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.destinationQuery)}&format=json&limit=5`
        );
        const data = await resp.json();
        this.geoResults = data.map((d: any) => ({
          name: d.display_name,
          lat: parseFloat(d.lat),
          lng: parseFloat(d.lon),
        }));
      } catch {
        this.geoResults = [];
      }
    }, 400);
  }

  selectDestination(r: GeoResult): void {
    this.destination = r.name;
    this.destinationQuery = r.name;
    this.lat = r.lat;
    this.lng = r.lng;
    this.geoResults = [];
  }

  save(): void {
    if (!this.canSave) return;
    if (this.editMode) {
      this.dialogRef.close({
        title: this.title.trim(),
        destination: this.destination,
        lat: this.lat,
        lng: this.lng,
        startDate: this.startDate,
        endDate: this.endDate,
        description: this.description.trim() || undefined,
      });
    } else {
      const user = auth.currentUser;
      const vacation: Omit<Vacation, 'id'> = {
        title: this.title.trim(),
        destination: this.destination,
        lat: this.lat,
        lng: this.lng,
        startDate: this.startDate,
        endDate: this.endDate,
        description: this.description.trim() || undefined,
        createdBy: user?.uid || '',
        createdByName: user?.displayName || '',
        status: 'planning',
      };
      this.dialogRef.close(vacation);
    }
  }
}
