import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {  Zap, Info, AlertTriangle, Newspaper, RefreshCw } from 'lucide-react';
import Button from '../components/Button';
import { useArticleStore, useAuthStore } from '../stores/store'; 
import toast from 'react-hot-toast';
import ValidadeUrl from '../components/ValidateUrl';
import Loader from '../components/Loading/Loading';
import RefreshDialog, { type RefreshStatus } from '../components/RefreshDialog';
import ArticlesTable from '../components/Table';


const API_BASE_URL = '/api';

const HomePage: React.FC = () => {
 const { articles, setArticles, hasLoaded, setHasLoaded } = useArticleStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<RefreshStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const token = useAuthStore((state) => state.token); 

  useEffect(() => {
    const fetchArticles = async () => {
      try {

        if (!token) {
          throw new Error('Usuário não autenticado. Por favor, faça login.');
        }

        if (hasLoaded) {
        setIsLoading(false);
        return;
      }

        const responseRefresh = await fetch(`${API_BASE_URL}/articles/me/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (responseRefresh.status === 401) {
          toast.error('Sessão expirada. Por favor, faça login novamente.');
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (!responseRefresh.ok) {
            toast.error('Falha ao buscar os artigos atualizados.');
          throw new Error('Falha ao buscar os artigos atualizados.');
        }

        const data = await responseRefresh.json();


        setArticles(data.articles);
        setHasLoaded(true);
      } catch (err: unknown) {
        let errorMessage = 'Ocorreu um erro inesperado.';
        if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [token, hasLoaded, setArticles, setHasLoaded]); 


  const handleManualRefresh = async () => {
    if (!token) {
      toast.error('Usuário não autenticado. Por favor, faça login.');
      return;
    }
    setIsRefreshing(true); 
    try {
      const responseRefresh = await fetch(`${API_BASE_URL}/articles/me/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (responseRefresh.status === 401) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        return; 
      }

      const data = await responseRefresh.json();

      if (!responseRefresh.ok) {
        throw new Error(data.message || 'Falha ao atualizar os artigos.');
      }

      setArticles(data.articles);    

      const refreshData: RefreshStatus = {
        message: data.message || 'Busca de novos artigos finalizada.',
        new_articles_found: data.refresh_details.new_articles_found, 
        total_articles: data.articles.length  
      }; 
      setRefreshResult(refreshData);        
      setIsDialogOpen(true);         
      toast.success(data.message || 'Artigos atualizados!');

    } catch (err: unknown) {
      let errorMessage = 'Ocorreu um erro inesperado.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage); 
    } finally {
      setIsRefreshing(false); 
    }
  };

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
          <AlertTriangle size={20} />
          <span className="ml-2">{error}</span>
        </div>
      );
    }else {
      return <ArticlesTable articles={articles} />;
    }

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
          <Button icon={<Zap size={18} />} >Comece Agora</Button>
          <Button variant="secondary" icon={<Info size={18} />}>
            Saber Mais
          </Button>
        </div>
      </div>

      <div className="mt-12 p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Seus Artigos Salvos
        </h2>
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            icon={isRefreshing ? <Loader size="sm" /> : <RefreshCw size={18} />}
          >
            {isRefreshing ? 'Atualizando...' : 'Atualizar Artigos'}
          </Button>
        </div>

        {renderArticleContent()}
      </div>

      <div className='mt-12 p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100'>
        <ValidadeUrl />
        </div>

      
   
      <RefreshDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        refreshData={refreshResult}
      />
    </div>
  );
}

export default HomePage;