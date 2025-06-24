import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  created_at: string;
}

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the beauty of Algeria through our curated collection of stunning photographs
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading gallery...</p>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No images in the gallery yet.</p>
          </div>
        ) : (
          <div className={`grid ${galleryItems.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
            {galleryItems.map((item) => (
              <img
                key={item.id}
                src={item.image_url}
                alt={item.title}
                className="cursor-pointer hover:scale-105 transition-transform duration-300 rounded-lg shadow-md hover:shadow-lg"
                style={{
                  maxWidth: '200px',
                  maxHeight: '150px',
                  width: 'auto',
                  height: 'auto',
                  display: 'block',
                  background: 'none',
                  border: '2px solid #f3f4f6',
                  borderRadius: '8px',
                  padding: 0,
                  margin: '0 auto',
                }}
                onClick={() => setFullscreenImage(item.image_url)}
              />
            ))}
          </div>
        )}

        <style>{`
          @media (min-width: 768px) {
            .gallery-img {
              max-width: 250px !important;
              max-height: 180px !important;
            }
          }
          @media (min-width: 1024px) {
            .gallery-img {
              max-width: 300px !important;
              max-height: 220px !important;
            }
          }
        `}</style>

        {/* Fullscreen Modal */}
        {fullscreenImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setFullscreenImage(null)}>
            <img
              src={fullscreenImage}
              alt="Full Screen"
              className="max-w-full max-h-full rounded-xl shadow-2xl border-4 border-white"
              onClick={e => e.stopPropagation()}
            />
            <button
              className="absolute top-6 right-6 text-white text-3xl bg-black/60 rounded-full px-3 py-1 hover:bg-black/80 transition"
              onClick={() => setFullscreenImage(null)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Gallery;
