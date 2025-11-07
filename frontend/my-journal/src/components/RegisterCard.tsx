// src/components/RegisterCard.tsx

import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/AuthStore';
interface RegisterCardProps {

  // Chamada para voltar à tela de login
  onNavigateToLogin: () => void;
}

export function RegisterCard({ onNavigateToLogin }: RegisterCardProps) {
  
  const setToken = useAuthStore((state) => state.setToken);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    
    if (password !== confirmPassword) {
      toast.error('As senhas não conferem.');
      return;
    }
    
    setIsLoading(true);   

    try {
      // 1. Fazer a chamada ao backend para REGISTRAR
      const response = await fetch('http://127.0.0.1:8001/api/register', { // Mude para a URL real do seu backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: name, email, password }),
      });

      // 2. Verificar se a resposta do backend foi bem-sucedida
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Não foi possível criar a conta.');
      }

      const data = await response.json();
      toast.success('Conta criada com sucesso!');

      // 4. CHAME A FUNÇÃO DO STORE AQUI!
      setToken(data.access_token);

    

    } catch (err: unknown) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
      
      <h1 className="text-3xl font-bold text-center text-gray-900">
        Crie sua conta
      </h1>

      <form onSubmit={handleRegister} className="space-y-4">
        
        {/* Campo de Nome */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                         shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Seu nome"
            />
          </div>
        </div>

        {/* Campo de Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                         shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="voce@email.com"
            />
          </div>
        </div>

        {/* Campo de Senha */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                         shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Crie uma senha forte"
            />
          </div>
        </div>

        {/* Campo de Confirmar Senha */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar Senha
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                         shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Repita sua senha"
            />
          </div>
        </div>

        {/* Botão de Registro Principal */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white 
                     font-semibold rounded-lg shadow-md hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-colors"
        >
          {isLoading ? 'Criando conta...' : 'Criar conta'}
        </button>

      </form>

      {/* 5. Link para voltar ao Login */}
      <p className="text-sm text-center text-gray-600">
        Já tem uma conta?{' '}
        <button
          type="button"
          onClick={onNavigateToLogin} // Chama a prop para voltar
          className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
        >
          Entre aqui
        </button>
      </p>

    </div>
  );
}