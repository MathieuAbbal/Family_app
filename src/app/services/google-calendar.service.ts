import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CalendarEvent, GoogleCalendarInfo } from '../models/calendar-event.model';
import { GoogleAuthService } from './google-auth.service';
import { AuthService } from './auth.service';
import { PlatformService } from './platform.service';
import { auth } from '../firebase';
import { environment } from '../../environments/environment';

declare const gapi: any;

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

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
    private authService: AuthService,
    private platform: PlatformService
  ) {}

  emitEvents() {
    this.eventsSubject.next(this.events);
  }

  /** Ensure the OAuth token is set on gapi.client (web only) */
  private ensureToken(): void {
    if (!this.platform.isWeb()) return;
    const token = this.googleAuth.getAccessToken();
    if (token && typeof gapi !== 'undefined') {
      gapi.client.setToken({ access_token: token });
    }
  }

  /** Make an authenticated fetch to Google Calendar REST API (native + web fallback) */
  private async restFetch(path: string, options: RequestInit = {}): Promise<any> {
    const token = this.googleAuth.getAccessToken();
    if (!token) throw new Error('No access token');
    const resp = await fetch(`${CALENDAR_API}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (resp.status === 401) {
      const refreshed = await this.googleAuth.refreshToken();
      if (refreshed) {
        const newToken = this.googleAuth.getAccessToken();
        const retry = await fetch(`${CALENDAR_API}${path}`, {
          ...options,
          headers: {
            Authorization: `Bearer ${newToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        if (!retry.ok) throw new Error(`Calendar API error: ${retry.status}`);
        if (retry.status === 204) return {};
        return retry.json();
      }
      throw new Error('Token refresh failed');
    }
    if (!resp.ok) throw new Error(`Calendar API error: ${resp.status}`);
    if (resp.status === 204) return {};
    return resp.json();
  }

  /** Execute a gapi call with retry on 401 (web only) */
  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.status || err?.result?.error?.code;
      if (status === 401) {
        const refreshed = await this.googleAuth.refreshToken();
        if (refreshed) {
          this.ensureToken();
          return await fn();
        }
      }
      throw err;
    }
  }

  /** Fetch all calendars the user has access to */
  async getCalendars(): Promise<GoogleCalendarInfo[]> {
    if (!this.googleAuth.isConnected()) return [];
    try {
      let items: any[];

      if (this.platform.isNative()) {
        const data = await this.restFetch('/users/me/calendarList');
        items = data.items || [];
      } else {
        await this.googleAuth.loadGapi();
        this.ensureToken();
        const response: any = await this.withRetry(() => gapi.client.calendar.calendarList.list());
        items = response.result.items || [];
      }

      const filtered = items.filter((cal: any) => {
        const id: string = cal.id || '';
        return !id.includes('#weeknum') &&
               !id.includes('#contacts') &&
               !id.includes('#holiday') &&
               !id.includes('addressbook');
      });
      this.calendars = filtered.map((cal: any) => ({
        id: cal.id,
        summary: cal.summary || cal.id,
        backgroundColor: cal.backgroundColor || '#4285f4',
        primary: !!cal.primary,
      }));

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
      if (!this.platform.isNative()) {
        await this.googleAuth.loadGapi();
        this.ensureToken();
      }

      if (this.calendars.length === 0) {
        await this.getCalendars();
      }

      const currentUser = auth.currentUser;

      const promises = this.calendars.map(async (cal) => {
        try {
          let items: any[];

          if (this.platform.isNative()) {
            const params = new URLSearchParams({
              timeMin: startDate.toISOString(),
              timeMax: endDate.toISOString(),
              showDeleted: 'false',
              singleEvents: 'true',
              orderBy: 'startTime',
            });
            const data = await this.restFetch(`/calendars/${encodeURIComponent(cal.id)}/events?${params}`);
            items = data.items || [];
          } else {
            const response: any = await this.withRetry(() => gapi.client.calendar.events.list({
              calendarId: cal.id,
              timeMin: startDate.toISOString(),
              timeMax: endDate.toISOString(),
              showDeleted: false,
              singleEvents: true,
              orderBy: 'startTime',
            }));
            items = response.result.items || [];
          }

          return items.map((item: any) => ({
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
            creatorEmail: item.creator?.email || '',
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

      const users = await this.authService.getAllUsers();
      for (const event of allEvents) {
        if (event.creatorEmail) {
          const match = users.find(u => u.email?.toLowerCase() === event.creatorEmail!.toLowerCase());
          if (match) {
            event.creatorName = match.displayName?.split(' ')[0] || match.displayName || event.creatorName;
            event.creatorPhotoURL = match.photoURL || '';
          }
        }
      }

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

      let result: any;

      if (this.platform.isNative()) {
        result = await this.restFetch(`/calendars/${encodeURIComponent(calendarId)}/events`, {
          method: 'POST',
          body: JSON.stringify(resource),
        });
      } else {
        await this.googleAuth.loadGapi();
        this.ensureToken();
        const response: any = await this.withRetry(() => gapi.client.calendar.events.insert({
          calendarId,
          resource,
        }));
        result = response.result;
      }

      const cal = this.calendars.find(c => c.id === calendarId);
      const created: CalendarEvent = {
        id: result.id,
        title: result.summary,
        description: result.description || '',
        startDate: result.start?.dateTime || result.start?.date || '',
        endDate: result.end?.dateTime || result.end?.date || '',
        allDay: !!result.start?.date,
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
      if (this.platform.isNative()) {
        await this.restFetch(`/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
          method: 'DELETE',
        });
      } else {
        await this.googleAuth.loadGapi();
        this.ensureToken();
        await this.withRetry(() => gapi.client.calendar.events.delete({
          calendarId,
          eventId,
        }));
      }
    } catch {
      // silently fail
    }
  }
}
