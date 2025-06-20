import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { deleteUser, updatePassword } from 'firebase/auth';
import { db } from '../firebase';
import { AdminUser } from '../types';
import { ADMIN_EMAIL } from '../constants/firebasePaths';

export const adminService = {
  async getAllUsers(): Promise<AdminUser[]> {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users: AdminUser[] = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const uid = userDoc.id;
      
      // Get media count
      const mediaSnapshot = await getDocs(collection(db, `users/${uid}/media`));
      const mediaCount = mediaSnapshot.size;
      
      // Get story count
      const storySnapshot = await getDocs(collection(db, `users/${uid}/stories`));
      const storyCount = storySnapshot.size;
      
      users.push({
        uid,
        email: userData.profile?.email || '',
        displayName: userData.profile?.displayName || '',
        mediaCount,
        storyCount,
        createdAt: userData.profile?.createdAt?.toDate() || new Date(),
        disabled: userData.disabled || false,
      });
    }
    
    return users.filter(user => user.email !== ADMIN_EMAIL);
  },

  async disableUser(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      disabled: true,
      updatedAt: new Date(),
    });
  },

  async enableUser(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      disabled: false,
      updatedAt: new Date(),
    });
  },

  async deleteUserData(uid: string): Promise<void> {
    // Delete user profile
    await deleteDoc(doc(db, 'users', uid));
    
    // Delete all media documents
    const mediaSnapshot = await getDocs(collection(db, `users/${uid}/media`));
    for (const mediaDoc of mediaSnapshot.docs) {
      await deleteDoc(mediaDoc.ref);
    }
    
    // Delete all story documents
    const storySnapshot = await getDocs(collection(db, `users/${uid}/stories`));
    for (const storyDoc of storySnapshot.docs) {
      await deleteDoc(storyDoc.ref);
    }
  },

  isAdmin(email: string): boolean {
    return email === ADMIN_EMAIL;
  }
};