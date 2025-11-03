import React from 'react';

// Um componente simples sem props
const Footer: React.FC = () => {
  return (
    // Classes do Tailwind para o rodapé
    <footer className="w-full bg-gray-100 p-6 text-center text-gray-600 mt-12 border-t border-gray-200">
      <div className="container mx-auto">
        <p className="mb-0">&copy; {new Date().getFullYear()} MeuPrimeiroReact. Todos os direitos reservados.</p>
        <p className="text-sm mt-1 mb-0">Feito com ❤️ e React.</p>
      </div>
    </footer>
  );
}

export default Footer;

