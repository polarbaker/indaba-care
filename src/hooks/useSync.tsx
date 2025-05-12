import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
import PouchDB from 'pouchdb-browser';
import { useToast } from '@chakra-ui/toast';

// Define the sync result interface
interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  reason?: string;
}

/**
 * Custom hook for managing data synchronization between local PouchDB and Firestore
 * Provides functions for checking online status, performing sync, and managing sync state
 */
export const useSync = () => {
  const { user } = useAuthContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const toast = useToast();
  
  // Initialize Firestore
  const firestore = getFirestore();
  
  // Initialize PouchDB databases
  const familyDb = typeof window !== 'undefined' ? new PouchDB('indaba-families') : null;
  const childrenDb = typeof window !== 'undefined' ? new PouchDB('indaba-children') : null;
  const sessionsDb = typeof window !== 'undefined' ? new PouchDB('indaba-sessions') : null;
  const photosDb = typeof window !== 'undefined' ? new PouchDB('indaba-photos') : null;
  const resourcesDb = typeof window !== 'undefined' ? new PouchDB('indaba-resources') : null;
  const feedbackDb = typeof window !== 'undefined' ? new PouchDB('indaba-feedback') : null;
  
  // Handle online/offline status changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set initial online status
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && user && lastSyncTime) {
      // Only auto-sync if it's been at least 5 minutes since the last sync
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      
      if (lastSyncTime < fiveMinutesAgo) {
        performSync();
      }
    }
  }, [isOnline, user]);
  
  /**
   * Synchronize data from local PouchDB to Firestore
   */
  const pushToFirestore = useCallback(async (): Promise<number> => {
    if (!user || !isOnline) return 0;
    
    let totalPushed = 0;
    
    // Example: Push family data
    if (familyDb) {
      try {
        const result = await familyDb.allDocs({ include_docs: true, attachments: true });
        for (const row of result.rows) {
          if (row.doc && row.doc._id === user.uid) {
            // Only sync the current user's family data
            await setDoc(doc(firestore, 'families', row.doc._id), {
              ...row.doc,
              _id: undefined,
              _rev: undefined
            });
            totalPushed++;
          }
        }
      } catch (error) {
        console.error('Error pushing family data:', error);
      }
    }
    
    // Push children data
    if (childrenDb) {
      try {
        const result = await childrenDb.allDocs({ include_docs: true, attachments: true });
        for (const row of result.rows) {
          if (row.doc && (row.doc as any).familyId === user.uid) {
            // Only sync children that belong to the current user's family
            await setDoc(doc(firestore, 'children', row.doc._id), {
              ...row.doc,
              _rev: undefined
            });
            totalPushed++;
          }
        }
      } catch (error) {
        console.error('Error pushing children data:', error);
      }
    }
    
    // Push sessions data
    if (sessionsDb) {
      try {
        const result = await sessionsDb.allDocs({ include_docs: true, attachments: true });
        for (const row of result.rows) {
          if (row.doc && ((row.doc as any).familyId === user.uid || (row.doc as any).nannyId === user.uid)) {
            // Only sync sessions that involve the current user
            await setDoc(doc(firestore, 'sessions', row.doc._id), {
              ...row.doc,
              _rev: undefined
            });
            totalPushed++;
          }
        }
      } catch (error) {
        console.error('Error pushing sessions data:', error);
      }
    }
    
    // Push photos data
    if (photosDb) {
      try {
        const result = await photosDb.allDocs({ include_docs: true, attachments: true });
        for (const row of result.rows) {
          if (row.doc && row.doc.familyId === user.uid) {
            // Only sync photos that belong to the current user's family
            await setDoc(doc(firestore, 'photos', row.doc._id), {
              ...row.doc,
              _rev: undefined
            });
            totalPushed++;
          }
        }
      } catch (error) {
        console.error('Error pushing photos data:', error);
      }
    }
    
    // Push feedback data
    if (feedbackDb) {
      try {
        const result = await feedbackDb.allDocs({ include_docs: true, attachments: true });
        for (const row of result.rows) {
          if (row.doc && (row.doc as any).userId === user.uid) {
            // Only sync feedback from the current user
            await setDoc(doc(firestore, 'feedback', row.doc._id), {
              ...row.doc,
              _rev: undefined
            });
            totalPushed++;
          }
        }
      } catch (error) {
        console.error('Error pushing feedback data:', error);
      }
    }
    
    return totalPushed;
  }, [user, isOnline, firestore, familyDb, childrenDb, sessionsDb, photosDb, feedbackDb]);
  
  /**
   * Pull data from Firestore to local PouchDB
   */
  const pullFromFirestore = useCallback(async (): Promise<number> => {
    if (!user || !isOnline) return 0;
    
    let totalPulled = 0;
    
    // Example: Pull family data
    if (familyDb) {
      try {
        const familyDocRef = doc(collection(firestore, 'families'), user.uid);
        const familyDocSnap = await getDoc(familyDocRef);
        if (familyDocSnap.exists()) {
          const data = familyDocSnap.data();
          data._id = familyDocRef.id;
          
          try {
            // Try to get the existing doc to preserve _rev
            const existingDoc = await familyDb.get(data._id);
            data._rev = existingDoc._rev;
          } catch (error) {
            // Document doesn't exist locally, which is fine
          }
          
          await familyDb.put(data);
          totalPulled++;
        }
      } catch (error) {
        console.error('Error pulling family data:', error);
      }
    }
    
    // Pull children data
    if (childrenDb) {
      try {
        const childrenSnapshot = await getDocs(collection(firestore, 'children'));
        for (const childDoc of childrenSnapshot.docs) {
          const data = childDoc.data();
          
          // Only pull children belonging to the current user's family
          if (data.familyId === user.uid) {
            data._id = childDoc.id;
            
            try {
              // Try to get the existing doc to preserve _rev
              const existingDoc = await childrenDb.get(data._id);
              data._rev = existingDoc._rev;
            } catch (error) {
              // Document doesn't exist locally, which is fine
            }
            
            await childrenDb.put(data);
            totalPulled++;
          }
        }
      } catch (error) {
        console.error('Error pulling children data:', error);
      }
    }
    
    // Pull sessions data
    if (sessionsDb) {
      try {
        const sessionsSnapshot = await getDocs(collection(firestore, 'sessions'));
        for (const sessionDoc of sessionsSnapshot.docs) {
          const data = sessionDoc.data();
          
          // Only pull sessions that involve the current user
          if (data.familyId === user.uid || data.nannyId === user.uid) {
            data._id = sessionDoc.id;
            
            try {
              // Try to get the existing doc to preserve _rev
              const existingDoc = await sessionsDb.get(data._id);
              data._rev = existingDoc._rev;
            } catch (error) {
              // Document doesn't exist locally, which is fine
            }
            
            await sessionsDb.put(data);
            totalPulled++;
          }
        }
      } catch (error) {
        console.error('Error pulling sessions data:', error);
      }
    }
    
    // Pull resources data (public data)
    if (resourcesDb) {
      try {
        const resourcesSnapshot = await getDocs(collection(firestore, 'resources'));
        for (const resourceDoc of resourcesSnapshot.docs) {
          const data = resourceDoc.data();
          data._id = resourceDoc.id;
          
          try {
            // Try to get the existing doc to preserve _rev
            const existingDoc = await resourcesDb.get(data._id);
            data._rev = existingDoc._rev;
          } catch (error) {
            // Document doesn't exist locally, which is fine
          }
          
          await resourcesDb.put(data);
          totalPulled++;
        }
      } catch (error) {
        console.error('Error pulling resources data:', error);
      }
    }
    
    return totalPulled;
  }, [user, isOnline, firestore, familyDb, childrenDb, sessionsDb, resourcesDb]);
  
  /**
   * Perform a full sync between PouchDB and Firestore
   */
  const performSync = useCallback(async (): Promise<SyncResult> => {
    if (!user) {
      return { success: false, pushed: 0, pulled: 0, reason: 'User not authenticated' };
    }
    
    if (!isOnline) {
      toast({
        title: 'Offline',
        description: 'Cannot sync while offline. Your data will sync when you reconnect.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return { success: false, pushed: 0, pulled: 0, reason: 'Offline' };
    }
    
    setIsSyncing(true);
    
    try {
      // First push local changes to Firestore
      const pushed = await pushToFirestore();
      
      // Then pull changes from Firestore
      const pulled = await pullFromFirestore();
      
      setLastSyncTime(new Date());
      
      setIsSyncing(false);
      return { success: true, pushed, pulled };
    } catch (error) {
      console.error('Sync error:', error);
      setIsSyncing(false);
      return { 
        success: false, 
        pushed: 0, 
        pulled: 0, 
        reason: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }, [user, isOnline, pushToFirestore, pullFromFirestore, toast]);
  
  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    performSync,
  };
};
