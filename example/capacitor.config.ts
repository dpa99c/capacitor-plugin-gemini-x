import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Capacitor GeminiX Example',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    appendUserAgent: "android:application",
    webContentsDebuggingEnabled: true
  },
  ios: {
    appendUserAgent: "ios:application",
    webContentsDebuggingEnabled: true
  }
};

export default config;
