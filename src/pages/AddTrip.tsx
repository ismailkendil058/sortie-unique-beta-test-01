import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';

const AddTrip = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    region: '',
    duration: '',
    maxPeople: '',
    price: '',
    features: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    const fileExt = file.name.split('.').pop();
    const fileName = `trips/${user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage
      .from('gallery')
      .getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSaveTrip = async () => {
    if (!formData.title || !formData.description || !formData.destination) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    setUploading(true);
    try {
      let imageUrl = '/placeholder.svg';
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }
      const tripData = {
        title: formData.title,
        description: formData.description,
        destination: formData.destination,
        region: formData.region,
        duration: formData.duration,
        max_people: parseInt(formData.maxPeople) || 0,
        price: parseFloat(formData.price) || 0,
        image: imageUrl,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
        is_available: true
      };
      const { error } = await supabase
        .from('trips')
        .insert([tripData]);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Trip added successfully!",
      });
      navigate('/admin?tab=trips');
    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: "Error",
        description: "Failed to save trip",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Trip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter trip title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="Enter destination"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <select
                  id="region"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={formData.region}
                  onChange={e => setFormData({ ...formData, region: e.target.value })}
                >
                  <option value="">Select region</option>
                  <option value="north">North</option>
                  <option value="south">South</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g., 3 days / 2 nights"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPeople">Max People</Label>
                <Input
                  id="maxPeople"
                  type="number"
                  value={formData.maxPeople}
                  onChange={(e) => handleInputChange('maxPeople', e.target.value)}
                  placeholder="Maximum number of people"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (DZD)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Price per person"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter trip description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input
                id="features"
                value={formData.features}
                onChange={(e) => handleInputChange('features', e.target.value)}
                placeholder="e.g., Camel trekking, Desert camping, Traditional meals"
              />
            </div>
            <div className="flex gap-2 items-center mt-4">
              <Button size="sm" className="px-2 py-1 text-xs" onClick={handleSaveTrip} disabled={uploading}>
                {uploading ? 'Saving...' : 'Save Trip'}
              </Button>
              <Button size="sm" className="px-2 py-1 text-xs" variant="outline" onClick={() => navigate('/admin?tab=trips')} disabled={uploading}>
                Cancel
              </Button>
              <input
                type="file"
                accept="image/*"
                id="trip-image-input"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <Button
                size="sm"
                className="px-2 py-1 text-xs"
                type="button"
                variant="outline"
                onClick={() => document.getElementById('trip-image-input')?.click()}
                disabled={uploading}
              >
                Upload Trip Image
              </Button>
              {selectedFile && (
                <Button
                  size="sm"
                  className="px-2 py-1 text-xs"
                  type="button"
                  variant="ghost"
                  onClick={removeSelectedImage}
                  disabled={uploading}
                >
                  Remove
                </Button>
              )}
            </div>
            {(imagePreview) && (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="Trip preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                      <p>Uploading...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AddTrip; 