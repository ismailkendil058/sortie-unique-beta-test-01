import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Upload, Trash2, Plus, Star, StarOff } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';

type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
  is_featured?: boolean;
};

const Gallery = () => {
  const { user } = useAuth();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{id: string, url: string} | null>(null);

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
      toast({
        title: "Error",
        description: "Failed to load gallery items",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !user || !title.trim()) {
      toast({
        title: "Error",
        description: "Please select a file and enter a title",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('gallery_images')
        .insert({
          title,
          image_url: publicUrl,
        });

      if (insertError) throw insertError;

      // Add to local state immediately for better UX
      const newItem: GalleryItem = {
        id: Date.now().toString(), // Temporary ID
        title,
        image_url: publicUrl,
        created_at: new Date().toISOString(),
      };

      setGalleryItems(prev => [newItem, ...prev]);

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });

      setTitle('');
      setSelectedFile(null);
      setShowUploadForm(false);
      
      // Refresh from server to get the real ID
      fetchGalleryItems();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSetFeatured = async (id: string, imageUrl: string) => {
    try {
      // First, remove featured status from all other images
      await supabase
        .from('gallery_images')
        .update({ is_featured: false })
        .neq('id', id);

      // Then set this image as featured
      const { error } = await supabase
        .from('gallery_images')
        .update({ is_featured: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setGalleryItems(prev => prev.map(item => ({
        ...item,
        is_featured: item.id === id
      })));

      toast({
        title: "Success",
        description: "Image set as featured for home page!",
      });
    } catch (error) {
      console.error('Error setting featured image:', error);
      toast({
        title: "Error",
        description: "Failed to set featured image",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFeatured = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ is_featured: false })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setGalleryItems(prev => prev.map(item => ({
        ...item,
        is_featured: item.id === id ? false : item.is_featured
      })));

      toast({
        title: "Success",
        description: "Featured image removed from home page!",
      });
    } catch (error) {
      console.error('Error removing featured image:', error);
      toast({
        title: "Error",
        description: "Failed to remove featured image",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Extract file path from URL to delete from storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-2).join('/');
      
      await supabase.storage
        .from('gallery')
        .remove([fileName]);

      // Remove from local state immediately
      setGalleryItems(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Success",
        description: "Image deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please sign in to manage the gallery.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Manage gallery images for your website</p>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
      </div>

      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload New Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter image title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Choose Image</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            {uploading && <p className="text-sm text-gray-600">Uploading...</p>}
            <div className="flex gap-2">
              <Button 
                onClick={handleConfirmUpload}
                disabled={uploading || !selectedFile || !title.trim()}
              >
                {uploading ? 'Uploading...' : 'Confirm Upload'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  setTitle('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {galleryItems.map((item) => (
          <div key={item.id} className="relative group flex justify-center items-center">
            <img
              src={item.image_url}
              alt="Gallery"
              className="cursor-pointer"
              style={{
                maxWidth: '60px',
                maxHeight: '50px',
                width: 'auto',
                height: 'auto',
                display: 'block',
                background: 'none',
                boxShadow: 'none',
                border: 'none',
                borderRadius: 0,
                padding: 0,
                margin: '0 auto',
              }}
              onClick={() => setFullscreenImage(item.image_url)}
            />
            <AlertDialog open={deleteDialogOpen && imageToDelete?.id === item.id} onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) setImageToDelete(null);
            }}>
              <AlertDialogTrigger asChild>
                <button
                  className="absolute top-1 right-1 bg-white/80 rounded-full p-1 shadow group-hover:opacity-100 opacity-80 hover:bg-red-100 hover:text-red-600 transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteDialogOpen(true);
                    setImageToDelete({id: item.id, url: item.image_url});
                  }}
                  title="Delete image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Image</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this image? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    if (imageToDelete) handleDelete(imageToDelete.id, imageToDelete.url);
                    setDeleteDialogOpen(false);
                    setImageToDelete(null);
                  }} autoFocus>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .gallery-img {
            max-width: 100px !important;
            max-height: 80px !important;
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
  );
};

export default Gallery;
