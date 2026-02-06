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
          @if (data.event.allDay) {
            <span>Toute la journee · {{ data.event.startDate | date:'EEEE d MMMM yyyy':'':'fr' }}</span>
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
            <span class="w-5 text-center">👤</span>
            <span>Cree par : <span class="font-medium text-gray-600">{{ data.event.creatorName }}</span></span>
          </div>
        }

        <!-- Description -->
        @if (data.event.description) {
          <div class="mt-3 p-3 bg-gray-50 rounded-xl text-gray-600 text-sm whitespace-pre-wrap">{{ data.event.description }}</div>
        }
      </div>

      <div class="flex justify-end pt-4">
        <button (click)="close()"
          class="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm">
          Fermer
        </button>
      </div>
    </div>
  `
})
export class EventDetailDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<EventDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: CalendarEvent }
  ) {}

  close() {
    this.dialogRef.close();
  }
}
