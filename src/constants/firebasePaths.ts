export const FIREBASE_PATHS = {
  // Storage paths
  AVATARS: (uid: string) => `avatars/${uid}.jpg`,
  GALLERY_MEDIA: (uid: string, filename: string) => `galleries/${uid}/media/${filename}`,
  GALLERY_STORIES: (uid: string, filename: string) => `galleries/${uid}/stories/${filename}`,
  
  // Firestore paths
  USER_PROFILE: (uid: string) => `users/${uid}/profile`,
  USER_MEDIA: (uid: string) => `users/${uid}/media`,
  USER_STORIES: (uid: string) => `users/${uid}/stories`,
  USERS_COLLECTION: 'users',
} as const;

export const ADMIN_EMAIL = 'admin@site.com';
export const ADMIN_PASSWORD = 'Unhack85!$';