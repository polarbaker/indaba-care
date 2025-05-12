import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, firestore } from './firebase';
import { photoDB } from './db';
import { Photo } from '../types';

// Convert a data URL to a Blob
const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

// Upload a single photo to Firebase Storage
export const uploadPhoto = async (photo: Photo): Promise<string> => {
  try {
    // Convert local URI (data URL) to Blob for upload
    const blob = dataURLtoBlob(photo.localUri);
    
    // Create a reference to the photo in Firebase Storage
    const photoRef = ref(storage, `photos/${photo.childId}/${photo.id}`);
    
    // Upload the photo
    await uploadBytes(photoRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(photoRef);
    
    // Update Firestore with the storage URL
    await updateDoc(doc(firestore, 'photos', photo.id), {
      storageUri: downloadURL,
      isUploaded: true,
      updatedAt: Date.now(),
    });
    
    // Update local PouchDB record
    const localPhoto = await photoDB.get(photo.id);
    await photoDB.put({
      ...localPhoto,
      storageUri: downloadURL,
      isUploaded: true,
      updatedAt: Date.now(),
      lastSyncedAt: Date.now(),
    });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

// Upload all queued photos (not yet uploaded)
export const uploadQueuedPhotos = async (): Promise<number> => {
  try {
    // Get all photos that haven't been uploaded yet
    const result = await photoDB.allDocs({
      include_docs: true,
    });
    
    const photosToUpload = result.rows
      .map(row => row.doc as Photo)
      .filter(photo => photo && !photo.isUploaded);
    
    if (photosToUpload.length === 0) {
      return 0;
    }
    
    // Upload each photo
    const uploadPromises = photosToUpload.map(uploadPhoto);
    await Promise.all(uploadPromises);
    
    return photosToUpload.length;
  } catch (error) {
    console.error('Error uploading queued photos:', error);
    return 0;
  }
};

// Capture a photo from the device camera or file input
export const capturePhoto = async (
  childId: string,
  dataURI: string,
  caption?: string
): Promise<Photo> => {
  try {
    const newPhoto: Photo = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      childId,
      caption: caption || '',
      takenAt: Date.now(),
      localUri: dataURI,
      isUploaded: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Save to local PouchDB
    await photoDB.put({
      ...newPhoto,
      _id: newPhoto.id,
    });
    
    return newPhoto;
  } catch (error) {
    console.error('Error capturing photo:', error);
    throw error;
  }
};
