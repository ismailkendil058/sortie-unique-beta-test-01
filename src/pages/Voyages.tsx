import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Layout from '@/components/Layout';

const Voyages = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Sample voyage data
  const voyages = [
    {
      id: 1,
      title: 'Sahara Desert Adventure',
      titleFr: 'Aventure du Désert du Sahara',
      region: 'south',
      duration: 5,
      price: 45000,
      places: ['Ghardaïa', 'Taghit', 'Timimoun'],
      pickup: 'Algiers Central',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop',
      description: 'Experience the magic of the Sahara with dune surfing and traditional Berber camps.',
      descriptionFr: 'Vivez la magie du Sahara avec le surf sur dunes et les camps berbères traditionnels.'
    },
    {
      id: 2,
      title: 'Kabylie Mountains Trek',
      titleFr: 'Trekking des Montagnes de Kabylie',
      region: 'north',
      duration: 3,
      price: 28000,
      places: ['Tizi Ouzou', 'Djurdjura', 'Ifri'],
      pickup: 'Algiers University',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      description: 'Discover the green mountains and Berber villages of Kabylie.',
      descriptionFr: 'Découvrez les montagnes vertes et les villages berbères de Kabylie.'
    },
    {
      id: 3,
      title: 'Mediterranean Coast Discovery',
      titleFr: 'Découverte de la Côte Méditerranéenne',
      region: 'coast',
      duration: 4,
      price: 35000,
      places: ['Annaba', 'Jijel', 'Béjaïa'],
      pickup: 'Constantine Airport',
      image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=300&fit=crop',
      description: 'Explore pristine beaches and historic coastal cities.',
      descriptionFr: 'Explorez des plages vierges et des villes côtières historiques.'
    }
  ];

  const filteredVoyages = voyages.filter(voyage => {
    const matchesSearch = voyage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voyage.titleFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voyage.places.some(place => place.toLowerCase().includes(searchTerm.toLowerCase()));
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
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder={t('voyages.filter.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('voyages.filter.all')}</SelectItem>
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="south">South</SelectItem>
              <SelectItem value="coast">Coast</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voyages Grid */}
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
                  <span className="font-medium">{voyage.places.join(', ')}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {voyage.price.toLocaleString()} {t('booking.currency')}
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
      </div>
    </Layout>
  );
};

export default Voyages;
