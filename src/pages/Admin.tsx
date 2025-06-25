import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import Gallery from '@/components/Gallery';
import GoogleSheetsIntegration from '@/components/GoogleSheetsIntegration';
import TripsManagement from '@/components/TripsManagement';
import { LogOut, Trash2, Edit as EditIcon } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const Admin = () => {
  const { t } = useLanguage();
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [trips, setTrips] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    trip: '',
    people: '',
    notes: '',
    status: '',
    created_at: ''
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponForm, setCouponForm] = useState({ code: '', discount: 0 });

  const fetchBookings = async () => {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (!error) setBookings(data);
  };

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('is_available', true);
    if (!error) setTrips(data);
  };

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && user) {
      fetchBookings();
      fetchTrips();
      fetchCoupons();
      // Subscribe to realtime changes
      const subscription = supabase
        .channel('bookings-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
          fetchBookings();
        })
        .subscribe();
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user, loading, navigate]);

  const getTripName = (tripId) => {
    const trip = trips.find((t) => t.id === tripId);
    return trip ? trip.title : tripId;
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  const exportBookingsCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Trip', 'People', 'Pickup', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...bookings.map(booking => [
        booking.id,
        booking.name,
        booking.email,
        booking.phone,
        getTripName(booking.trip),
        booking.people,
        booking.pickup,
        booking.date,
        booking.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'bookings.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: "Bookings have been exported to CSV.",
    });
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking.id);
    setEditForm({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      trip: booking.trip,
      people: booking.people.toString(),
      notes: booking.notes || '',
      status: booking.status,
      created_at: booking.created_at
    });
  };

  const handleSaveEdit = async () => {
    const { error } = await supabase.from('bookings').update({
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      trip: editForm.trip,
      people: parseInt(editForm.people),
      notes: editForm.notes,
      status: editForm.status
    }).eq('id', editForm.id);
    if (!error) {
      setBookings(bks => bks.map(b => b.id === editForm.id ? { ...b, ...editForm, people: parseInt(editForm.people) } : b));
      setEditingBooking(null);
      toast({ title: 'Booking updated', description: 'Booking has been updated.' });
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteBooking = async (id) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) {
      setBookings(bks => bks.filter(b => b.id !== id));
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
      toast({ title: 'Deleted', description: 'Booking has been deleted.', variant: 'destructive' });
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await supabase.from('bookings').insert([
      {
        // ...other fields,
        trip: formData.trip, // this is now the UUID
        // ...
      }
    ]);
  };

  const addCoupon = async () => {
    if (!couponForm.code || !couponForm.discount) return;
    await supabase.from('coupons').insert([{ ...couponForm, is_active: true }]);
    setCouponForm({ code: '', discount: 0 });
    fetchCoupons();
  };

  const toggleCouponActive = async (id: number, is_active: boolean) => {
    await supabase.from('coupons').update({ is_active: !is_active }).eq('id', id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: number) => {
    await supabase.from('coupons').delete().eq('id', id);
    fetchCoupons();
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Manage Bookings</h2>
              <div className="flex gap-2">
                <Button onClick={fetchBookings} variant="secondary">
                  Refresh
                </Button>
                <Button onClick={exportBookingsCSV} variant="outline">
                  Export CSV
                </Button>
              </div>
            </div>
            {console.log('Bookings:', bookings)}
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    {editingBooking === booking.id ? (
                      <div className="mb-4 p-4 border rounded bg-gray-50">
                        <h3 className="font-bold mb-2">Edit Booking</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                          <input className="border p-2 rounded" placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                          <input className="border p-2 rounded" placeholder="Email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                          <input className="border p-2 rounded" placeholder="Phone" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                          <Select value={editForm.trip} onValueChange={value => setEditForm(f => ({ ...f, trip: value }))} className="border p-2 rounded">
                            <SelectTrigger>
                              {getTripName(editForm.trip)}
                            </SelectTrigger>
                            <SelectContent>
                              {trips.map(trip => (
                                <SelectItem key={trip.id} value={trip.id}>
                                  {trip.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <input className="border p-2 rounded" placeholder="People" value={editForm.people} onChange={e => setEditForm(f => ({ ...f, people: e.target.value }))} />
                          <input className="border p-2 rounded" placeholder="Notes" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                          <select className="border p-2 rounded" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                            <option value="confirmed">confirmed</option>
                            <option value="pending">pending</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingBooking(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.name}</h3>
                          <p className="text-gray-600">{booking.email}</p>
                          <p className="text-gray-600">{booking.phone}</p>
                        </div>
                        <div>
                          <p><strong>Trip:</strong> {getTripName(booking.trip)}</p>
                          <p><strong>People:</strong> {booking.people}</p>
                          {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
                          <p><strong>Coupon:</strong> {booking.coupon_code ? booking.coupon_code : 'No coupon'}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p><strong>Created:</strong> {booking.created_at ? booking.created_at.split('T')[0] : ''}</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              booking.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditBooking(booking)}>
                              <EditIcon className="w-4 h-4" />
                            </Button>
                            <AlertDialog open={deleteDialogOpen && bookingToDelete === booking.id} onOpenChange={(open) => {
                              setDeleteDialogOpen(open);
                              if (!open) setBookingToDelete(null);
                            }}>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" onClick={() => {
                                  setDeleteDialogOpen(true);
                                  setBookingToDelete(booking.id);
                                }}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this booking? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteBooking(booking.id)} autoFocus>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trips" className="space-y-6">
            <h2 className="text-2xl font-semibold">Manage Trips</h2>
            <TripsManagement />
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <h2 className="text-2xl font-semibold">Manage Gallery</h2>
            <Gallery />
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <h2 className="text-2xl font-semibold">Manage Coupons</h2>
            <div className="flex gap-2 mb-4">
              <Input placeholder="Code (e.g. rafik20)" value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value }))} />
              <Input type="number" placeholder="Discount %" value={couponForm.discount} onChange={e => setCouponForm(f => ({ ...f, discount: Number(e.target.value) }))} />
              <Button onClick={addCoupon}>Add Coupon</Button>
            </div>
            <ul className="space-y-2">
              {coupons.map(c => (
                <li key={c.id} className="flex items-center gap-4 p-2 border rounded">
                  <span className="font-mono">{c.code}</span>
                  <span>{c.discount}%</span>
                  <span className={c.is_active ? 'text-green-600' : 'text-gray-400'}>{c.is_active ? 'Active' : 'Inactive'}</span>
                  <Button size="sm" variant="outline" onClick={() => toggleCouponActive(c.id, c.is_active)}>{c.is_active ? 'Deactivate' : 'Activate'}</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteCoupon(c.id)}>Delete</Button>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
