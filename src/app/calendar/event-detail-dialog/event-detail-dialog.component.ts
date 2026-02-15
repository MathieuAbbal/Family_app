import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalendarEvent } from '../../models/calendar-event.model';

@Component({
  selector: 'app-event-detail-dialog',
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-3 h-3 rounded-full shrink-0" [style.background-color]="data.event.color || '#4285f4'"></div>
        <h2 class="font-display text-lg font-bold text-gray-700">{{ data.event.title }}</h2>
      </div>

      <div class="space-y-3 text-sm">
        <!-- Calendar -->
        @if (data.event.calendarName) {
          <div class="flex items-center gap-2 text-gray-500">
            <span class="w-5 text-center">📅</span>
            <span>{{ data.event.calendarName }}</span>
          </div>
        }

        <!-- Date & time -->
        <div class="flex items-center gap-2 text-gray-500">
          <span class="w-5 text-center">🕐</span>
          @if (data.event.allDay && isMultiDay) {
            <span>{{ data.event.startDate | date:'EEEE d MMMM':'':'fr' }} → {{ allDayEndDate | date:'EEEE d MMMM yyyy':'':'fr' }}</span>
          } @else if (data.event.allDay) {
            <span>Toute la journee · {{ data.event.startDate | date:'EEEE d MMMM yyyy':'':'fr' }}</span>
          } @else if (isMultiDay) {
            <span>{{ data.event.startDate | date:'EEEE d MMM, HH:mm':'':'fr' }} → {{ data.event.endDate | date:'EEEE d MMM yyyy, HH:mm':'':'fr' }}</span>
          } @else {
            <span>{{ data.event.startDate | date:'EEEE d MMMM yyyy, HH:mm':'':'fr' }} — {{ data.event.endDate | date:'HH:mm':'':'fr' }}</span>
          }
        </div>

        <!-- Location -->
        @if (data.event.location) {
          <div class="flex items-start gap-2 text-gray-500">
            <span class="w-5 text-center shrink-0">📍</span>
            <span>{{ data.event.location }}</span>
          </div>
        }

        <!-- Creator -->
        @if (data.event.creatorName) {
          <div class="flex items-center gap-2 text-gray-500">
            @if (data.event.creatorPhotoURL) {
              <img [src]="data.event.creatorPhotoURL" class="w-5 h-5 rounded-full object-cover" alt="">
            } @else {
              <span class="w-5 text-center">👤</span>
            }
            <span>Cree par <span class="font-medium text-gray-600">{{ data.event.creatorName }}</span></span>
          </div>
        }

        <!-- Description -->
        @if (data.event.description) {
          <div class="mt-3 p-3 bg-gray-50 rounded-xl text-gray-600 text-sm whitespace-pre-wrap">{{ data.event.description }}</div>
        }
      </div>

      <div class="flex justify-end gap-3 pt-4">
        @if (data.canDelete) {
          <button (click)="delete()"
            class="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-bold text-sm">
            Supprimer
          </button>
        }
        <button (click)="close()"
          class="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm">
          Fermer
        </button>
      </div>
    </div>
  `
})
export class EventDetailDialogComponent {
  isMultiDay: boolean;
  /** For all-day events, Google end date is exclusive — subtract 1 day for display */
  allDayEndDate: Date | null;

  constructor(
    private dialogRef: MatDialogRef<EventDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: CalendarEvent; canDelete?: boolean }
  ) {
    const e = data.event;
    if (e.allDay) {
      const start = e.startDate.substring(0, 10);
      const end = e.endDate.substring(0, 10);
      const endDate = new Date(end);
      endDate.setDate(endDate.getDate() - 1);
      this.allDayEndDate = endDate;
      this.isMultiDay = start !== this.formatDate(endDate);
    } else {
      this.allDayEndDate = null;
      const startDay = new Date(e.startDate).toDateString();
      const endDay = new Date(e.endDate).toDateString();
      this.isMultiDay = startDay !== endDay;
    }
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  close() {
    this.dialogRef.close();
  }

  delete() {
    this.dialogRef.close('delete');
  }
}
