import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Play, X } from 'lucide-react';
import { MediaItem } from '../../types';
import { galleryService } from '../../services/galleryService';
import toast from 'react-hot-toast';

interface MediaGridProps {
  userId: string;
  media: MediaItem[];
  onMediaUpdate: (media: MediaItem[]) => void;
  isOwner: boolean;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  userId,
  media,
  onMediaUpdate,
  isOwner
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast.error(`${file.name}: Nur Bilder und Videos sind erlaubt`);
          return null;
        }
        return galleryService.uploadMedia(userId, file);
      });

      const results = await Promise.allSettled(uploadPromises.filter(Boolean) as Promise<MediaItem>[]);
      const newMedia = results
        .filter((result): result is PromiseFulfilledResult<MediaItem> => result.status === 'fulfilled')
        .map(result => result.value);

      onMediaUpdate([...newMedia, ...media]);
      toast.success(`${newMedia.length} Datei(en) erfolgreich hochgeladen! 📸`);
    } catch (error) {
      console.error('Media upload error:', error);
      toast.error('Fehler beim Hochladen der Medien');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaItem: MediaItem) => {
    try {
      await galleryService.deleteMedia(userId, mediaItem.id, mediaItem.filename);
      onMediaUpdate(media.filter(item => item.id !== mediaItem.id));
      toast.success('Medien erfolgreich gelöscht!');
    } catch (error) {
      console.error('Media delete error:', error);
      toast.error('Fehler beim Löschen der Medien');
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Medien-Galerie</h2>
          {isOwner && (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                multiple
                disabled={uploading}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2 cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span>Upload</span>
              </motion.div>
            </label>
          )}
        </div>

        {media.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">Keine Medien verfügbar</p>
            {isOwner && (
              <p className="text-gray-400 text-sm mt-2">Laden Sie Ihre ersten Bilder oder Videos hoch</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                
                {isOwner && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMedia(item);
                      }}
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Media Viewer Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.filename}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  controls
                  autoPlay
                />
              )}
              
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};