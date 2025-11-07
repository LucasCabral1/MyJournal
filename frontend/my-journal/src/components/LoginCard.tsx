// src/components/LoginCard.tsx

import React, { useState } from 'react';
// <-- 1. O ícone 'Chrome' não é mais necessário aqui
import { Mail, Lock } from 'lucide-react'; 
// <-- 2. Importamos o componente real do Google e o tipo da resposta
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';

import { useAuthStore } from '../stores/AuthStore';

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
      // 3. Fazer a chamada ao backend
      const response = await fetch('http://127.0.0.1:8001/api/login', { // Mude para a URL real do seu backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // 4. Verificar se a resposta do backend foi bem-sucedida
      if (!response.ok) {
        // Se o backend retornar um erro (ex: 401, 400),
        // tentamos ler a mensagem de erro que ele enviou
        const errorData = await response.json();
        toast.error(errorData.message || 'Credenciais inválidas.');
      }

      const data = await response.json(); 
      
      // 4. CHAME A FUNÇÃO DO STORE AQUI!
      // (Assumindo que o token vem em 'data.access_token')
      setToken(data.access_token);

      // 5. Se o login deu certo (sucesso)
      // O backend pode retornar um token, dados do usuário, etc.
      // const data = await response.json(); 
      // Ex: salvarToken(data.token);


    } catch (err: unknown) {
     let errorMessage = 'Ocorreu um erro inesperado.';
  
    if (err instanceof Error) {
      // Isso vai pegar o erro que lançamos acima (throw new Error)
      // ou erros de rede
      errorMessage = err.message;
    }
  
  toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manipula o SUCESSO do login com Google.
   * Esta função é chamada pela biblioteca, não por um 'onClick'.
   */
  // <-- 3. Esta é a nova função de sucesso
  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    console.log('Login com Google bem-sucedido. Resposta:', credentialResponse);
    if (credentialResponse.credential) {
      setToken(credentialResponse.credential);
      toast.success('Login com Google bem-sucedido!');
    } else {
      toast.error('Credencial do Google não encontrada.');
    }
  };

  /**
   * Manipula o ERRO do login com Google.
   */
  // <-- 4. Adicionamos um handler de erro
  const handleGoogleError = () => {
    console.error('Login com Google falhou');
    toast.error('Erro desconhecido ao fazer login.');
    
  };

  // As funções handleForgotPassword e handleCreateAccount permanecem iguais...
  const handleForgotPassword = () => { /* ... */ };
  //const handleCreateAccount = () => { /* ... */ };


  // --- Renderização do Componente ---

  return (
    <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-xl shadow-lg">
      
      <h1 className="text-3xl font-bold text-center text-gray-900">
        Acesse sua conta
      </h1>

      {/* 5. Botão de Login com Google SUBSTITUÍDO */}
      {/* Este componente <GoogleLogin> renderiza o botão oficial
        "Sign in with Google" e cuida de todo o fluxo de pop-up.
      */}
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess} // Conecta à nossa função de sucesso
          onError={handleGoogleError}     // Conecta à nossa função de erro
          useOneTap                       // (Opcional) Tenta o login "um toque"
          theme="outline"                 // (Opcional) Estilo do botão
          size="large"                    // (Opcional) Tamanho do botão
        />
      </div>

      {/* 3. Divisor "OU" */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-sm font-medium text-gray-500">
          OU
        </span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* 4. Formulário de Email e Senha (sem alteração) */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        
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

        {/* Link de "Esqueceu a senha?" */}
        <div className="text-right">
          <button
            type="button" 
            onClick={handleForgotPassword}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Esqueceu a senha?
          </button>
        </div>

        {/* Botão de Login Principal */}
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

      {/* 5. Link para Criar Conta (sem alteração) */}
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