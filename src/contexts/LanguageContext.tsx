
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.voyages': 'Voyages',
    'nav.booking': 'Booking',
    'nav.portfolio': 'Portfolio',
    'nav.admin': 'Admin',
    
    // Homepage
    'home.hero.title': 'Discover Algeria\'s Hidden Treasures',
    'home.hero.subtitle': 'Exclusive travel experiences curated for the adventurous soul',
    'home.hero.cta': 'Explore Our Voyages',
    'home.instagram': 'Follow Our Journey',
    
    // Voyages
    'voyages.title': 'Our Exclusive Voyages',
    'voyages.search': 'Search destinations...',
    'voyages.filter.all': 'All Regions',
    'voyages.duration': 'Duration',
    'voyages.pickup': 'Pickup Point',
    'voyages.book': 'Book Now',
    'voyages.days': 'days',
    
    // Booking
    'booking.title': 'Book Your Adventure',
    'booking.name': 'Full Name',
    'booking.phone': 'Phone Number',
    'booking.email': 'Email Address',
    'booking.trip': 'Select Trip',
    'booking.people': 'Number of People',
    'booking.pickup': 'Pickup Point',
    'booking.notes': 'Additional Notes',
    'booking.submit': 'Submit Booking',
    'booking.currency': 'DZD',
    
    // Portfolio
    'portfolio.title': 'Portfolio & Gallery',
    'portfolio.subtitle': 'Memories from our exclusive adventures',
    
    // Admin
    'admin.title': 'Admin Dashboard',
    'admin.login': 'Login',
    'admin.logout': 'Logout',
    'admin.trips': 'Manage Trips',
    'admin.bookings': 'View Bookings',
    'admin.gallery': 'Manage Gallery',
    'admin.export': 'Export CSV',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.voyages': 'Voyages',
    'nav.booking': 'Réservation',
    'nav.portfolio': 'Portfolio',
    'nav.admin': 'Admin',
    
    // Homepage
    'home.hero.title': 'Découvrez les Trésors Cachés de l\'Algérie',
    'home.hero.subtitle': 'Expériences de voyage exclusives pour les âmes aventureuses',
    'home.hero.cta': 'Explorer Nos Voyages',
    'home.instagram': 'Suivez Notre Voyage',
    
    // Voyages
    'voyages.title': 'Nos Voyages Exclusifs',
    'voyages.search': 'Rechercher des destinations...',
    'voyages.filter.all': 'Toutes les Régions',
    'voyages.duration': 'Durée',
    'voyages.pickup': 'Point de Ramassage',
    'voyages.book': 'Réserver',
    'voyages.days': 'jours',
    
    // Booking
    'booking.title': 'Réservez Votre Aventure',
    'booking.name': 'Nom Complet',
    'booking.phone': 'Numéro de Téléphone',
    'booking.email': 'Adresse Email',
    'booking.trip': 'Sélectionner le Voyage',
    'booking.people': 'Nombre de Personnes',
    'booking.pickup': 'Point de Ramassage',
    'booking.notes': 'Notes Supplémentaires',
    'booking.submit': 'Soumettre la Réservation',
    'booking.currency': 'DZD',
    
    // Portfolio
    'portfolio.title': 'Portfolio et Galerie',
    'portfolio.subtitle': 'Souvenirs de nos aventures exclusives',
    
    // Admin
    'admin.title': 'Tableau de Bord Admin',
    'admin.login': 'Connexion',
    'admin.logout': 'Déconnexion',
    'admin.trips': 'Gérer les Voyages',
    'admin.bookings': 'Voir les Réservations',
    'admin.gallery': 'Gérer la Galerie',
    'admin.export': 'Exporter CSV',
  }
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
