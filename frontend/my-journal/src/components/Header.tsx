import React from 'react';
import { Home, Info, Mail, Code, CircleUser } from 'lucide-react';


// Tipamos as props que o Header recebe
type HeaderProps = {
  // A função onNavigate recebe uma string (o ID da página) e não retorna nada (void)
  onNavigate: (pageId: string) => void;
  onLogout: () => void;
};

// Usamos React.FC (Functional Component) e passamos nossas props tipadas
const Header: React.FC<HeaderProps> = ({ onNavigate, onLogout }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: <Home size={18} /> },
    { id: 'sobre', label: 'Sobre', icon: <Info size={18} /> },
    { id: 'contato', label: 'Contato', icon: <Mail size={18} /> },
    { id: 'profile', label: 'Profile', icon: <CircleUser size={18} /> },
  ];

  return (
    // Classes do Tailwind para a barra de navegação
    <header className="w-full bg-gray-900 text-white shadow-md">
      {/* container mx-auto centraliza e define a largura máxima */}
      <div className="container mx-auto flex items-center justify-between p-4">
        <a className="flex items-center gap-2 text-lg font-bold" href="#!">
          <Code size={24} className="text-cyan-400" />
          <span>MeuPrimeiroReact</span>
        </a>
        <div className="flex flex-row gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              // Classes de utilitários do Tailwind para estilizar o botão de navegação
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
              aria-label={`Ir para ${item.label}`}
            >
              {item.icon}
              {/* 'hidden sm:inline' = 'd-none d-sm-inline' (escondido em telas pequenas, visível de 'sm' para cima) */}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
          <button 
          onClick={onLogout} 
          className="p-2 text-red-600 font-medium"
        >
          Sair
        </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

