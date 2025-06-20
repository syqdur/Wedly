import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Camera, Save, X } from 'lucide-react';
import { UserProfile } from '../../types';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

interface ProfileCardProps {
  profile: UserProfile;
  onProfileUpdate: (profile: UserProfile) => void;
  isOwner: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  onProfileUpdate, 
  isOwner 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        displayName,
        bio,
        updatedAt: new Date(),
      };
      
      await authService.updateUserProfile(profile.uid, updates);
      onProfileUpdate({ ...profile, ...updates });
      setIsEditing(false);
      toast.success('Profil aktualisiert! ✨');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Fehler beim Aktualisieren des Profils');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profile.displayName);
    setBio(profile.bio || '');
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6 mb-8"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            {isOwner && (
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-purple-500 focus:outline-none focus:border-purple-600 w-full"
                placeholder="Anzeigename"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
            )}
            <p className="text-gray-600">{profile.email}</p>
          </div>
        </div>
        
        {isOwner && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        {isEditing ? (
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Erzählen Sie etwas über sich..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
          />
        ) : (
          <p className="text-gray-700 leading-relaxed">
            {profile.bio || 'Keine Biografie verfügbar.'}
          </p>
        )}
      </div>
    </motion.div>
  );
};