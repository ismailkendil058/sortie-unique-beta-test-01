import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Trees, Mountain, Settings, LogOut, LogIn, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}
const Layout = ({
  children
}: LayoutProps) => {
  const {
    language,
    setLanguage,
    t
  } = useLanguage();
  const {
    user,
    signOut
  } = useAuth();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const handleSignOut = async () => {
    await signOut();
  };
  return <div className="min-h-screen bg-background">
      <nav className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-gray-100 sticky top-0 z-50 rounded-b-2xl mx-2 mt-2">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Name */}
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary hover:text-orange-600 transition-colors">
              <MapPin className="w-8 h-8 text-orange-500 bg-white rounded-full p-1 shadow-md border-2 border-orange-200" />
              <span className="tracking-tight">Sortie Unique</span>
            </Link>

            {/* Divider for large screens */}
            <div className="hidden md:block h-8 w-px bg-gray-200 mx-6 rounded-full" />

            {/* Right controls */}
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')} className="text-gray-700 hover:text-primary rounded-full border border-gray-200 hover:border-primary px-2 py-1 text-sm font-medium transition-colors">
                {language === 'en' ? 'FR' : 'EN'}
              </Button>
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary px-2 py-1 text-sm font-medium transition-colors">
                  <Settings className="w-3 h-3 mr-1" />
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
      
      <footer className="bg-gradient-to-br from-green-50 to-orange-50 border-t border-gray-100 mt-20 relative overflow-hidden">
        {/* Natural background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-green-200/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <MapPin className="w-10 h-10 text-orange-500 bg-white rounded-full p-2 shadow-md border-2 border-orange-200" />
              <h3 className="text-2xl font-bold text-primary">Sortie Unique</h3>
            </div>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
              {language === 'en' ? 'Connecting you with Algeria\'s pristine natural beauty and authentic cultural experiences' : 'Vous connecter avec la beauté naturelle pristine de l\'Algérie et les expériences culturelles authentiques'}
            </p>
            <div className="flex justify-center space-x-6">
              <a href="https://www.instagram.com/sortieunique.dz?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-orange-600 transition-colors bg-white/80 px-4 py-2 rounded-full hover:bg-white shadow-md hover:shadow-lg">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Layout;
