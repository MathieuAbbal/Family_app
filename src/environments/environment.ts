// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  googleCalendar: {
    apiKey: 'AIzaSyB4DkZu3SqYLJCrxFGS7DybGGKUBrlJqaI',
    clientId: '728695329604-70417p57psoofhqlsio6qjv705a0ieqf.apps.googleusercontent.com',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    scopes: 'https://www.googleapis.com/auth/calendar',
    familyCalendarId: 'family12498967542838679084@group.calendar.google.com'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
