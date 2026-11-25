import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
}

function readEnvConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? "";
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? "";
  const storageBucket =
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? "";
  const messagingSenderId =
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "";
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim() ?? "";

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

let cachedServices: FirebaseServices | null | undefined;

export function isFirebaseConfigured(): boolean {
  return readEnvConfig() !== null;
}

export function getFirebaseServices(): FirebaseServices | null {
  if (cachedServices !== undefined) return cachedServices;
  const config = readEnvConfig();
  if (!config) {
    cachedServices = null;
    return null;
  }
  const app = getApps()[0] ?? initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  cachedServices = { app, auth, db };
  return cachedServices;
}
