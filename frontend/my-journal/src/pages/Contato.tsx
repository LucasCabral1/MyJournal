import React from 'react';
import { Mail, Server } from 'lucide-react';
import Button from '../components/Button';

const ContatoPage: React.FC = () => {
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    console.log("Formulário enviado! (Lógica de envio não implementada)");
  };

  return (
    <div className="container mx-auto my-12 px-4">
      <div className="p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="inline-flex p-4 bg-green-100 text-green-700 rounded-full mr-4">
            <Mail size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-0">Entre em Contato</h1>
        </div>
        <p className="text-lg text-gray-600 mb-6">
          Adoraríamos ouvir você! Preencha o formulário abaixo.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Seu nome"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="voce@exemplo.com"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
            <textarea
              id="message"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Sua mensagem..."
              required
            ></textarea>
          </div>
          <div>
            <Button type="submit" variant="success" icon={<Server size={18} />}>
              Enviar Mensagem
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContatoPage;

