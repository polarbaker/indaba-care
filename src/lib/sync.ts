import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { firestore } from './firebase';
import {
  familyDB,
  childDB,
  nannyDB,
  sessionDB,
  milestoneDB,
  photoDB,
  feedbackDB,
  resourceDB,
  getLastSyncTime,
  updateLastSyncTime
} from './db';
import { uploadQueuedPhotos } from './photo-upload';
import { Family, Child, Nanny, Session, MilestoneEntry, Photo, Feedback, Resource } from '../types';

// Map database names to their PouchDB instances
const dbMap = {
  families: familyDB,
  children: childDB,
  nannies: nannyDB,
  sessions: sessionDB,
  milestones: milestoneDB,
  photos: photoDB,
  feedback: feedbackDB,
  resources: resourceDB,
};

// Map database names to their Firestore collections
const collectionMap = {
  families: 'families',
  children: 'children',
  nannies: 'nannies',
  sessions: 'sessions',
  milestones: 'milestones',
  photos: 'photos',
  feedback: 'feedback',
  resources: 'resources',
};

// Pull data from Firestore to PouchDB
export const pullData = async (entity: string): Promise<number> => {
  try {
    const lastSyncTime = await getLastSyncTime();
    const db = dbMap[entity as keyof typeof dbMap];
    const collectionName = collectionMap[entity as keyof typeof collectionMap];
    
    if (!db || !collectionName) {
      throw new Error(`Invalid entity type: ${entity}`);
    }
    
    // Query Firestore for documents updated since last sync
    const q = query(
      collection(firestore, collectionName),
      where('updatedAt', '>', lastSyncTime)
    );
    
    const querySnapshot = await getDocs(q);
    let count = 0;
    
    // Update local PouchDB with remote data
    for (const docSnapshot of querySnapshot.docs) {
      const remoteData = docSnapshot.data();
      
      try {
        // Try to get existing document to preserve _rev for update
        const localDoc = await db.get(docSnapshot.id);
        // Type assertion to fix TypeScript errors with PouchDB
        await db.put({
          ...remoteData,
          _id: docSnapshot.id,
          _rev: localDoc._rev,
          lastSyncedAt: Date.now(),
        } as any);
      } catch (error: any) {
        // Document doesn't exist locally, create it
        if (error.name === 'not_found') {
          // Type assertion to fix TypeScript errors with PouchDB
          await db.put({
            ...remoteData,
            _id: docSnapshot.id,
            lastSyncedAt: Date.now(),
          } as any);
        } else {
          console.error(`Error syncing ${entity} document:`, error);
        }
      }
      
      count++;
    }
    
    return count;
  } catch (error) {
    console.error(`Error pulling ${entity} data:`, error);
    throw error;
  }
};

// Push data from PouchDB to Firestore
export const pushData = async (entity: string): Promise<number> => {
  try {
    const lastSyncTime = await getLastSyncTime();
    const db = dbMap[entity as keyof typeof dbMap];
    const collectionName = collectionMap[entity as keyof typeof collectionMap];
    
    if (!db || !collectionName) {
      throw new Error(`Invalid entity type: ${entity}`);
    }
    
    // Get all documents from PouchDB that have been updated since last sync
    const result = await db.allDocs({
      include_docs: true,
    });
    
    const docsToSync = result.rows
      .map(row => row.doc)
      .filter(doc => 
        doc && 
        doc.updatedAt && 
        (!doc.lastSyncedAt || doc.updatedAt > doc.lastSyncedAt)
      );
    
    if (docsToSync.length === 0) {
      return 0;
    }
    
    // Use batched writes for efficiency
    const batch = writeBatch(firestore);
    
    docsToSync.forEach(docObj => {
      if (!docObj) return;
      
      // Clean up PouchDB specific fields and use type assertion to overcome TypeScript limitations
      const docData = docObj as any;
      const { _id, _rev, lastSyncedAt, ...cleanDoc } = docData;
      
      // Create document reference with the cleaned ID
      const docRef = doc(firestore, collectionName, String(_id));
      
      // Add server timestamp
      batch.set(docRef, {
        ...cleanDoc,
        serverUpdatedAt: serverTimestamp(),
      }, { merge: true });
    });
    
    await batch.commit();
    
    // Update lastSyncedAt for all synced docs
    for (const doc of docsToSync) {
      if (!doc) continue;
      
      // Type assertion to fix TypeScript errors related to PouchDB
      await db.put({
        ...doc,
        lastSyncedAt: Date.now(),
      } as any);
    }
    
    return docsToSync.length;
  } catch (error) {
    console.error(`Error pushing ${entity} data:`, error);
    throw error;
  }
};

// Perform a full sync for all entities
export const syncAll = async (): Promise<{
  pulled: number;
  pushed: number;
}> => {
  try {
    let totalPulled = 0;
    let totalPushed = 0;
    
    // First push all local changes
    for (const entity of Object.keys(collectionMap)) {
      const pushed = await pushData(entity);
      totalPushed += pushed;
    }
    
    // Handle photo uploads separately since they involve storage
    const uploadedPhotos = await uploadQueuedPhotos();
    totalPushed += uploadedPhotos;
    
    // Then pull remote changes
    for (const entity of Object.keys(collectionMap)) {
      const pulled = await pullData(entity);
      totalPulled += pulled;
    }
    
    // Update the last sync time
    await updateLastSyncTime();
    
    return {
      pulled: totalPulled,
      pushed: totalPushed,
    };
  } catch (error) {
    console.error('Error during full sync:', error);
    throw error;
  }
};

// Listen for online/offline status changes
export const setupSyncListeners = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', async () => {
      console.log('🌐 Back online, syncing data...');
      try {
        await syncAll();
        console.log('✅ Sync completed successfully');
      } catch (error) {
        console.error('❌ Sync failed:', error);
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 Offline mode activated');
    });
  }
};
