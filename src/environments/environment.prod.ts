export const environment = {
  production: true,
  googleCalendar: {
    apiKey: '***FIREBASE_API_KEY***',
    clientId: '***GOOGLE_CLIENT_ID***',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    scopes: 'https://www.googleapis.com/auth/calendar',
    familyCalendarId: '***FAMILY_CALENDAR_ID***'
  }
};
