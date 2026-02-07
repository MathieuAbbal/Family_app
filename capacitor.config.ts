import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.familyapp.app',
  appName: 'FamilyApp',
  webDir: 'dist/familyapp/browser',
  server: {
    url: 'https://mathieuabbal.github.io/Family_app/',
    androidScheme: 'https'
  }
};

export default config;
