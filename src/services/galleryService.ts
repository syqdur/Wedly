import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  updateDoc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { MediaItem, StoryItem } from '../types';
import { FIREBASE_PATHS } from '../constants/firebasePaths';

export const galleryService = {
  async uploadMedia(
    uid: string, 
    file: File, 
    description?: string, 
    tags?: string[]
  ): Promise<MediaItem> {
    const filename = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, FIREBASE_PATHS.GALLERY_MEDIA(uid, filename));
    
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    
    const mediaItem: Omit<MediaItem, 'id'> = {
      userId: uid,
      filename,
      url,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      size: file.size,
      uploadedAt: new Date(),
      description,
      tags,
    };
    
    const docRef = await addDoc(collection(db, FIREBASE_PATHS.USER_MEDIA(uid)), mediaItem);
    
    return { id: docRef.id, ...mediaItem };
  },

  async uploadStory(uid: string, file: File): Promise<StoryItem> {
    const filename = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, FIREBASE_PATHS.GALLERY_STORIES(uid, filename));
    
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    
    const storyItem: Omit<StoryItem, 'id'> = {
      userId: uid,
      filename,
      url,
      type: file.type.startsWith('video/') ? 'video' : 'image',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      views: 0,
    };
    
    const docRef = await addDoc(collection(db, FIREBASE_PATHS.USER_STORIES(uid)), storyItem);
    
    return { id: docRef.id, ...storyItem };
  },

  async getUserMedia(uid: string): Promise<MediaItem[]> {
    const q = query(
      collection(db, FIREBASE_PATHS.USER_MEDIA(uid)), 
      orderBy('uploadedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MediaItem[];
  },

  async getUserStories(uid: string): Promise<StoryItem[]> {
    const q = query(
      collection(db, FIREBASE_PATHS.USER_STORIES(uid)), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StoryItem[];
  },

  async deleteMedia(uid: string, mediaId: string, filename: string): Promise<void> {
    // Delete from storage
    const storageRef = ref(storage, FIREBASE_PATHS.GALLERY_MEDIA(uid, filename));
    await deleteObject(storageRef);
    
    // Delete from firestore
    await deleteDoc(doc(db, FIREBASE_PATHS.USER_MEDIA(uid), mediaId));
  },

  async deleteStory(uid: string, storyId: string, filename: string): Promise<void> {
    // Delete from storage
    const storageRef = ref(storage, FIREBASE_PATHS.GALLERY_STORIES(uid, filename));
    await deleteObject(storageRef);
    
    // Delete from firestore
    await deleteDoc(doc(db, FIREBASE_PATHS.USER_STORIES(uid), storyId));
  },

  async updateStoryViews(uid: string, storyId: string): Promise<void> {
    const docRef = doc(db, FIREBASE_PATHS.USER_STORIES(uid), storyId);
    await updateDoc(docRef, {
      views: (await doc(db, FIREBASE_PATHS.USER_STORIES(uid), storyId).get()).data()?.views + 1 || 1
    });
  }
};