export interface User {
    uid: string;
    email: string;
    displayName: string;
    phoneNumber: string;
    photoURL: string;
    dateBirth: string;
    googleCalendar?: {
      connected: boolean;
      calendarId: string;
    };
  }