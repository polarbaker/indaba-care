import { 
  Family, 
  Child, 
  Nanny, 
  Session, 
  MilestoneEntry, 
  Photo, 
  Feedback, 
  Resource 
} from '../types';

// Define PouchDB types to support generics
interface PouchDBStatic {
  new <T = any>(name: string, options?: any): PouchDBDatabase<T>;
}

interface PouchDBDatabase<T = any> {
  get(id: string, options?: any): Promise<T & { _id: string; _rev: string }>;
  put(doc: T & { _id: string; _rev?: string }, options?: any): Promise<any>;
  post(doc: T, options?: any): Promise<any>;
  remove(doc: T & { _id: string; _rev: string }, options?: any): Promise<any>;
  allDocs(options?: any): Promise<{ rows: Array<{ doc?: (T & { _id: string; _rev: string }) }> }>;
  find(options?: any): Promise<{ docs: Array<T & { _id: string; _rev: string }> }>;
  destroy(): Promise<void>;
  changes(options?: any): { on: (event: string, callback: Function) => void; cancel: () => void };
}

// Only initialize PouchDB in the browser environment
let PouchDB: PouchDBStatic;
let familyDB: PouchDBDatabase<Family>;
let childDB: PouchDBDatabase<Child>;
let nannyDB: PouchDBDatabase<Nanny>;
let sessionDB: PouchDBDatabase<Session>;
let milestoneDB: PouchDBDatabase<MilestoneEntry>;
let photoDB: PouchDBDatabase<Photo>;
let feedbackDB: PouchDBDatabase<Feedback>;
let resourceDB: PouchDBDatabase<Resource>;
let syncDB: PouchDBDatabase<{ lastSyncedAt: number }>;

// Safely check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Dynamic import for PouchDB-browser to avoid SSR issues
  PouchDB = require('pouchdb-browser');
  
  // Initialize PouchDB databases for each entity type
  familyDB = new PouchDB('indaba_families');
  childDB = new PouchDB('indaba_children');
  nannyDB = new PouchDB('indaba_nannies');
  sessionDB = new PouchDB('indaba_sessions');
  milestoneDB = new PouchDB('indaba_milestones');
  photoDB = new PouchDB('indaba_photos');
  feedbackDB = new PouchDB('indaba_feedback');
  resourceDB = new PouchDB('indaba_resources');
  
  // Store the last sync time
  syncDB = new PouchDB('indaba_sync_status');
}

// Function to clear all databases (useful for testing or logout)
const clearAllDatabases = async () => {
  try {
    await Promise.all([
      familyDB.destroy(),
      childDB.destroy(),
      nannyDB.destroy(),
      sessionDB.destroy(),
      milestoneDB.destroy(),
      photoDB.destroy(),
      feedbackDB.destroy(),
      resourceDB.destroy(),
      syncDB.destroy(),
    ]);
    console.log('All databases cleared successfully');
  } catch (error) {
    console.error('Error clearing databases:', error);
    throw error;
  }
};

// Function to get the last sync time
const getLastSyncTime = async (): Promise<number> => {
  try {
    const doc = await syncDB.get('sync_status');
    return doc.lastSyncedAt || 0;
  } catch (error) {
    // If the document doesn't exist, return 0
    return 0;
  }
};

// Function to update the last sync time
const updateLastSyncTime = async (timestamp = Date.now()): Promise<void> => {
  try {
    try {
      const doc = await syncDB.get('sync_status');
      await syncDB.put({
        _id: 'sync_status',
        _rev: doc._rev,
        lastSyncedAt: timestamp,
      });
    } catch (error) {
      // If the document doesn't exist, create it
      await syncDB.put({
        _id: 'sync_status',
        lastSyncedAt: timestamp,
      });
    }
  } catch (error) {
    console.error('Error updating last sync time:', error);
    throw error;
  }
};

export {
  familyDB,
  childDB,
  nannyDB,
  sessionDB,
  milestoneDB,
  photoDB,
  feedbackDB,
  resourceDB,
  syncDB,
  clearAllDatabases,
  getLastSyncTime,
  updateLastSyncTime,
};
