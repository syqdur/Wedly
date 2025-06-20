export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  links?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaItem {
  id: string;
  userId: string;
  filename: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  uploadedAt: Date;
  description?: string;
  tags?: string[];
}

export interface StoryItem {
  id: string;
  userId: string;
  filename: string;
  url: string;
  type: 'image' | 'video';
  createdAt: Date;
  expiresAt?: Date;
  views?: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  mediaCount: number;
  storyCount: number;
  createdAt: Date;
  disabled?: boolean;
}