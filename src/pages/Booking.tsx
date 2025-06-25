import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const Booking = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const selectedTrip = searchParams.get('trip');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    trip: selectedTrip || '',
    people: '1',
    notes: ''
  });

  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripsError, setTripsError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<null | { code: string; discount: number }>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      setLoadingTrips(true);
      setTripsError(null);
      const { data, error } = await supabase
        .from('trips')
        .select('id, title, price, is_available')
        .eq('is_available', true);
      if (error) {
        setTripsError('Failed to load trips.');
        setTrips([]);
      } else {
        setTrips(
          (data || []).map(trip => ({
            id: trip.id,
            name: trip.title, // for compatibility with old code
            price: trip.price
          }))
        );
      }
      setLoadingTrips(false);
    };
    fetchTrips();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('bookings').insert([
      {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        trip: formData.trip,
        people: parseInt(formData.people),
        notes: formData.notes,
        status: 'pending',
        created_at: new Date().toISOString(),
        ...(appliedCoupon ? { coupon_code: appliedCoupon.code } : {})
      }
    ]);
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Booking Submitted!',
        description: "We'll contact you within 24 hours to confirm your reservation.",
      });
      setFormData({
        name: '',
        phone: '',
        email: '',
        trip: '',
        people: '1',
        notes: ''
      });
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    setAppliedCoupon(null);
    setDiscount(0);
    if (!couponCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .maybeSingle();
    if (error || !data) {
      setCouponError('Invalid or expired coupon.');
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('This coupon has expired.');
      return;
    }
    setDiscount(data.discount);
    setAppliedCoupon({ code: data.code, discount: data.discount });
  };

  const selectedTripData = trips.find(trip => trip.id === formData.trip);
  const totalPrice = selectedTripData ? selectedTripData.price * parseInt(formData.people) : 0;
  const discountedPrice = totalPrice - (totalPrice * discount) / 100;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('booking.title')}
            </h1>
            <p className="text-lg text-gray-600">
              Fill out the form below to book your exclusive travel experience.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('booking.name')} *</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('booking.phone')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('booking.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="trip">{t('booking.trip')} *</Label>
                    {loadingTrips ? (
                      <div className="text-gray-500 text-sm py-2">Loading trips...</div>
                    ) : tripsError ? (
                      <div className="text-red-500 text-sm py-2">{tripsError}</div>
                    ) : (
                      <Select value={formData.trip} onValueChange={(value) => setFormData({...formData, trip: value})}>
                        <SelectTrigger className="rounded-lg border-2 border-primary/30 focus:ring-2 focus:ring-primary/40 px-4 py-3 text-base font-medium bg-white shadow-sm">
                          <SelectValue placeholder="Select a trip">
                            {trips.find(trip => trip.id === formData.trip)?.name || ''}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="rounded-lg shadow-lg bg-white">
                          {trips.map((trip) => (
                            <SelectItem
                              key={trip.id}
                              value={trip.id}
                              className="px-4 py-3 rounded-lg flex flex-col items-start gap-1 hover:bg-primary/10 transition-colors cursor-pointer"
                            >
                              <span className="font-semibold text-gray-900">{trip.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="people">{t('booking.people')} *</Label>
                    <Select value={formData.people} onValueChange={(value) => setFormData({...formData, people: value})}>
                      <SelectTrigger className="rounded-lg border-2 border-primary/30 focus:ring-2 focus:ring-primary/40 px-4 py-3 text-base font-medium bg-white shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg shadow-lg bg-white">
                        {[1,2,3,4,5,6,7,8].map((num) => (
                          <SelectItem
                            key={num}
                            value={num.toString()}
                            className="px-4 py-3 rounded-lg font-medium hover:bg-primary/10 transition-colors cursor-pointer"
                          >
                            <span className={formData.people === num.toString() ? 'font-bold text-primary' : ''}>
                              {num} {num === 1 ? 'Person' : 'People'}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t('booking.notes')}</Label>
                  <Textarea
                    id="notes"
                    rows={4}
                    placeholder="Any special requests or dietary requirements..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coupon">Coupon</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                    />
                    <Button type="button" onClick={handleApplyCoupon} disabled={!!appliedCoupon}>
                      {appliedCoupon ? 'Applied' : 'Apply'}
                    </Button>
                    {appliedCoupon && (
                      <Button type="button" variant="outline" onClick={() => { setAppliedCoupon(null); setDiscount(0); setCouponCode(''); }}>
                        Remove
                      </Button>
                    )}
                  </div>
                  {couponError && <div className="text-red-500 text-sm">{couponError}</div>}
                  {appliedCoupon && <div className="text-green-600 text-sm">Coupon applied: {appliedCoupon.code} ({appliedCoupon.discount}% off)</div>}
                </div>

                {totalPrice > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total Price:</span>
                      <span className={discount > 0 ? "text-primary line-through" : "text-primary"}>
                        {totalPrice.toLocaleString()} {t('booking.currency')}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between items-center text-lg font-semibold text-green-700">
                        <span>Discounted Price:</span>
                        <span className="text-primary">{discountedPrice.toLocaleString()} {t('booking.currency')}</span>
                      </div>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full bg-primary hover:bg-orange-600" size="lg">
                  {t('booking.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <style>{`
        [data-state='checked'] svg {
          display: none !important;
        }
      `}</style>
    </Layout>
  );
};

export default Booking;
