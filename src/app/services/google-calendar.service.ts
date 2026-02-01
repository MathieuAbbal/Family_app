import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CalendarEvent, GoogleCalendarInfo } from '../models/calendar-event.model';
import { GoogleAuthService } from './google-auth.service';
import { AuthService } from './auth.service';
import { auth } from '../firebase';
import { environment } from '../../environments/environment';

declare const gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  events: CalendarEvent[] = [];
  eventsSubject = new Subject<CalendarEvent[]>();
  calendars: GoogleCalendarInfo[] = [];
  calendarsSubject = new Subject<GoogleCalendarInfo[]>();

  constructor(
    private googleAuth: GoogleAuthService,
    private authService: AuthService
  ) {}

  emitEvents() {
    this.eventsSubject.next(this.events);
  }

  /** Ensure the OAuth token is set on gapi.client before API calls */
  private ensureToken(): void {
    const token = this.googleAuth.getAccessToken();
    if (token) {
      gapi.client.setToken({ access_token: token });
    }
  }

  /** Fetch all calendars the user has access to */
  async getCalendars(): Promise<GoogleCalendarInfo[]> {
    if (!this.googleAuth.isConnected()) return [];
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();
      const response = await gapi.client.calendar.calendarList.list();
      console.log('Calendar list response:', response.result.items?.length, 'calendars');
      // Filter out Google's built-in noise calendars (week numbers, holidays, birthdays, contacts)
      const filtered = (response.result.items || []).filter((cal: any) => {
        const id: string = cal.id || '';
        return !id.includes('#weeknum') &&
               !id.includes('#contacts') &&
               !id.includes('#holiday') &&
               !id.includes('addressbook') &&
               !id.endsWith('#birthday@group.v.calendar.google.com');
      });
      this.calendars = filtered.map((cal: any) => ({
        id: cal.id,
        summary: cal.summary || cal.id,
        backgroundColor: cal.backgroundColor || '#4285f4',
        primary: !!cal.primary,
      }));

      // Ensure the family calendar is always present
      const familyId = environment.googleCalendar.familyCalendarId;
      if (familyId && !this.calendars.find(c => c.id === familyId)) {
        this.calendars.push({
          id: familyId,
          summary: 'Famille',
          backgroundColor: '#e67c73',
        });
      }

      this.calendarsSubject.next(this.calendars);
      return this.calendars;
    } catch {
      return [];
    }
  }

  /** Fetch events from all calendars and merge them */
  async getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.googleAuth.isConnected()) return [];
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();

      if (this.calendars.length === 0) {
        await this.getCalendars();
      }

      const currentUser = auth.currentUser;

      // Fetch events from each calendar in parallel
      const promises = this.calendars.map(async (cal) => {
        try {
          const response = await gapi.client.calendar.events.list({
            calendarId: cal.id,
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            showDeleted: false,
            singleEvents: true,
            orderBy: 'startTime',
          });
          return (response.result.items || []).map((item: any) => ({
            id: item.id,
            title: item.summary || '(Sans titre)',
            description: item.description || '',
            startDate: item.start?.dateTime || item.start?.date || '',
            endDate: item.end?.dateTime || item.end?.date || '',
            allDay: !!item.start?.date,
            color: cal.backgroundColor,
            calendarId: cal.id,
            calendarName: cal.summary,
            location: item.location || '',
            creatorUid: currentUser?.uid || '',
            creatorName: item.creator?.displayName || item.creator?.email || '',
          }));
        } catch (err) {
          console.error('Error fetching events from', cal.id, err);
          return [];
        }
      });

      const results = await Promise.all(promises);
      const allEvents: CalendarEvent[] = [];
      results.forEach(events => allEvents.push(...events));
      console.log('Total events fetched:', allEvents.length, 'from', this.calendars.length, 'calendars');

      // Sort all events by start date
      allEvents.sort((a, b) => a.startDate.localeCompare(b.startDate));

      this.events = allEvents;
      this.emitEvents();
      return this.events;
    } catch {
      return [];
    }
  }

  async createEvent(event: CalendarEvent): Promise<CalendarEvent | null> {
    if (!this.googleAuth.isConnected()) return null;
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();
      const calendarId = event.calendarId || environment.googleCalendar.familyCalendarId || 'primary';
      const resource: any = {
        summary: event.title,
        description: event.description || '',
      };
      if (event.allDay) {
        resource.start = { date: event.startDate.substring(0, 10) };
        resource.end = { date: event.endDate.substring(0, 10) };
      } else {
        resource.start = { dateTime: event.startDate };
        resource.end = { dateTime: event.endDate };
      }

      const response = await gapi.client.calendar.events.insert({
        calendarId,
        resource,
      });

      const cal = this.calendars.find(c => c.id === calendarId);
      const created: CalendarEvent = {
        id: response.result.id,
        title: response.result.summary,
        description: response.result.description || '',
        startDate: response.result.start?.dateTime || response.result.start?.date || '',
        endDate: response.result.end?.dateTime || response.result.end?.date || '',
        allDay: !!response.result.start?.date,
        calendarId,
        calendarName: cal?.summary || calendarId,
        color: cal?.backgroundColor,
      };
      return created;
    } catch {
      return null;
    }
  }

  async deleteEvent(eventId: string, calendarId = 'primary'): Promise<void> {
    if (!this.googleAuth.isConnected()) return;
    try {
      await this.googleAuth.loadGapi();
      this.ensureToken();
      await gapi.client.calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch {
      // silently fail
    }
  }
}
