import React from 'react';
import { User } from 'lucide-react';

const SobrePage: React.FC = () => {
  return (
    <div className="container mx-auto my-12 px-4">
      {/* 'max-w-4xl mx-auto' centraliza o card e limita sua largura */}
      <div className="p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="inline-flex p-4 bg-blue-100 text-blue-700 rounded-full mr-4">
            <User size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-0">Sobre Nós</h1>
        </div>
        <p className="text-xl text-gray-600">
          Somos uma equipe fictícia apaixonada por ensinar desenvolvimento web moderno.
        </p>
        <p className="text-gray-700 mt-4">
          Este projeto foi criado para demonstrar os conceitos fundamentais do React de uma forma clara e prática:
        </p>
        {/* 'space-y-2' = adiciona espaço vertical entre os filhos (os 'li') */}
        {/* 'divide-y divide-gray-200' = adiciona uma borda (divisor) entre os itens */}
        <ul className="mt-4 space-y-2 divide-y divide-gray-200">
          <li className="pt-2">Componentização (Header, Footer, Button)</li>
          <li className="pt-2">Gerenciamento de Estado (useState para navegação)</li>
          <li className="pt-2">Estilização com Tailwind CSS</li>
          <li className="pt-2">Ícones (Lucide-React)</li>
          <li className="pt-2">Animações (Framer Motion)</li>
        </ul>
      </div>
    </div>
  );
}

export default SobrePage;

