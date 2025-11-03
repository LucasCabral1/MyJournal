import React from 'react';
import { motion } from 'framer-motion';
import { Home, Zap, Info } from 'lucide-react';
import Button from '../components/Button'; // Importamos nosso botão customizado

const HomePage: React.FC = () => {
  return (
    // 'container mx-auto my-12 px-4' centraliza, dá margem vertical e padding horizontal
    <div className="container mx-auto my-12 px-4 text-center">
      {/* 'p-8 md:p-12' = padding responsivo (maior em telas médias 'md' ou mais) */}
      <div className="p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          // Classes para o círculo do ícone
          className="inline-flex items-center justify-center p-4 bg-cyan-100 text-cyan-700 rounded-full mb-6"
        >
          <Home size={40} />
        </motion.div>
        {/* Classes de tipografia do Tailwind */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Bem-vindo ao <span className="text-cyan-600">Meu Primeiro Site React</span>!
        </h1>
        {/* 'max-w-3xl' define uma largura máxima para o parágrafo, melhorando a leitura */}
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-4 mb-8">
          Este é um exemplo de como construir um site moderno e rápido usando React, Vite e Tailwind CSS.
        </p>
        {/* 'flex-col sm:flex-row' = empilhado no mobile, lado a lado (linha) no desktop */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button icon={<Zap size={18} />}>Comece Agora</Button>
          <Button variant="secondary" icon={<Info size={18} />}>
            Saber Mais
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

