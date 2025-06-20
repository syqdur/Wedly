import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { UserProfile, MediaItem, StoryItem } from '../../types';
import { authService } from '../../services/authService';
import { galleryService } from '../../services/galleryService';
import { ProfileCard } from '../Profile/ProfileCard';
import { StoriesSection } from './StoriesSection';
import { MediaGrid } from './MediaGrid';
import { Navigation } from '../Navigation/Navigation';
import { Loader2 } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.uid === userId;

  useEffect(() => {
    if (!userId) return;

    const loadGalleryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load user profile
        const userProfile = await authService.getUserProfile(userId);
        if (!userProfile) {
          setError('Benutzer nicht gefunden');
          return;
        }
        setProfile(userProfile);

        // Load media and stories
        const [userMedia, userStories] = await Promise.all([
          galleryService.getUserMedia(userId),
          galleryService.getUserStories(userId)
        ]);

        setMedia(userMedia);
        setStories(userStories);
      } catch (error) {
        console.error('Error loading gallery data:', error);
        setError('Fehler beim Laden der Galerie');
      } finally {
        setLoading(false);
      }
    };

    loadGalleryData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">Galerie wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Galerie nicht gefunden</h1>
          <p className="text-gray-600">{error || 'Die angeforderte Galerie konnte nicht gefunden werden.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ProfileCard
            profile={profile}
            onProfileUpdate={setProfile}
            isOwner={isOwner}
          />

          <StoriesSection
            userId={userId!}
            stories={stories}
            onStoriesUpdate={setStories}
            isOwner={isOwner}
          />

          <MediaGrid
            userId={userId!}
            media={media}
            onMediaUpdate={setMedia}
            isOwner={isOwner}
          />
        </motion.div>
      </div>
    </div>
  );
};