import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence, getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */

// Safeguard initialization of auth to avoid the IndexedDB race condition error ("Pending promise was never set") inside iframe sandboxes.
let authInstance;
if (typeof window !== 'undefined') {
  const isIframe = window.self !== window.top;
  let isLocalStorageSafe = false;
  try {
    localStorage.setItem('__auth_test', '1');
    localStorage.removeItem('__auth_test');
    isLocalStorageSafe = true;
  } catch (e) {
    console.warn("Storage is sandboxed or inaccessible in this context:", e);
  }

  // Choose appropriate persistence to avoid the IndexedDB hang in iframe/sandboxed environments
  const getSafePersistence = () => {
    if (!isLocalStorageSafe) {
      return [inMemoryPersistence];
    }
    if (isIframe) {
      // In an iframe (such as AI Studio preview), indexedDB partitioning is blocked, causing hang/fail.
      // browserSessionPersistence uses sessionStorage which works beautifully without IndexedDB, falling back to inMemory.
      return [browserSessionPersistence, inMemoryPersistence];
    }
    return [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence];
  };

  try {
    authInstance = initializeAuth(app, {
      persistence: getSafePersistence()
    });
  } catch (error) {
    authInstance = getAuth(app);
  }
} else {
  authInstance = getAuth(app);
}

export const auth = authInstance;

// Validate Connection to Firestore (as requested in SKILL.md rules)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
       console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

