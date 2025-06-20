import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { StoryItem } from '../../types';
import { galleryService } from '../../services/galleryService';
import toast from 'react-hot-toast';

interface StoriesSectionProps {
  userId: string;
  stories: StoryItem[];
  onStoriesUpdate: (stories: StoryItem[]) => void;
  isOwner: boolean;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  userId,
  stories,
  onStoriesUpdate,
  isOwner
}) => {
  const [viewingStory, setViewingStory] = useState<StoryItem | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Nur Bilder und Videos sind erlaubt');
      return;
    }

    setUploading(true);
    try {
      const newStory = await galleryService.uploadStory(userId, file);
      onStoriesUpdate([newStory, ...stories]);
      toast.success('Story hochgeladen! 📸');
    } catch (error) {
      console.error('Story upload error:', error);
      toast.error('Fehler beim Hochladen der Story');
    } finally {
      setUploading(false);
    }
  };

  const openStoryViewer = (story: StoryItem, index: number) => {
    setViewingStory(story);
    setCurrentStoryIndex(index);
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      const nextIndex = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIndex);
      setViewingStory(stories[nextIndex]);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      const prevIndex = currentStoryIndex - 1;
      setCurrentStoryIndex(prevIndex);
      setViewingStory(stories[prevIndex]);
    }
  };

  const closeStoryViewer = () => {
    setViewingStory(null);
  };

  useEffect(() => {
    if (viewingStory) {
      const timer = setTimeout(() => {
        nextStory();
      }, 5000); // Auto-advance after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [viewingStory, currentStoryIndex]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Stories</h2>
          {isOwner && (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white cursor-pointer hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
              >
                <Plus className="w-6 h-6" />
              </motion.div>
            </label>
          )}
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 cursor-pointer"
              onClick={() => openStoryViewer(story, index)}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <img
                    src={story.url}
                    alt="Story"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </motion.div>
          ))}
          
          {stories.length === 0 && !isOwner && (
            <p className="text-gray-500 text-center w-full py-8">Keine Stories verfügbar</p>
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={closeStoryViewer}
          >
            <div className="relative w-full max-w-md h-full max-h-[600px] flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative bg-white rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {viewingStory.type === 'image' ? (
                  <img
                    src={viewingStory.url}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={viewingStory.url}
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                  />
                )}
                
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <div className="flex space-x-1">
                    {stories.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full ${
                          index <= currentStoryIndex ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={closeStoryViewer}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {currentStoryIndex > 0 && (
                  <button
                    onClick={prevStory}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                
                {currentStoryIndex < stories.length - 1 && (
                  <button
                    onClick={nextStory}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};