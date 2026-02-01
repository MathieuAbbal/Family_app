export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color?: string;
  calendarId?: string;
  calendarName?: string;
  location?: string;
  creatorUid?: string;
  creatorName?: string;
}

export interface GoogleCalendarInfo {
  id: string;
  summary: string;
  backgroundColor: string;
  primary?: boolean;
}
