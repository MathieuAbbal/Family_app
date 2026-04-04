import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.familyapp.app',
  appName: 'FamilyApp',
  webDir: 'dist/familyapp/browser',
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
      },
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
