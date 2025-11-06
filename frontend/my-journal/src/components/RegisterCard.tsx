// src/components/RegisterCard.tsx

import React from 'react';

// 1. Defina as props, incluindo a função de 'voltar'
interface RegisterCardProps {
  onShowLogin: () => void;
}

export const RegisterCard = ({ onShowLogin }: RegisterCardProps) => {

  const handleGoBackToLogin = () => {
    onShowLogin();
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center">Criar Conta</h2>
      
      {/* ... (aqui fica seu formulário de REGISTRO: nome, email, senha) ... */}

      {/* Link para Voltar ao Login */}
      <p className="text-sm text-center text-gray-600">
        Já tem uma conta?{' '}
        <button
          type="button"
          onClick={handleGoBackToLogin}
          className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
        >
          Entre aqui
        </button>
      </p>
    </div>
  );
};