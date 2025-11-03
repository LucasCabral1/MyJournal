// src/components/LoginCard.tsx

import React, { useState } from 'react';
// Importando ícones para os campos e o botão do Google
import { Mail, Lock, Chrome } from 'lucide-react';

// 1. Definição da Interface de Props
// <-- CORREÇÃO: Define o "contrato" de props que o componente aceita.
// Isso resolve o erro 'Property 'onLoginSuccess' does not exist on type 'IntrinsicAttributes''.
interface LoginCardProps {
  onLoginSuccess: () => void; // Espera uma função passada pelo componente pai (App.tsx)
}

/**
 * Componente LoginCard
 * Um card de formulário para autenticação de usuário, oferecendo login
 * com Google, email/senha, e links para recuperação e criação de conta.
 */

// 2. Assinatura da Função do Componente
// <-- CORREÇÃO: O componente agora aceita 'props' e desestrutura 'onLoginSuccess' delas.
export function LoginCard({ onLoginSuccess }: LoginCardProps) {
  
  // Estados para controlar os campos de email e senha
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // --- Funções de Handler (Lógica de Autenticação) ---

  /**
   * Manipula o envio do formulário de email e senha.
   */
  const handleEmailLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Impede o recarregamento da página
    console.log('Tentativa de login com:', { email, password });
    
    // TODO: Adicionar lógica de login real (chamar API, Firebase, etc.)
    // Ex: if (loginFoiValido) {
    
    // 3. Chamar a prop
    // <-- CORREÇÃO: Avisa o App.tsx que o login foi bem-sucedido.
    onLoginSuccess();
    
    // }
  };

  /**
   * Manipula o clique no botão de login com Google.
   */
  const handleGoogleLogin = () => {
    console.log('Iniciando login com Google...');
    
    // TODO: Adicionar lógica de login com Google
    
    // 3. Chamar a prop
    // <-- CORREÇÃO: Avisa o App.tsx que o login foi bem-sucedido.
    onLoginSuccess();
  };

  /**
   * Manipula o clique no link "Esqueceu a senha?".
   */
  const handleForgotPassword = () => {
    console.log('Redirecionando para "Esqueci a senha" para o email:', email);
    // TODO: Adicionar lógica de recuperação de senha
  };

  /**
   * Manipula o clique no link "Criar uma conta".
   */
  const handleCreateAccount = () => {
    console.log('Redirecionando para a página de criação de conta...');
    // TODO: Adicionar lógica de navegação (ex: "navigate('/register')")
  };


  // --- Renderização do Componente ---

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
      
      {/* 1. Cabeçalho */}
      <h1 className="text-3xl font-bold text-center text-gray-900">
        Acesse sua conta
      </h1>

      {/* 2. Botão de Login com Google */}
      <button
        // 4. Conectar o Handler
        // <-- CORREÇÃO: Conecta a função ao evento onClick.
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg 
                   font-medium text-gray-700 hover:bg-gray-50 transition-colors
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Chrome className="w-5 h-5 mr-3" />
        Continuar com Google
      </button>

      {/* 3. Divisor "OU" */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-sm font-medium text-gray-500">
          OU
        </span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* 4. Formulário de Email e Senha */}
      {/* O 'onSubmit' já estava correto, disparando 'handleEmailLogin' */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        
        {/* Campo de Email */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-700"
          >
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
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-gray-700"
          >
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
            type="button" // Evita o submit do formulário
            onClick={handleForgotPassword}
            className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
          >
            Esqueceu a senha?
          </button>
        </div>

        {/* Botão de Login Principal */}
        <button
          type="submit"
          className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white 
                     font-semibold rounded-lg shadow-md hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     transition-colors"
        >
          Entrar
        </button>

      </form>

      {/* 5. Link para Criar Conta */}
      <p className="text-sm text-center text-gray-600">
        Não tem uma conta?{' '}
        <button
          type="button"
          onClick={handleCreateAccount}
          className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
        >
          Crie uma aqui
        </button>
      </p>

    </div>
  );
}