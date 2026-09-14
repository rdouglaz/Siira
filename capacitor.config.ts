import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "chat.siira.app",
  appName: "Siira",
  // Phase 6: mobile shells load the hosted web app (API routes require server).
  // For local device testing, set server.url to your LAN URL, e.g. http://172.25.16.1:8443
  webDir: "out",
  server: {
    androidScheme: "https",
    cleartext: false,
  },
  ios: {
    contentInset: "always",
    limitsNavigationsToAppBoundDomains: true,
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    // Microphone permission is requested at runtime via getUserMedia.
    // PushNotifications can be added later for streak/review reminders.
  },
};

export default config;
