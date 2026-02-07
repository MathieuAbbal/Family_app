import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { GoogleAuthService } from '../services/google-auth.service';
import { GoogleCalendarService } from '../services/google-calendar.service';
import { CalendarEvent, GoogleCalendarInfo } from '../models/calendar-event.model';
import { AddEventDialogComponent } from './add-event-dialog/add-event-dialog.component';
import { EventDetailDialogComponent } from './event-detail-dialog/event-detail-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit, OnDestroy {
  isConnected = false;
  currentDate = new Date();
  viewMode: 'month' | 'week' = 'month';
  events: CalendarEvent[] = [];
  calendars: GoogleCalendarInfo[] = [];
  daysInMonth: (Date | null)[][] = [];
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  private eventsSubscription!: Subscription;
  private calendarsSubscription!: Subscription;
  private connectionSubscription!: Subscription;

  constructor(
    private googleAuth: GoogleAuthService,
    private calendarService: GoogleCalendarService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.eventsSubscription = this.calendarService.eventsSubject.subscribe(
      (events: CalendarEvent[]) => this.events = events.filter(e => !this.isWeekNumberEvent(e))
    );
    this.calendarsSubscription = this.calendarService.calendarsSubject.subscribe(
      (calendars: GoogleCalendarInfo[]) => this.calendars = calendars
    );
    this.connectionSubscription = this.googleAuth.connectionChanged.subscribe((connected: boolean) => {
      this.isConnected = connected;
      if (connected) this.loadEvents();
    });
    this.initGoogle();
    this.buildCalendarGrid();
  }

  async initGoogle() {
    try {
      await this.googleAuth.loadGapi();
      await this.googleAuth.initTokenClient();
      // If token already exists (from sign-in), ensure it's set on gapi.client
      const token = this.googleAuth.getAccessToken();
      if (token) {
        (window as any).gapi.client.setToken({ access_token: token });
      }
      this.isConnected = this.googleAuth.isConnected();
      if (this.isConnected) {
        this.loadEvents();
      }
    } catch {
      // GAPI not available yet
    }
  }

  connectGoogle() {
    this.googleAuth.signIn().then((connected) => {
      this.isConnected = connected;
      if (connected) {
        this.loadEvents();
        this.snackBar.open('Google Calendar connecte !', '', { duration: 3000 });
      }
    });
  }

  disconnectGoogle() {
    this.googleAuth.signOut();
    this.isConnected = false;
    this.events = [];
    this.snackBar.open('Google Calendar deconnecte', '', { duration: 3000 });
  }

  loadEvents() {
    const { start, end } = this.getMonthRange();
    this.calendarService.getEvents(start, end);
  }

  getMonthRange(): { start: Date; end: Date } {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0, 23, 59, 59)
    };
  }

  buildCalendarGrid() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday = 0, Sunday = 6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    while (days.length % 7 !== 0) {
      days.push(null);
    }

    this.daysInMonth = [];
    for (let i = 0; i < days.length; i += 7) {
      this.daysInMonth.push(days.slice(i, i + 7));
    }
  }

  /** Filter out Google's auto-generated week number events */
  private isWeekNumberEvent(event: CalendarEvent): boolean {
    const t = event.title.trim();
    return /^(S|W|Wk|Semaine|Week)\s?\d{1,2}$/.test(t) || (event.calendarId?.includes('#weeknum') ?? false);
  }

  getEventsForDay(day: Date): CalendarEvent[] {
    if (!day) return [];
    // Format local date as YYYY-MM-DD (no timezone conversion)
    const dayStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    return this.events.filter(e => {
      // For all-day events: startDate is "YYYY-MM-DD"
      // For timed events: startDate is "YYYY-MM-DDTHH:mm:ss+TZ" - extract local date
      let eventDate: string;
      if (e.allDay) {
        eventDate = e.startDate.substring(0, 10);
      } else {
        // Parse the datetime and get local date
        const d = new Date(e.startDate);
        eventDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      return eventDate === dayStr && !this.isWeekNumberEvent(e);
    });
  }

  /** ISO week number for a given date */
  getWeekNumber(day: Date | null): number {
    if (!day) return 0;
    const d = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  isMonday(day: Date | null): boolean {
    return !!day && day.getDay() === 1;
  }

  isToday(day: Date | null): boolean {
    if (!day) return false;
    const today = new Date();
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.buildCalendarGrid();
    if (this.isConnected) this.loadEvents();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.buildCalendarGrid();
    if (this.isConnected) this.loadEvents();
  }

  goToday() {
    this.currentDate = new Date();
    this.buildCalendarGrid();
    if (this.isConnected) this.loadEvents();
  }

  get monthLabel(): string {
    return this.currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  openAddEvent(day?: Date) {
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      data: { date: day || new Date(), calendars: this.calendars },
      width: '400px'
    });
    dialogRef.afterClosed().subscribe((result: CalendarEvent | undefined) => {
      if (result) {
        this.calendarService.createEvent(result).then((created) => {
          if (created) {
            this.loadEvents();
            this.snackBar.open('Evenement cree !', '', { duration: 3000 });
          }
        });
      }
    });
  }

  viewEvent(event: CalendarEvent) {
    this.dialog.open(EventDetailDialogComponent, {
      data: { event },
      width: '400px'
    });
  }

  canDelete(event: CalendarEvent): boolean {
    const email = this.googleAuth.getGoogleEmail();
    if (!email) return false;
    return event.creatorName === email;
  }

  confirmDeleteEvent(event: CalendarEvent) {
    this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: `Supprimer "${event.title}" ?` }
    }).afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.calendarService.deleteEvent(event.id, event.calendarId || 'primary').then(() => {
          this.loadEvents();
          this.snackBar.open('Evenement supprime', '', { duration: 3000 });
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.eventsSubscription) this.eventsSubscription.unsubscribe();
    if (this.calendarsSubscription) this.calendarsSubscription.unsubscribe();
    if (this.connectionSubscription) this.connectionSubscription.unsubscribe();
  }
}
