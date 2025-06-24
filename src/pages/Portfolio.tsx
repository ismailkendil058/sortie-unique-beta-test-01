import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';

const Portfolio = () => {
  const { t } = useLanguage();

  const galleryImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=400&fit=crop',
      alt: 'Sahara Desert Sunset',
      trip: 'Sahara Desert Adventure'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      alt: 'Mountain Trek',
      trip: 'Kabylie Mountains Trek'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=400&fit=crop',
      alt: 'Mediterranean Coast',
      trip: 'Mediterranean Coast Discovery'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
      alt: 'Desert Camping',
      trip: 'Sahara Desert Adventure'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
      alt: 'Forest Trail',
      trip: 'Kabylie Mountains Trek'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&h=400&fit=crop',
      alt: 'Coastal Sunset',
      trip: 'Mediterranean Coast Discovery'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('portfolio.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('portfolio.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <div 
              key={image.id} 
              className="group relative overflow-hidden rounded-lg shadow-lg hover-scale cursor-pointer"
            >
              <img 
                src={image.src} 
                alt={image.alt}
                className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="font-semibold text-lg">{image.alt}</h3>
                  <p className="text-sm text-gray-200">{image.trip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 bg-gray-50 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready for Your Own Adventure?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join us on one of our exclusive trips and create your own unforgettable memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/voyages"
              className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-md font-medium transition-colors"
            >
              View Our Voyages
            </a>
            <a 
              href="https://www.instagram.com/sortieunique.dz?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
              target="_blank" 
              rel="noopener noreferrer"
              className="border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-md font-medium transition-colors"
            >
              Follow on Instagram
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;
