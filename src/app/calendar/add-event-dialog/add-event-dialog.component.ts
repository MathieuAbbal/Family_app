import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalendarEvent, GoogleCalendarInfo } from '../../models/calendar-event.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-add-event-dialog',
  imports: [ReactiveFormsModule],
  template: `
    <div class="p-6">
      <h2 class="font-display text-lg font-bold text-gray-700 mb-4">Nouvel evenement</h2>
      <form [formGroup]="eventForm" class="space-y-4">
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-600">Titre</label>
          <input formControlName="title" placeholder="Ex. Reunion famille..." required class="input-fun w-full" />
        </div>
        @if (data.calendars && data.calendars.length > 1) {
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-600">Agenda</label>
            <select formControlName="calendarId" class="input-fun w-full">
              @for (cal of data.calendars; track cal.id) {
                <option [value]="cal.id">{{ cal.summary }}</option>
              }
            </select>
          </div>
        }
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-600">Description</label>
          <textarea formControlName="description" rows="3" placeholder="Details..." class="input-fun w-full resize-y"></textarea>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <input type="checkbox" formControlName="allDay" id="allDay" class="rounded" />
          <label for="allDay" class="text-sm text-gray-600">Toute la journee</label>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-600">Debut</label>
            <input formControlName="startDate" type="date" class="input-fun w-full" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-600">Fin</label>
            <input formControlName="endDate" type="date" class="input-fun w-full" />
          </div>
        </div>
        @if (!eventForm.get('allDay')?.value) {
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-600">Heure debut</label>
              <input formControlName="startTime" type="time" class="input-fun w-full" />
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-600">Heure fin</label>
              <input formControlName="endTime" type="time" class="input-fun w-full" />
            </div>
          </div>
        }
        <div class="flex justify-end gap-3 pt-2">
          <button type="button" (click)="onCancel()"
            class="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm">
            Annuler
          </button>
          <button type="button" (click)="onSubmit()" [disabled]="eventForm.invalid" class="btn-gradient px-6 py-2">
            Creer
          </button>
        </div>
      </form>
    </div>
  `
})
export class AddEventDialogComponent {
  eventForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { date: Date; calendars: GoogleCalendarInfo[] }
  ) {
    const dateStr = data.date.toISOString().substring(0, 10);
    const familyId = environment.googleCalendar.familyCalendarId;
    const defaultCalendar = data.calendars?.find(c => c.id === familyId)?.id
      || data.calendars?.find(c => c.primary)?.id
      || 'primary';
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      calendarId: [defaultCalendar],
      allDay: [true],
      startDate: [dateStr, Validators.required],
      endDate: [dateStr, Validators.required],
      startTime: ['09:00'],
      endTime: ['10:00'],
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.eventForm.invalid) return;
    const v = this.eventForm.value;
    const event: CalendarEvent = {
      id: '',
      title: v.title,
      description: v.description,
      allDay: v.allDay,
      calendarId: v.calendarId || 'primary',
      startDate: v.allDay ? v.startDate : `${v.startDate}T${v.startTime}:00`,
      endDate: v.allDay ? v.endDate : `${v.endDate}T${v.endTime}:00`,
    };
    this.dialogRef.close(event);
  }
}
