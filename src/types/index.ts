export interface Family {
  id: string;
  name: string;
  address?: string;
  email: string;
  phone?: string;
  preferences: ParentPreferences;
  children: string[]; // Child IDs
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
}

export interface ParentPreferences {
  languagePreference: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dietaryRestrictions?: string[];
  allergies?: string[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  additionalNotes?: string;
}

export interface Child {
  id: string;
  familyId: string;
  name: string;
  dateOfBirth: string;
  gender?: string;
  medicalInfo?: {
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
  };
  schedule?: {
    regularDays: string[]; // e.g., ["Monday", "Wednesday", "Friday"]
    regularHours?: {
      start: string; // "09:00"
      end: string; // "17:00"
    };
  };
  milestones?: string[]; // Milestone IDs
  photoIds?: string[]; // Photo IDs
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
}

export interface Nanny {
  id: string;
  name: string;
  email: string;
  phone?: string;
  certifications?: string[];
  schedule?: {
    regularDays: string[];
    regularHours?: {
      start: string;
      end: string;
    };
  };
  childrenIds: string[]; // Child IDs they care for
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
}

export interface Session {
  id: string;
  nannyId: string;
  childId: string;
  familyId: string;
  startTime: number;
  endTime?: number;
  activities?: string[];
  notes?: string;
  isComplete: boolean;
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
}

export interface MilestoneEntry {
  id: string;
  childId: string;
  title: string;
  description?: string;
  date: number;
  category?: string;
  photoId?: string;
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
}

export interface Photo {
  id: string;
  childId: string;
  caption?: string;
  takenAt: number;
  storageUri?: string; // Firebase Storage URL when synced
  localUri: string; // Local blob URI when offline
  isUploaded: boolean;
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
}

export interface Feedback {
  id: string;
  userId: string;
  text: string;
  category?: string;
  isResolved: boolean;
  response?: string;
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'article' | 'video' | 'checklist';
  content: string;
  thumbnailUrl?: string;
  isAvailableOffline: boolean;
  createdAt: number;
  updatedAt: number;
  lastSyncedAt?: number;
  _syncedAt?: number;
  _id?: string;
  _rev?: string;
}

export interface SyncStatus {
  lastSyncedAt: number;
  isPendingSync: boolean;
  entities: {
    [entityType: string]: {
      pendingUploads: number;
      pendingDownloads: number;
    };
  };
}
