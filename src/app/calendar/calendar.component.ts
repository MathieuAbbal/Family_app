import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { GoogleAuthService } from '../services/google-auth.service';
import { GoogleCalendarService } from '../services/google-calendar.service';
import { VacationsService } from '../services/vacations.service';
import { CalendarEvent, GoogleCalendarInfo } from '../models/calendar-event.model';
import { AddEventDialogComponent } from './add-event-dialog/add-event-dialog.component';
import { EventDetailDialogComponent } from './event-detail-dialog/event-detail-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { auth } from '../firebase';

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

  readonly vacationColor = '#26A69A';

  constructor(
    private googleAuth: GoogleAuthService,
    private calendarService: GoogleCalendarService,
    private vacationsService: VacationsService,
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

  /** Get vacation events that overlap with the current month for the event list */
  get vacationEventsForMonth(): CalendarEvent[] {
    const { start, end } = this.getMonthRange();
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    return this.vacationsService.vacations()
      .filter(v => v.startDate <= endStr && v.endDate >= startStr)
      .map(v => ({
        id: `vacation-${v.id}`,
        title: `✈️ ${v.title}`,
        description: v.description,
        startDate: v.startDate,
        endDate: v.endDate,
        allDay: true,
        color: this.vacationColor,
        calendarName: 'Vacances',
        location: v.destination,
      }));
  }

  get allEventsForMonth(): CalendarEvent[] {
    return [...this.vacationEventsForMonth, ...this.events];
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

  private formatDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** Check if an event spans multiple days */
  isMultiDayEvent(e: CalendarEvent): boolean {
    if (this.isWeekNumberEvent(e)) return false;
    if (e.allDay) {
      const start = e.startDate.substring(0, 10);
      // End is exclusive for all-day: "2025-02-15" to "2025-02-16" = 1 day (not multi)
      const endDate = new Date(e.endDate.substring(0, 10));
      endDate.setDate(endDate.getDate() - 1);
      return this.formatDateStr(endDate) !== start;
    } else {
      return this.formatDateStr(new Date(e.startDate)) !== this.formatDateStr(new Date(e.endDate));
    }
  }

  /** Get the inclusive end date string for an event */
  private getEventEndDateStr(e: CalendarEvent): string {
    if (e.allDay) {
      const endDate = new Date(e.endDate.substring(0, 10));
      endDate.setDate(endDate.getDate() - 1); // exclusive → inclusive
      return this.formatDateStr(endDate);
    }
    return this.formatDateStr(new Date(e.endDate));
  }

  /** Get the inclusive end date as ISO string for template display (all-day exclusive → inclusive) */
  getDisplayEndDate(event: CalendarEvent): string {
    if (event.allDay && !event.id.startsWith('vacation-')) {
      const endDate = new Date(event.endDate.substring(0, 10));
      endDate.setDate(endDate.getDate() - 1);
      return endDate.toISOString();
    }
    return event.endDate;
  }

  getEventsForDay(day: Date): CalendarEvent[] {
    if (!day) return [];
    const dayStr = this.formatDateStr(day);
    return this.events.filter(e => {
      if (this.isWeekNumberEvent(e)) return false;
      if (this.isMultiDayEvent(e)) return false; // shown as spanning bars
      if (e.allDay) {
        return e.startDate.substring(0, 10) === dayStr;
      } else {
        return this.formatDateStr(new Date(e.startDate)) === dayStr;
      }
    });
  }

  /** Returns multi-day event spans for a given week row with grid column positions */
  getMultiDayEventSpansForWeek(week: (Date | null)[]): { event: CalendarEvent; startCol: number; endCol: number; isStart: boolean; isEnd: boolean }[] {
    const spans: { event: CalendarEvent; startCol: number; endCol: number; isStart: boolean; isEnd: boolean }[] = [];
    const weekDates = week.map(d => d ? this.formatDateStr(d) : null);
    const multiDayEvents = this.events.filter(e => this.isMultiDayEvent(e));

    for (const e of multiDayEvents) {
      const eventStart = e.allDay ? e.startDate.substring(0, 10) : this.formatDateStr(new Date(e.startDate));
      const eventEnd = this.getEventEndDateStr(e);

      let startCol = -1;
      let endCol = -1;

      for (let i = 0; i < 7; i++) {
        if (weekDates[i] && weekDates[i]! >= eventStart && weekDates[i]! <= eventEnd) {
          if (startCol === -1) startCol = i;
          endCol = i;
        }
      }

      if (startCol !== -1) {
        spans.push({
          event: e,
          startCol: startCol + 1,
          endCol: endCol + 2,
          isStart: weekDates[startCol] === eventStart,
          isEnd: weekDates[endCol] === eventEnd,
        });
      }
    }

    return spans;
  }

  /** Returns vacation spans for a given week row with grid column positions */
  getVacationSpansForWeek(week: (Date | null)[]): { event: CalendarEvent; startCol: number; endCol: number; isStart: boolean; isEnd: boolean }[] {
    const spans: { event: CalendarEvent; startCol: number; endCol: number; isStart: boolean; isEnd: boolean }[] = [];
    const weekDates = week.map(d => d ? this.formatDateStr(d) : null);

    for (const v of this.vacationsService.vacations()) {
      let startCol = -1;
      let endCol = -1;

      for (let i = 0; i < 7; i++) {
        if (weekDates[i] && weekDates[i]! >= v.startDate && weekDates[i]! <= v.endDate) {
          if (startCol === -1) startCol = i;
          endCol = i;
        }
      }

      if (startCol !== -1) {
        spans.push({
          event: {
            id: `vacation-${v.id}`,
            title: `✈️ ${v.title}`,
            description: v.description,
            startDate: v.startDate,
            endDate: v.endDate,
            allDay: true,
            color: this.vacationColor,
            calendarName: 'Vacances',
            location: v.destination,
          },
          startCol: startCol + 1,
          endCol: endCol + 2,
          isStart: weekDates[startCol] === v.startDate,
          isEnd: weekDates[endCol] === v.endDate,
        });
      }
    }

    return spans;
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
      data: { event, canDelete: this.canDelete(event) },
      width: '400px'
    }).afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.confirmDeleteEvent(event);
      }
    });
  }

  canDelete(event: CalendarEvent): boolean {
    if (event.id.startsWith('vacation-')) return false;
    if (!event.creatorEmail) return false;
    const email = this.googleAuth.getGoogleEmail() || auth.currentUser?.email;
    return !!email && event.creatorEmail.toLowerCase() === email.toLowerCase();
  }

  isVacationEvent(event: CalendarEvent): boolean {
    return event.id.startsWith('vacation-');
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
