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

// Tipamos o 'page' como uma união de literais
type PageId = 'home' | 'sobre' | 'contato';

const App: React.FC = () => {
  // 2. Adicionamos o estado de autenticação
  //    Começa como 'false' (deslogado) por padrão
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Seu estado de página existente
  const [page, setPage] = useState<PageId>('home');

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

  // --- 3. O "Auth Guard" ---
  // Se o usuário NÃO estiver autenticado, renderize a tela de login.
  if (!isAuthenticated) {
    return (
      // Container para centralizar o LoginCard
      <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoginCard 
          // Passamos uma função para o LoginCard.
          // Quando o login for bem-sucedido, o LoginCard
          // deve chamar esta função.
          onLoginSuccess={() => setIsAuthenticated(true)} 
        />
      </main>
    );
  }

  // --- 4. O App Principal ---
  // Se o usuário ESTIVER autenticado, renderize seu aplicativo normal.
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header 
        onNavigate={(pageId) => setPage(pageId as PageId)} 
        // Precisamos de um jeito de deslogar.
        // Você pode adicionar um botão "Sair" no seu Header
        // que chama esta função.
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
  );
}

export default App;