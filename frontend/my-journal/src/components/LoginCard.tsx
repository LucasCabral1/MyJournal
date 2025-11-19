// src/components/LoginCard.tsx

import React, { useState } from 'react';
// <-- 1. O ícone 'Chrome' não é mais necessário aqui
import { Mail, Lock } from 'lucide-react'; 
// <-- 2. Importamos o componente real do Google e o tipo da resposta
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';

import { useAuthStore } from '../stores/store';
import { Label } from 'flowbite-react';

interface LoginCardProps {
  onNavigateToRegister: () => void;
}

export function LoginCard({ onNavigateToRegister }: LoginCardProps) {
  
  const setToken = useAuthStore((state) => state.setToken);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');


  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setIsLoading(true);   

    try {
      const response = await fetch('http://127.0.0.1:8001/api/login', { // Mude para a URL real do seu backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {

        const errorData = await response.json();
        toast.error(errorData.message || 'Credenciais inválidas.');
      }

      const data = await response.json(); 
      toast.success('Login realizado com sucesso!');
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


  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    console.log('Login com Google bem-sucedido. Resposta:', credentialResponse);
    if (credentialResponse.credential) {
      setToken(credentialResponse.credential);
      toast.success('Login com Google bem-sucedido!');
    } else {
      toast.error('Credencial do Google não encontrada.');
    }
  };


  const handleGoogleError = () => {
    console.error('Login com Google falhou');
    toast.error('Erro desconhecido ao fazer login.');
    
  };

  const handleForgotPassword = () => { /* ... */ };
  return (
    <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
      
      <h1 className="text-3xl font-bold text-center text-gray-900">
        Acesse sua conta
      </h1>

      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess} 
          onError={handleGoogleError}     
          useOneTap                       
          theme="outline"                 
          size="large"                    
        />
      </div>

      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-sm font-medium text-gray-500">
          OU
        </span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </Label>
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg
                         shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sua senha"
            />
          </div>
        </div>

        <div className="text-right">
          <button
            type="button" 
            onClick={handleForgotPassword}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Esqueceu a senha?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white 
                     font-semibold rounded-lg shadow-md hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-colors"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>

      </form>

      <p className="text-sm text-center text-gray-600">
        Não tem uma conta?{' '}
        <button
          type="button"
          onClick={onNavigateToRegister}
          className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
        >
          Crie uma aqui
        </button>
      </p>

    </div>
  );
}