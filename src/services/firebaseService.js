import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  signInAnonymously,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocsFromServer,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig, firebaseConfigured } from '../config';
import { normalizeProduct } from '../domain/products';

let client;
let signingIn;
function getClient() {
  if (!firebaseConfigured) throw new Error('Chưa cấu hình Firebase. Xem README và .env.example.');
  if (client) return client;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  let auth;
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch (error) {
    if (error.code !== 'auth/already-initialized') throw error;
    auth = getAuth(app);
  }
  client = { auth, db: getFirestore(app) };
  return client;
}
// Firestore promises may wait for network recovery. Time out UI waits, without
// claiming cancellation: an idempotent write can still be acknowledged later.
async function waitForServer(promise) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                'Chưa nhận xác nhận Firebase. Kiểm tra mạng và tải lại; thao tác có thể hoàn tất sau.',
              ),
            ),
          12000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
export async function ensureSession() {
  const { auth } = getClient();
  if (!signingIn) {
    signingIn = (async () => {
      await auth.authStateReady();
      return auth.currentUser || (await signInAnonymously(auth)).user;
    })().finally(() => {
      signingIn = null;
    });
  }
  return waitForServer(signingIn);
}
export async function readWishlist(uid) {
  const { db } = getClient();
  const snapshot = await waitForServer(getDocsFromServer(collection(db, 'users', uid, 'wishlist')));
  return snapshot.docs.map((entry) => normalizeProduct(entry.data()));
}
export async function writeWishlist(uid, product, remove) {
  const { db } = getClient();
  const reference = doc(db, 'users', uid, 'wishlist', String(product.id));
  await waitForServer(
    remove
      ? deleteDoc(reference)
      : setDoc(reference, { ...normalizeProduct(product), savedAt: serverTimestamp() }),
  );
}
export function firebaseError(error) {
  if (error.code === 'permission-denied')
    return 'Firebase từ chối truy cập. Kiểm tra Firestore rules theo UID.';
  if (
    error.code === 'auth/operation-not-allowed' ||
    error.code === 'auth/admin-restricted-operation'
  )
    return 'Hãy bật Anonymous trong Firebase Authentication.';
  if (
    error.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' ||
    error.code === 'auth/invalid-api-key'
  )
    return 'Firebase API key không hợp lệ. Kiểm tra cấu hình .env.';
  return error.message || 'Firebase chưa kết nối được. Vui lòng thử lại.';
}
