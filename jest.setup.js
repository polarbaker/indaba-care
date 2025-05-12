// Add Jest setup code
require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    query: {},
    asPath: '/',
    back: jest.fn(),
    pathname: '/',
    events: {
      on: jest.fn(),
      off: jest.fn()
    },
  }),
}));

// Mock PouchDB
jest.mock('pouchdb-browser', () => {
  class PouchDBMock {
    constructor() {
      this.get = jest.fn();
      this.put = jest.fn();
      this.post = jest.fn();
      this.allDocs = jest.fn();
      this.find = jest.fn();
      this.remove = jest.fn();
      this.sync = jest.fn();
      this.changes = jest.fn().mockReturnValue({
        on: jest.fn(),
        cancel: jest.fn(),
      });
    }
  }
  return PouchDBMock;
});

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  updateProfile: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(),
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(),
}));

// Mock window object for PWA testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigator for service worker and online/offline status
global.navigator.serviceWorker = {
  register: jest.fn().mockResolvedValue({}),
  ready: Promise.resolve({
    active: { state: 'activated' },
    update: jest.fn(),
  }),
};

// Mock for i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: key => key, i18n: { changeLanguage: jest.fn() } }),
  serverSideTranslations: jest.fn(() => Promise.resolve({ _nextI18Next: {} })),
}));
