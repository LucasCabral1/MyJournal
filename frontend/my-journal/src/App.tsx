// src/App.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Importe seus componentes ---
import Header from './components/Header';
import Footer from './components/Footer';
// 1. Importe o LoginCard que criamos
import { LoginCard } from './components/LoginCard';

// --- Importe suas páginas ---
import HomePage from './pages/Home';
import SobrePage from './pages/Sobre';
import ContatoPage from './pages/Contato';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { RegisterCard } from './components/RegisterCard';

import { useAuthStore } from './stores/authStore';
import ProfilePage from './pages/Profile';


type PageId = 'home' | 'sobre' | 'contato' | 'profile';
type AuthView = 'login' | 'register';

const App: React.FC = () => {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = !!token;

  const [page, setPage] = useState<PageId>('home');
  const [authView, setAuthView] = useState<AuthView>('login');

  const googleClientId = "55642435247-jp588e4b6rbsaq78s9m52po87pqpe62t.apps.googleusercontent.com";

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'sobre':
        return <SobrePage />;
      case 'contato':
        return <ContatoPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  const handleLogout = useAuthStore((state) => state.clearToken);


  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  } as const;

  const authCardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.95 },
  };

 return (
    <GoogleOAuthProvider clientId={googleClientId}>

      <Toaster 
        position="top-right" 
        reverseOrder={false}   
      />
      {!isAuthenticated ? (
        
        <main className="flex items-center justify-center min-h-screen bg-gray-100">
          <AnimatePresence mode="wait">
            {authView === 'login' ? (
              <motion.div
                key="login"
                variants={authCardVariants}
                initial="initial"
                animate="in"
                exit="out"
                className='w-full max-w-md'
                transition={{ duration: 0.2 }}
              >
                <LoginCard
                  onNavigateToRegister={() => setAuthView('register')} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="register"
                variants={authCardVariants}
                initial="initial"
                animate="in"
                exit="out"
                className='w-full max-w-md'
                transition={{ duration: 0.2 }}
              >
                <RegisterCard
                  onNavigateToLogin={() => setAuthView('login')}  
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

      ) : (

        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header 
            onNavigate={(pageId) => setPage(pageId as PageId)} 
            onLogout={() => {
              handleLogout();
              setAuthView('login'); 
            }}
          />
          
          <AnimatePresence mode="wait">
            <motion.main
              key={page} 
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
              className="flex-1"
            >
              {renderPage()}
            </motion.main>
          </AnimatePresence>
          
          <Footer />
        </div>

      )}
      
    </GoogleOAuthProvider>
  );

}

export default App;