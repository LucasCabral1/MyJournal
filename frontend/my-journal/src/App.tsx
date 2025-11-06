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

// Tipamos o 'page' como uma união de literais
type PageId = 'home' | 'sobre' | 'contato';

const App: React.FC = () => {
  // 2. Adicionamos o estado de autenticação
  //    Começa como 'false' (deslogado) por padrão
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Seu estado de página existente
  const [page, setPage] = useState<PageId>('home');

  const googleClientId = "55642435247-jp588e4b6rbsaq78s9m52po87pqpe62t.apps.googleusercontent.com";

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'sobre':
        return <SobrePage />;
      case 'contato':
        return <ContatoPage />;
      default:
        return <HomePage />;
    }
  };

  // Suas animações (sem alteração)
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

 return (
    // O Provedor envolve TODA a aplicação
    <GoogleOAuthProvider clientId={googleClientId}>
      
      {/* Usamos um operador ternário para decidir o que renderizar
        baseado no estado 'isAu
        thenticated'.
      */}
      <Toaster 
        position="top-right" // Posição (opcional)
        reverseOrder={false}   // Ordem (opcional)
      />
      {!isAuthenticated ? (
        
        // --- O "Auth Guard" (Se NÃO estiver autenticado) ---
        <main className="flex items-center justify-center min-h-screen bg-gray-100">
          <LoginCard 
            // Esta prop agora funciona como esperado, pois o LoginCard
            // está DENTRO do GoogleOAuthProvider
            onLoginSuccess={() => setIsAuthenticated(true)} 
          />
        </main>

      ) : (

        // --- O App Principal (Se ESTIVER autenticado) ---
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header 
            onNavigate={(pageId) => setPage(pageId as PageId)} 
            onLogout={() => setIsAuthenticated(false)}
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
      
    </GoogleOAuthProvider> // <-- Fim do Provedor
  );

}

export default App;