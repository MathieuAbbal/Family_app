export const environment = {
  production: true,
  vapidKey: '***VAPID_KEY***',
  googleCalendar: {
    apiKey: '***FIREBASE_API_KEY***',
    clientId: '***GOOGLE_CLIENT_ID***',
    discoveryDocs: [
      'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
    ],
    scopes: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive',
    familyCalendarId: '***FAMILY_CALENDAR_ID***',
    familyDriveFolderId: '***FAMILY_DRIVE_FOLDER_ID***'
  }
};
