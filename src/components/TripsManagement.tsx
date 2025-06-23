import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, MapPin, Calendar, Users } from 'lucide-react';
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
}

const TripsManagement = () => {
  const [trips, setTrips] = useState<Trip[]>([
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

  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [isAddingTrip, setIsAddingTrip] = useState(false);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    setEditingTrip(null);
    setIsAddingTrip(false);
  };

  const handleSaveTrip = () => {
    if (!formData.title || !formData.description || !formData.destination) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const tripData: Trip = {
      id: editingTrip?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      destination: formData.destination,
      duration: formData.duration,
      maxPeople: parseInt(formData.maxPeople) || 0,
      price: parseFloat(formData.price) || 0,
      image: '/placeholder.svg',
      features: formData.features.split(',').map(f => f.trim()).filter(f => f)
    };

    if (editingTrip) {
      setTrips(prev => prev.map(trip => trip.id === editingTrip.id ? tripData : trip));
      toast({
        title: "Success",
        description: "Trip updated successfully!",
      });
    } else {
      setTrips(prev => [...prev, tripData]);
      toast({
        title: "Success",
        description: "Trip added successfully!",
      });
    }

    resetForm();
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
    setIsAddingTrip(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleDeleteTrip = (tripId: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
    toast({
      title: "Success",
      description: "Trip deleted successfully!",
    });
  };

  const handleDeleteTripConfirmed = (tripId: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
    setDeleteDialogOpen(false);
    setTripToDelete(null);
    toast({
      title: 'Deleted',
      description: 'Trip has been deleted.',
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Manage your travel packages and destinations</p>
        <Button onClick={() => setIsAddingTrip(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Trip
        </Button>
      </div>

      {isAddingTrip && (
        <div ref={formRef}>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingTrip ? 'Edit Trip' : 'Add New Trip'}
              </CardTitle>
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
              <div className="flex gap-2">
                <Button onClick={handleSaveTrip}>
                  {editingTrip ? 'Update Trip' : 'Save Trip'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6">
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
                      onClick={() => handleEditTrip(trip)}
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
    </div>
  );
};

export default TripsManagement;
