import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const Voyages = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [voyages, setVoyages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoyages = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('is_available', true)
          .order('created_at', { ascending: false });
        if (error) throw error;
        // Map DB fields to expected fields for UI
        setVoyages(
          (data || []).map((trip) => ({
            id: trip.id,
            title: trip.title,
            // fallback for region if not present
            region: trip.region || 'all',
            duration: trip.duration || '',
            price: trip.price,
            places: trip.places || [],
            pickup: trip.pickup || '',
            image: trip.image,
            description: trip.description,
          }))
        );
      } catch (err: any) {
        setError('Failed to load trips.');
      } finally {
        setLoading(false);
      }
    };
    fetchVoyages();
  }, []);

  const filteredVoyages = voyages.filter(voyage => {
    const matchesSearch = voyage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (voyage.places && voyage.places.some((place: string) => place.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesRegion = selectedRegion === 'all' || voyage.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('voyages.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from our carefully curated collection of exclusive travel experiences across Algeria.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <Input
            placeholder={t('voyages.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full md:w-48 rounded-lg border border-primary bg-white px-3 py-2 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40">
              <SelectValue placeholder={t('voyages.filter.all')} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-primary/20">
              <SelectItem value="all" className="font-medium text-gray-900">{t('voyages.filter.all')}</SelectItem>
              <SelectItem value="north" className="font-medium text-gray-900">North</SelectItem>
              <SelectItem value="south" className="font-medium text-gray-900">South</SelectItem>
              <SelectItem value="coast" className="font-medium text-gray-900">Coast</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading trips...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-12">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVoyages.map((voyage) => (
              <Card key={voyage.id} className="overflow-hidden hover-scale">
                <div className="relative h-48 bg-gray-200">
                  <img 
                    src={voyage.image} 
                    alt={voyage.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-medium">
                    {voyage.duration} {t('voyages.days')}
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">{voyage.title}</CardTitle>
                  <p className="text-gray-600 text-sm">{voyage.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('voyages.duration')}:</span>
                    <span className="font-medium">{voyage.duration} {t('voyages.days')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('voyages.pickup')}:</span>
                    <span className="font-medium">{voyage.pickup}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Places: </span>
                    <span className="font-medium">{voyage.places && voyage.places.length > 0 ? voyage.places.join(', ') : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {voyage.price?.toLocaleString()} {t('booking.currency')}
                    </span>
                    <Link to={`/booking?trip=${voyage.id}`}>
                      <Button className="bg-primary hover:bg-orange-600">
                        {t('voyages.book')}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Voyages;
