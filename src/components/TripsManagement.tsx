import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, MapPin, Calendar, Users, Upload, X } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  duration: string;
  maxPeople: number;
  price: number;
  image: string;
  features: string[];
  created_at?: string;
}

const TripsManagement = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destination: '',
    duration: '',
    maxPeople: '',
    price: '',
    features: ''
  });

  const formRef = useRef<HTMLDivElement>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchTrips();
  }, []);

  // Fetch trips again whenever the location changes back to /admin or /admin?tab=trips
  useEffect(() => {
    if (
      location.pathname === '/admin' ||
      location.pathname === '/admin/' ||
      location.pathname.startsWith('/admin')
    ) {
      fetchTrips();
    }
  }, [location]);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trips:', error);
        // Fallback to local data if table doesn't exist yet
        setTrips([
          {
            id: '1',
            title: 'Sahara Desert Adventure',
            description: 'Experience the magic of the Sahara desert with camel trekking and overnight camping under the stars.',
            destination: 'Taghit, Algeria',
            duration: '3 days / 2 nights',
            maxPeople: 8,
            price: 299,
            image: '/placeholder.svg',
            features: ['Camel trekking', 'Desert camping', 'Traditional meals', 'Local guide']
          },
          {
            id: '2',
            title: 'Kabylie Mountains Trek',
            description: 'Explore the beautiful Kabylie mountains with hiking trails and traditional Berber villages.',
            destination: 'Tizi Ouzou, Algeria',
            duration: '2 days / 1 night',
            maxPeople: 12,
            price: 199,
            image: '/placeholder.svg',
            features: ['Mountain hiking', 'Village visits', 'Traditional cuisine', 'Cultural immersion']
          }
        ]);
        return;
      }
      
      // Transform database data to match our interface
      const transformedTrips: Trip[] = (data || []).map(trip => ({
        id: trip.id,
        title: trip.title,
        description: trip.description,
        destination: trip.destination,
        duration: trip.duration || '',
        maxPeople: trip.max_people,
        price: trip.price,
        image: trip.image,
        features: trip.features || [],
        created_at: trip.created_at
      }));
      
      setTrips(transformedTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
      // Fallback to local data
      setTrips([
        {
          id: '1',
          title: 'Sahara Desert Adventure',
          description: 'Experience the magic of the Sahara desert with camel trekking and overnight camping under the stars.',
          destination: 'Taghit, Algeria',
          duration: '3 days / 2 nights',
          maxPeople: 8,
          price: 299,
          image: '/placeholder.svg',
          features: ['Camel trekking', 'Desert camping', 'Traditional meals', 'Local guide']
        },
        {
          id: '2',
          title: 'Kabylie Mountains Trek',
          description: 'Explore the beautiful Kabylie mountains with hiking trails and traditional Berber villages.',
          destination: 'Tizi Ouzou, Algeria',
          duration: '2 days / 1 night',
          maxPeople: 12,
          price: 199,
          image: '/placeholder.svg',
          features: ['Mountain hiking', 'Village visits', 'Traditional cuisine', 'Cultural immersion']
        }
      ]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      destination: '',
      duration: '',
      maxPeople: '',
      price: '',
      features: ''
    });
    setSelectedFile(null);
    setImagePreview(null);
    setEditingTrip(null);
    setIsAddingTrip(false);
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
      let imageUrl = editingTrip?.image || '/placeholder.svg';
      
      // Upload new image if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const tripData = {
        title: formData.title,
        description: formData.description,
        destination: formData.destination,
        duration: formData.duration,
        max_people: parseInt(formData.maxPeople) || 0,
        price: parseFloat(formData.price) || 0,
        image: imageUrl,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };

      if (editingTrip) {
        // Update existing trip
        const { error } = await supabase
          .from('trips')
          .update(tripData)
          .eq('id', editingTrip.id);

        if (error) throw error;

        // Update local state
        const updatedTrip: Trip = {
          id: editingTrip.id,
          title: tripData.title,
          description: tripData.description,
          destination: tripData.destination,
          duration: tripData.duration,
          maxPeople: tripData.max_people,
          price: tripData.price,
          image: tripData.image,
          features: tripData.features,
          created_at: editingTrip.created_at
        };

        setTrips(prev => prev.map(trip => trip.id === editingTrip.id ? updatedTrip : trip));
        toast({
          title: "Success",
          description: "Trip updated successfully!",
        });
      } else {
        // Create new trip
        const { data, error } = await supabase
          .from('trips')
          .insert([tripData])
          .select();

        if (error) throw error;

        const newTripData = data?.[0];
        if (newTripData) {
          const newTrip: Trip = {
            id: newTripData.id,
            title: newTripData.title,
            description: newTripData.description,
            destination: newTripData.destination,
            duration: newTripData.duration || '',
            maxPeople: newTripData.max_people,
            price: newTripData.price,
            image: newTripData.image,
            features: newTripData.features || [],
            created_at: newTripData.created_at
          };
          setTrips(prev => [newTrip, ...prev]);
        }
        
        toast({
          title: "Success",
          description: "Trip added successfully!",
        });
      }

      resetForm();
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

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title,
      description: trip.description,
      destination: trip.destination,
      duration: trip.duration,
      maxPeople: trip.maxPeople.toString(),
      price: trip.price.toString(),
      features: trip.features.join(', ')
    });
    setImagePreview(trip.image !== '/placeholder.svg' ? trip.image : null);
    setIsAddingTrip(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;

      setTrips(prev => prev.filter(trip => trip.id !== tripId));
      setDeleteDialogOpen(false);
      setTripToDelete(null);
      toast({
        title: 'Deleted',
        description: 'Trip has been deleted.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTripConfirmed = (tripId: string) => {
    handleDeleteTrip(tripId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Manage your travel packages and destinations</p>
        <Button onClick={() => navigate('/add-trip')}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Trip
        </Button>
      </div>

      <div className="grid gap-6 mb-8">
        {trips.map((trip) => (
          <Card key={trip.id}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-xl font-semibold">{trip.title}</h3>
                  <p className="text-gray-600">{trip.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {trip.features.map((feature, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-1 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Max {trip.maxPeople} people</span>
                  </div>
                  <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <span>{trip.price} DZD</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/edit-trip/${trip.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog open={deleteDialogOpen && tripToDelete === trip.id} onOpenChange={(open) => {
                      setDeleteDialogOpen(open);
                      if (!open) setTripToDelete(null);
                    }}>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeleteDialogOpen(true);
                            setTripToDelete(trip.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this trip? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTripConfirmed(trip.id)} autoFocus>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ...rest of your component (add/edit form, etc.) */}
    </div>
  );
};

export default TripsManagement;