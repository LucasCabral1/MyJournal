import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {  Zap, Info, ExternalLink, AlertTriangle, Newspaper } from 'lucide-react';
import Button from '../components/Button';
import { useAuthStore } from '../stores/authStore'; 
import toast from 'react-hot-toast';
import ValidadeUrl from '../components/ValidateUrl';
import Loader from '../components/Loading/Loading';
interface Article {
  id: number;
  title: string;
  url: string;
  topic: string;
  published_at: string;
}

const API_BASE_URL = 'http://127.0.0.1:8001/api';

const HomePage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useAuthStore((state) => state.token); //

  useEffect(() => {
    const fetchArticles = async () => {
      try {

        if (!token) {
          throw new Error('Usuário não autenticado. Por favor, faça login.');
        }

        const response = await fetch(`${API_BASE_URL}/articles/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (!response.ok) {
            toast.error('Falha ao buscar os artigos.');
          throw new Error('Falha ao buscar os artigos.');
        }

        const data: Article[] = await response.json();
        setArticles(data);
      } catch (err: unknown) {
        let errorMessage = 'Ocorreu um erro inesperado.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(true);
      }
    };

    fetchArticles();
  }, [token]); 
  const renderArticleContent = () => {

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <div className="flex justify-center items-center h-96">
          <Loader size="lg" />
          </div>
        </div>
      );
    }


    if (error) {
      return (
        <div className="flex justify-center items-center py-10 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertTriangle size={24} />
          <span className="ml-2">{error}</span>
        </div>
      );
    }

    if (articles.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <p>Você ainda não possui artigos salvos.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">Título</th>
              <th scope="col" className="py-3 px-6">Tópico</th>
              <th scope="col" className="py-3 px-6">Publicado em</th>
              <th scope="col" className="py-3 px-6">Link</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                  {article.title}
                </th>
                <td className="py-4 px-6">{article.topic}</td>
                <td className="py-4 px-6">
                  {new Date(article.published_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-4 px-6">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center font-medium text-cyan-600 hover:underline"
                  >
                    Ver Artigo <ExternalLink size={14} className="ml-1" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    <div className="container mx-auto my-12 px-4">
      <div className="p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className="inline-flex items-center justify-center p-4 bg-cyan-100 text-cyan-700 rounded-full mb-6"
        >
         <Newspaper size={30} />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Bem-vindo ao <span className="text-cyan-600">MyJournal</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-4 mb-8">
          Seu agregador de notícias diário, feito sob medida para seus interesses.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button icon={<Zap size={18} />}>Comece Agora</Button>
          <Button variant="secondary" icon={<Info size={18} />}>
            Saber Mais
          </Button>
        </div>
      </div>

      <div className="mt-12 p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Seus Artigos Salvos
        </h2>
        {renderArticleContent()}
      </div>

      <div className='mt-12 p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100'>
        <ValidadeUrl />
        </div>

      
      
    </div>
  );
}

export default HomePage;