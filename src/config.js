export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
export const firebaseConfigured = Object.values(firebaseConfig).every((value) => typeof value === 'string' && value.trim());
export const aiProxyUrl = (process.env.EXPO_PUBLIC_AI_PROXY_URL || '').replace(/\/$/, '');
