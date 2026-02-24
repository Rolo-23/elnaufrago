import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import AdminDashboard from './components/AdminDashboard';
import BookingFlow from './components/BookingFlow';
import { ToastContainer } from './components/ui/Toast';
import { LoginModal } from './components/LoginModal';
import { BottomNav } from './components/BottomNav';
import { Button } from './components/ui/Button';
import { WhatsAppButton } from './components/WhatsAppButton';

type View = 'public' | 'admin';
const ADMIN_PASSWORD = 'trapking'; // Contraseña de acceso

const MainLayout = () => {
  const { appName } = useAppContext();
  const [view, setView] = useState<View>('public');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      installPromptEvent.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPromptEvent(null);
      });
    }
  };

  const handleAdminAccess = () => {
    if (isAdminAuthenticated) {
      setView('admin');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setView('admin');
      setShowLoginModal(false);
      return true;
    }
    return false;
  };
  
  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setView('public');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-brand-light tracking-wider">{appName}</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {installPromptEvent && (
                <Button onClick={handleInstallClick} size="sm" className="hidden sm:inline-flex">
                  Instalar App
                </Button>
              )}
              <div className="bg-gray-700 p-1 rounded-lg hidden md:flex items-center space-x-1">
                <button
                  onClick={() => setView('public')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    view === 'public' ? 'bg-brand text-gray-900' : 'text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Reservar Turno
                </button>
                <button
                  onClick={handleAdminAccess}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                    view === 'admin' && isAdminAuthenticated ? 'bg-brand text-gray-900' : 'text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Panel Admin
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        {view === 'public' && <BookingFlow />}
        {view === 'admin' && isAdminAuthenticated && <AdminDashboard onLogout={handleLogout} />}
      </main>

      <footer className="text-center py-4 mt-8 text-gray-500 border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} {appName}. Todos los derechos reservados.</p>
        <p className="text-sm mt-2">
          Desarrollado por 
          <a 
            href="https://wa.me/5492245401381" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-brand-light transition-colors"
          >
            Rolando Galetta-I26
          </a>
        </p>
      </footer>
      <ToastContainer />
      <WhatsAppButton />
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
      />
       <BottomNav
        view={view}
        onPublicClick={() => setView('public')}
        onAdminClick={handleAdminAccess}
        isAdminAuthenticated={isAdminAuthenticated}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}