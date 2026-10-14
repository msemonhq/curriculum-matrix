import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rokomari.bspr.curriculum',
  appName: 'Rokomari BSPR',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      backgroundColor: '#0B0D10',
      launchShowDuration: 2000,
      showSpinner: true,
      androidSpinnerStyle: 'large',
      spinnerColor: '#00c4db',
    },
    StatusBar: {
      backgroundColor: '#0B0D10',
      style: 'DARK',
    }
  }
};

export default config;
