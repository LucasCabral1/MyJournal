import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Zap, Info, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import { useAuthStore } from '../stores/AuthStore'; // 1. (NOVO) Importamos o store
import toast from 'react-hot-toast';

// Interface para o tipo 'Article'
interface Article {
  id: number;
  title: string;
  url: string;
  topic: string;
  published_at: string;
}

// URL Base da sua API (inferida da URL de login)
const API_BASE_URL = 'http://127.0.0.1:8001/api';

const HomePage: React.FC = () => {
  // Estados do componente (como antes)
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. (NOVO) Pegamos o token diretamente do store do Zustand
  const token = useAuthStore((state) => state.token); //

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // 3. (ATUALIZADO) Verificamos se o token existe no store
        if (!token) { //
          throw new Error('Usuário não autenticado. Por favor, faça login.');
        }

        // 4. (ATUALIZADO) Usamos a URL correta da API
        const response = await fetch(`${API_BASE_URL}/articles/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Usamos o token pego do store
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (!response.ok) {
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
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [token]); // 5. (NOVO) Adicionamos 'token' como dependência
               // Se o token mudar (ex: login/logout), o useEffect roda de novo.

  // (O resto do seu componente: 'renderArticleContent', 'return', etc.
  // permanece exatamente o mesmo do exemplo anterior)

  // ... (função renderArticleContent() idêntica à anterior) ...
  const renderArticleContent = () => {
    // Caso 1: Carregando
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <Loader2 size={24} className="animate-spin" />
          <span className="ml-2">Carregando seus artigos...</span>
        </div>
      );
    }

    // Caso 2: Erro
    if (error) {
      return (
        <div className="flex justify-center items-center py-10 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertTriangle size={24} />
          <span className="ml-2">{error}</span>
        </div>
      );
    }

    // Caso 3: Sucesso, mas sem artigos
    if (articles.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <p>Você ainda não possui artigos salvos.</p>
        </div>
      );
    }

    // Caso 4: Sucesso com artigos (renderiza a tabela)
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
                    target="_blank" // Abre em nova aba
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

  // O return principal (sem alterações)
  return (
    <div className="container mx-auto my-12 px-4">
      {/* Bloco de Boas-Vindas */}
      <div className="p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className="inline-flex items-center justify-center p-4 bg-cyan-100 text-cyan-700 rounded-full mb-6"
        >
          <Home size={40} />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Bem-vindo ao <span className="text-cyan-600">Meu Primeiro Site React</span>!
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-4 mb-8">
          Este é um exemplo de como construir um site moderno e rápido usando React, Vite e Tailwind CSS.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button icon={<Zap size={18} />}>Comece Agora</Button>
          <Button variant="secondary" icon={<Info size={18} />}>
            Saber Mais
          </Button>
        </div>
      </div>

      {/* Seção da Tabela de Artigos */}
      <div className="mt-12 p-8 md:p-12 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Seus Artigos Salvos
        </h2>
        {renderArticleContent()}
      </div>
    </div>
  );
}

export default HomePage;