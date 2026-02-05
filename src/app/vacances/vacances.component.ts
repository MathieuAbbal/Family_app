import { Component, OnDestroy, ElementRef, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { VacationsService } from '../services/vacations.service';
import { Vacation, ChecklistItem, VacationPhoto } from '../models/vacation.model';
import { AddVacationDialogComponent } from './add-vacation-dialog.component';
import { Map, Marker, Popup } from 'maplibre-gl';

@Component({
  selector: 'app-vacances',
  imports: [CommonModule, FormsModule],
  templateUrl: './vacances.component.html',
  styleUrls: ['./vacances.component.css']
})
export class VacancesComponent implements OnDestroy {
  // Accès direct au signal des vacances
  vacations = this.vacService.vacations;

  selectedVacation: Vacation | null = null;
  activeTab: 'checklist' | 'photos' | 'map' = 'checklist';

  checklist: ChecklistItem[] = [];
  photos: VacationPhoto[] = [];
  newItemText = '';
  uploading = false;

  private unsubChecklist: (() => void) | null = null;
  private unsubPhotos: (() => void) | null = null;
  private map: Map | null = null;

  @ViewChild('detailMap') mapContainer!: ElementRef<HTMLElement>;

  // Computed signals pour filtrer les vacances
  readonly upcoming = computed(() => {
    const now = new Date().toISOString().slice(0, 10);
    return this.vacService.vacations().filter(v => v.startDate > now);
  });

  readonly ongoing = computed(() => {
    const now = new Date().toISOString().slice(0, 10);
    return this.vacService.vacations().filter(v => v.startDate <= now && v.endDate >= now);
  });

  readonly past = computed(() => {
    const now = new Date().toISOString().slice(0, 10);
    return this.vacService.vacations().filter(v => v.endDate < now);
  });

  constructor(
    private vacService: VacationsService,
    private dialog: MatDialog
  ) {}

  daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  durationDays(v: Vacation): number {
    const diff = new Date(v.endDate).getTime() - new Date(v.startDate).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  openAdd(): void {
    const dialogRef = this.dialog.open(AddVacationDialogComponent, {
      width: '95vw',
      maxWidth: '500px',
      panelClass: 'rounded-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.vacService.addVacation(result);
      }
    });
  }

  selectVacation(v: Vacation): void {
    this.selectedVacation = v;
    this.activeTab = 'checklist';
    this.cleanupDetail();
    this.unsubChecklist = this.vacService.listenChecklist(v.id, items => this.checklist = items);
    this.unsubPhotos = this.vacService.listenPhotos(v.id, photos => this.photos = photos);
  }

  backToList(): void {
    this.selectedVacation = null;
    this.cleanupDetail();
  }

  private cleanupDetail(): void {
    this.unsubChecklist?.();
    this.unsubPhotos?.();
    this.unsubChecklist = null;
    this.unsubPhotos = null;
    this.map?.remove();
    this.map = null;
    this.checklist = [];
    this.photos = [];
  }

  // Checklist
  async addItem(): Promise<void> {
    if (!this.newItemText.trim() || !this.selectedVacation) return;
    await this.vacService.addChecklistItem(this.selectedVacation.id, this.newItemText.trim());
    this.newItemText = '';
  }

  async toggleItem(item: ChecklistItem): Promise<void> {
    if (!this.selectedVacation) return;
    await this.vacService.toggleChecklistItem(this.selectedVacation.id, item.id, !item.checked);
  }

  async deleteItem(item: ChecklistItem): Promise<void> {
    if (!this.selectedVacation) return;
    await this.vacService.deleteChecklistItem(this.selectedVacation.id, item.id);
  }

  get checklistProgress(): number {
    if (!this.checklist.length) return 0;
    return Math.round(this.checklist.filter(i => i.checked).length / this.checklist.length * 100);
  }

  // Photos
  async onPhotoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.selectedVacation) return;
    this.uploading = true;
    await this.vacService.uploadPhoto(this.selectedVacation.id, input.files[0]);
    this.uploading = false;
    input.value = '';
  }

  async deletePhoto(photo: VacationPhoto): Promise<void> {
    if (!this.selectedVacation) return;
    await this.vacService.deletePhoto(this.selectedVacation.id, photo);
  }

  // Map
  onTabChange(tab: 'checklist' | 'photos' | 'map'): void {
    this.activeTab = tab;
    if (tab === 'map') {
      setTimeout(() => this.initMap(), 100);
    }
  }

  private initMap(): void {
    if (!this.mapContainer || !this.selectedVacation) return;
    this.map?.remove();

    const v = this.selectedVacation;
    const center: [number, number] = [v.lng || 2.35, v.lat || 48.85];

    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: 'https://maps.geoapify.com/v1/styles/maptiler-3d/style.json?apiKey=793f93202015411eaa6fceaeadaad99c',
      center,
      zoom: v.lat ? 10 : 5,
    });

    if (v.lat && v.lng) {
      new Marker({ color: '#ec4899' })
        .setLngLat([v.lng, v.lat])
        .setPopup(new Popup().setHTML(`<strong>${v.destination}</strong>`))
        .addTo(this.map);
    }

    // Photo markers
    for (const photo of this.photos) {
      if (photo.lat && photo.lng) {
        const el = document.createElement('div');
        el.style.cssText = 'width:30px;height:30px;border-radius:50%;border:2px solid #fff;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.3);cursor:pointer;';
        const img = document.createElement('img');
        img.src = photo.url;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        el.appendChild(img);

        new Marker({ element: el })
          .setLngLat([photo.lng, photo.lat])
          .setPopup(new Popup().setHTML(`<img src="${photo.url}" style="max-width:150px;border-radius:8px;"/>`))
          .addTo(this.map);
      }
    }
  }

  async deleteVacation(): Promise<void> {
    if (!this.selectedVacation) return;
    await this.vacService.deleteVacation(this.selectedVacation.id);
    this.backToList();
  }

  ngOnDestroy(): void {
    this.cleanupDetail();
  }
}
