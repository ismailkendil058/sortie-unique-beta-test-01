import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Mountain, Trees, Sun, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { t } = useLanguage();
  const [galleryItems, setGalleryItems] = useState([]);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      if (!error) setGalleryItems(data || []);
    };
    fetchGalleryItems();
  }, []);

  return (
    <Layout>
      <div className="relative">
        {/* Hero Section with Nature Background */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Nature Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`
            }}
          ></div>
          
          {/* Natural Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-orange-900/30"></div>
          
          {/* Organic Shape Overlays */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-green-500/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
                {t('home.hero.title')}
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto animate-fade-in leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
                <Link to="/voyages">
                  <Button size="lg" className="bg-primary hover:bg-orange-600 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <Mountain className="w-5 h-5 mr-2" />
                    {t('home.hero.cta')}
                  </Button>
                </Link>
                <a 
                  href="https://www.instagram.com/sortieunique.dz?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-orange-600 transition-colors flex items-center gap-2 bg-white/80 px-6 py-3 rounded-full hover:bg-white/90 shadow-md"
                >
                  <span>{t('home.instagram')}</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with Nature Theme */}
        <section className="py-20 bg-gradient-to-b from-green-50/50 to-white relative overflow-hidden">
          {/* Natural Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-100/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Discover Algeria's Natural Wonders</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Experience the untouched beauty of Algeria's diverse landscapes</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MapPin className="w-10 h-10 text-green-700" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Hidden Natural Gems</h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore pristine oases, ancient rock formations, and untouched desert landscapes that few have witnessed.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Sun className="w-10 h-10 text-orange-700" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Authentic Experiences</h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect with local communities and experience traditional ways of life in harmony with nature.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Trees className="w-10 h-10 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Sustainable Adventures</h3>
                <p className="text-gray-600 leading-relaxed">
                  Journey responsibly through protected areas while preserving the natural beauty for future generations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Nature Gallery Teaser */}
        <section className="py-20 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Breathtaking Landscapes Await</h2>
              <p className="text-lg text-gray-600">From the Sahara's golden dunes to the Atlas Mountains' green valleys</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {galleryItems.length === 0 ? (
                <div className="col-span-2 md:col-span-4 text-center text-gray-400 py-8">No images in the gallery yet.</div>
              ) : (
                galleryItems.map((item) => (
                  <div key={item.id} className="aspect-square bg-gradient-to-br from-orange-200 to-orange-300 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src={item.image_url} 
                      alt={item.title || 'Gallery image'} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center">
              <Link to="/gallery">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white rounded-full px-8 py-3">
                  View Complete Gallery
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
