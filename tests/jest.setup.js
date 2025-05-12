// Add Jest setup code
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    locale: 'en',
  }),
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  Trans: ({ children }) => children,
}));

// Mock PouchDB
jest.mock('pouchdb', () => {
  class PouchDBMock {
    constructor() {
      this.get = jest.fn();
      this.put = jest.fn();
      this.allDocs = jest.fn();
      this.post = jest.fn();
      this.bulkDocs = jest.fn();
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
jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
  };
});

jest.mock('firebase/auth', () => {
  return {
    getAuth: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    signInWithPopup: jest.fn(),
    GoogleAuthProvider: jest.fn(),
  };
});

jest.mock('firebase/firestore', () => {
  return {
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    addDoc: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
  };
});

// Mock the service worker
if (typeof window !== 'undefined') {
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
  
  // Mock service worker registration
  Object.defineProperty(window.navigator, 'serviceWorker', {
    writable: true,
    value: {
      register: jest.fn().mockImplementation(() => Promise.resolve()),
      ready: Promise.resolve({
        active: { state: 'activated' },
      }),
    },
  });
}
