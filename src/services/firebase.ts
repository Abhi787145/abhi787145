import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export type FirebaseConfigType = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

export const getFirestoreDb = (config: FirebaseConfigType) => {
  if (!config || !config.apiKey || !config.projectId) return null;
  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    return getFirestore(app);
  } catch (err) {
    console.warn('[Firebase Cloud Sync] Failed to initialize Firebase:', err);
    return null;
  }
};

export const fetchRemotePortfolio = async (config: FirebaseConfigType) => {
  const db = getFirestoreDb(config);
  if (!db) return null;

  try {
    const docRef = doc(db, 'portfolios', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    console.warn('[Firebase Cloud Sync] Error fetching remote document:', err);
    return null;
  }
};

export const saveRemotePortfolio = async (config: FirebaseConfigType, data: any) => {
  const db = getFirestoreDb(config);
  if (!db) return false;

  try {
    const docRef = doc(db, 'portfolios', 'main');
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firebase Cloud Sync] Error saving remote document:', err);
    throw err;
  }
};
